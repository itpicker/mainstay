from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any, Generator
import requests
import json
import os
from backend.db import supabase
from backend.dependencies import get_current_user

import logging

# Configure logging to file
logging.basicConfig(
    filename='chat_debug.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    force=True
)

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

from backend.embeddings import get_embedding

# ... existing imports ...

def stream_llm(provider: str, model_id: str, messages: List[Dict[str, str]], api_key: Optional[str], base_url: Optional[str], agent_id: str) -> Generator[str, None, None]:
    """
    Generates SSE chunks from LLM and saves the full response to DB.
    """
    full_response_content = ""

    # 1. Ollama
    if provider.upper() == "OLLAMA":
        url = base_url or "http://localhost:11434"
        if not url.endswith("/api/chat"):
            url = f"{url.rstrip('/')}/api/chat"
            
        payload = {
            "model": model_id,
            "messages": messages,
            "stream": True, 
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
                            data = json.loads(line)
                            content = data.get("message", {}).get("content", "")
                            if content:
                                full_response_content += content
                                yield f"data: {json.dumps({'content': content})}\n\n"
                            if data.get("done"):
                                break
                        except Exception as e:
                            print(f"Error parsing chunk: {e}")
        except Exception as e:
             yield f"data: {json.dumps({'error': str(e)})}\n\n"

    # 2. OpenAI (Stub)
    elif provider.upper() in ["OPENAI", "ANTHROPIC"]:
         yield f"data: {json.dumps({'content': 'Streaming not yet supported for OpenAI/Anthropic in this demo.'})}\n\n"
    
    # --- PERSISTENCE: Save Agent Response ---
    if full_response_content:
        try:
            logging.info("Saving Agent response to DB...")
            embedding = get_embedding(full_response_content)
            
            completion_data = {
                "agent_id": agent_id,
                "role": "assistant",
                "content": full_response_content,
                "embedding": embedding,
                "metadata": {"model": model_id}
            }
            supabase.table("chat_messages").insert(completion_data).execute()
        except Exception as e:
             logging.error(f"Failed to save agent message: {e}")

    yield "event: done\ndata: [DONE]\n\n"

@router.post("/stream")
def chat_stream(request: ChatRequest, user = Depends(get_current_user)):
    """
    Stream a message response from an agent with RAG support.
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

    # --- RAG: Retrieve Context ---
    # Generate embedding for the new user message
    user_embedding = get_embedding(request.message)
    
    relevant_context = ""
    if user_embedding:
        try:
            # Call RPC function to find similar messages
            rpc_params = {
                "query_embedding": user_embedding,
                "match_threshold": 0.5, # Adjust threshold
                "match_count": 5,        # Retrieve top 5
                "filter_agent_id": request.agent_id
            }
            # Note: We filter by current agent to keep context relevant to this "persona", 
            # but you might want to search across all agents in the project eventually.
            
            matches = supabase.rpc("match_chat_messages", rpc_params).execute()
            
            if matches.data:
                context_texts = [f"- {m['content']}" for m in matches.data]
                relevant_context = "\\n".join(context_texts)
                logging.info(f"RAG: Found {len(matches.data)} relevant messages.")
        except Exception as e:
            logging.error(f"RAG Retrieval failed: {e}")
    
    # --- PERSISTENCE: Save User Message ---
    try:
        msg_data = {
            "agent_id": request.agent_id,
            "role": "user",
            "content": request.message,
            "embedding": user_embedding,
            "metadata": {}
        }
        supabase.table("chat_messages").insert(msg_data).execute()
    except Exception as e:
        logging.error(f"Failed to save user message: {e}")

    
    # 3. Construct Context
    system_prompt = f"You are {agent.get('name')}, a {agent.get('role')} in a software project."
    if agent.get("goal"):
        system_prompt += f"\\nYour goal: {agent.get('goal')}"
    
    # Inject RAG Context into System Prompt
    if relevant_context:
        system_prompt += f"\\n\\n[Relevant Context from Previous Conversations]:\\n{relevant_context}\\n[End Context]"

    # Merge history
    llm_messages = [{"role": "system", "content": system_prompt}]
    for msg in request.history:
        role = "assistant" if msg.role == "agent" else msg.role
        llm_messages.append({"role": role, "content": msg.content})
    llm_messages.append({"role": "user", "content": request.message})

    # DEBUG: Log to file
    logging.info(f"--- LLM Context Debug [Agent: {request.agent_id}] ---")
    for m in llm_messages:
        content_preview = m['content'][:100] + "..." if len(m['content']) > 100 else m['content']
        logging.info(f"[{m['role']}]: {content_preview}")
    logging.info("-------------------------")

    # 4. Return Streaming Response
    return StreamingResponse(
        stream_llm(provider, model_id, llm_messages, api_key, base_url, request.agent_id),
        media_type="text/event-stream"
    )

# Keeping the blocking endpoint for backward compatibility if needed, or remove it.
# Ideally we replace logic of previous endpoint or keep both.
# I will keep /message for now but user wants improvement so frontend will switch to /stream.
