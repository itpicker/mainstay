from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any, Generator
import requests
import json
import os
from backend.db import supabase
from backend.dependencies import get_current_user

router = APIRouter(
    prefix="/chat",
    tags=["chat"],
    dependencies=[Depends(get_current_user)]
)

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    agent_id: str
    message: str
    history: List[ChatMessage] = []

class ChatResponse(BaseModel):
    response: str

def get_model_config(model_id: str):
    try:
        response = supabase.table("ai_models").select("*").eq("model_id", model_id).execute()
        if response.data:
            return response.data[0]
        return None
    except Exception as e:
        print(f"Error fetching model config: {e}")
        return None

def stream_llm(provider: str, model_id: str, messages: List[Dict[str, str]], api_key: Optional[str], base_url: Optional[str]) -> Generator[str, None, None]:
    """Generates SSE chunks from LLM."""
    
    # 1. Ollama
    if provider.upper() == "OLLAMA":
        url = base_url or "http://localhost:11434"
        if not url.endswith("/api/chat"):
            url = f"{url.rstrip('/')}/api/chat"
            
        payload = {
            "model": model_id,
            "messages": messages,
            "stream": True, # Enable streaming
            "options": {
                "num_ctx": 4096
            }
        }
        
        try:
            print(f"DEBUG: Streaming from Ollama at {url}")
            with requests.post(url, json=payload, stream=True, timeout=60) as res:
                res.raise_for_status()
                for line in res.iter_lines():
                    if line:
                        try:
                            # Ollama returns JSON object per line
                            data = json.loads(line)
                            content = data.get("message", {}).get("content", "")
                            if content:
                                yield f"data: {json.dumps({'content': content})}\n\n"
                            if data.get("done"):
                                break
                        except Exception as e:
                            print(f"Error parsing chunk: {e}")
        except Exception as e:
             yield f"data: {json.dumps({'error': str(e)})}\n\n"

    # 2. OpenAI (Example stub)
    elif provider.upper() in ["OPENAI", "ANTHROPIC"]:
         yield f"data: {json.dumps({'content': 'Streaming not yet supported for OpenAI/Anthropic in this demo.'})}\n\n"
    
    yield "event: done\ndata: [DONE]\n\n"

@router.post("/stream")
def chat_stream(request: ChatRequest, user = Depends(get_current_user)):
    """
    Stream a message response from an agent.
    """
    # 1. Fetch Agent
    try:
        agent_res = supabase.table("agents").select("*").eq("id", request.agent_id).execute()
        if not agent_res.data:
            raise HTTPException(status_code=404, detail="Agent not found")
        agent = agent_res.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB Error: {str(e)}")

    # 2. Determine Model
    model_id = agent.get("model") or "gpt-4-turbo"
    model_config = get_model_config(model_id)
    
    provider = "OPENAI"
    api_key = None
    base_url = None

    if model_config:
        provider = model_config.get("provider", "OPENAI")
        api_key = model_config.get("api_key")
        base_url = model_config.get("base_url")
    
    # 3. Construct Context
    system_prompt = f"You are {agent.get('name')}, a {agent.get('role')} in a software project."
    if agent.get("goal"):
        system_prompt += f"\nYour goal: {agent.get('goal')}"
    
    # Merge history
    llm_messages = [{"role": "system", "content": system_prompt}]
    for msg in request.history:
        role = "assistant" if msg.role == "agent" else msg.role
        llm_messages.append({"role": role, "content": msg.content})
    llm_messages.append({"role": "user", "content": request.message})

    # DEBUG: Print constructed messages to console
    print("\n--- LLM Context Debug ---")
    for m in llm_messages:
        print(f"[{m['role']}]: {m['content'][:50]}..." if len(m['content']) > 50 else f"[{m['role']}]: {m['content']}")
    print("-------------------------\n")

    # 4. Return Streaming Response
    return StreamingResponse(
        stream_llm(provider, model_id, llm_messages, api_key, base_url),
        media_type="text/event-stream"
    )

# Keeping the blocking endpoint for backward compatibility if needed, or remove it.
# Ideally we replace logic of previous endpoint or keep both.
# I will keep /message for now but user wants improvement so frontend will switch to /stream.
