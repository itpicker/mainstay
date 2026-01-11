from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
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
    """Fetch model configuration from the database."""
    # This assumes the model_id stored in agent (e.g. 'deepseek-r1:8b') matches the 'model_id' column in ai_models table
    # or we might need to look up by that ID.
    try:
        response = supabase.table("ai_models").select("*").eq("model_id", model_id).execute()
        if response.data:
            return response.data[0]
        return None
    except Exception as e:
        print(f"Error fetching model config: {e}")
        return None

def call_llm(provider: str, model_id: str, messages: List[Dict[str, str]], api_key: Optional[str], base_url: Optional[str]):
    """Generic LLM caller (Naive implementation for MVP)."""
    
    # 1. Ollama
    if provider.upper() == "OLLAMA":
        url = base_url or "http://localhost:11434"
        # Ensure URL ends with /api/chat
        if not url.endswith("/api/chat"):
            url = f"{url.rstrip('/')}/api/chat"
            
        payload = {
            "model": model_id,
            "messages": messages,
            "stream": False
        }
        
        try:
            print(f"DEBUG: Calling Ollama at {url} with model {model_id}")
            res = requests.post(url, json=payload, timeout=60)
            res.raise_for_status()
            return res.json().get("message", {}).get("content", "")
        except Exception as e:
            print(f"Ollama Call Failed: {e}")
            raise HTTPException(status_code=502, detail=f"Ollama connection failed: {str(e)}")

    # 2. OpenAI / Compatible
    elif provider.upper() in ["OPENAI", "ANTHROPIC"]: # Simplify Anthropic to use stored params if similar or error out
        # ... (OpenAI implementation would go here)
        return "OpenAI/Anthropic integration coming soon."

    return "Unsupported provider."

@router.post("/message", response_model=ChatResponse)
def chat_message(request: ChatRequest, user = Depends(get_current_user)):
    """
    Send a message to an agent and get a response.
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
    model_id = agent.get("model") or "gpt-4-turbo" # Fallback
    model_config = get_model_config(model_id)
    
    provider = "OPENAI" # Default
    api_key = None
    base_url = None

    if model_config:
        provider = model_config.get("provider", "OPENAI")
        api_key = model_config.get("api_key")
        base_url = model_config.get("base_url")
    
    # 3. Construct Context / System Prompt
    system_prompt = f"You are {agent.get('name')}, a {agent.get('role')} in a software project."
    if agent.get("goal"):
        system_prompt += f"\nYour goal: {agent.get('goal')}"
    
    # Merge history
    llm_messages = [{"role": "system", "content": system_prompt}]
    for msg in request.history:
        # Map 'agent' role to 'assistant' for LLM compatibility
        role = "assistant" if msg.role == "agent" else msg.role
        llm_messages.append({"role": role, "content": msg.content})
    llm_messages.append({"role": "user", "content": request.message})

    # 4. Call LLM
    try:
        response_text = call_llm(provider, model_id, llm_messages, api_key, base_url)
        return {"response": response_text}
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
