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
    thread_id: Optional[str] = None
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
    Stream a conversation using the Multi-Agent LangGraph.
    """
    # 1. Fetch Agent (Optional verification)
    try:
        agent_res = supabase.table("agents").select("*").eq("id", request.agent_id).execute()
        if not agent_res.data:
            raise HTTPException(status_code=404, detail="Agent not found")
        agent = agent_res.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB Error: {str(e)}")

    # 2. Prepare Inputs & Persistence
    from backend.agents.graph import get_graph
    from langchain_core.messages import HumanMessage, SystemMessage
    from langgraph.checkpoint.postgres import PostgresSaver
    from psycopg_pool import ConnectionPool
    
    # DB Connection String (Assume standard Supabase format)
    # Ideally use a global pool, but for now we create one per request or use a context manager if efficient
    # Supabase connection string usually in DATABASE_URL
    import os
    db_uri = os.getenv("DATABASE_URL")
    
    # If no DB URL, warn and fall back to stateless
    if not db_uri:
        logging.warning("DATABASE_URL not set. Running stateless.")
        checkpointer = None
        graph = get_graph()
    else:
        # Note: PostgresSaver needs a connection info
        # We use a context manager for the connection
        # But `graph.stream` is an iterator. We need the connection to stay open.
        pass # Handle inside event_stream

    # ... RAG Logic (Simplified) ...
    user_embedding = get_embedding(request.message)
    relevant_context = ""
    
    # Build initial messages (History + Current)
    initial_messages = []
    
    # If we have a thread_id, we might rely on the checkpointer's memory 
    # and NOT re-inject history if it's already there. 
    # But for robustness, if history is passed, we can append it.
    
    # Add System Prompt with Agent Persona
    system_content = f"You are {agent.get('name')}. {agent.get('role')}."
    initial_messages.append(SystemMessage(content=system_content))
    
    # Add History provided by client (if any)
    for msg in request.history:
        if msg.role == "user":
            initial_messages.append(HumanMessage(content=msg.content))
        else:
            initial_messages.append(AIMessage(content=msg.content))
            
    # Add Current User Message
    initial_messages.append(HumanMessage(content=request.message))
    
    inputs = {"messages": initial_messages}

    async def event_stream():
        # Async generator to handle DB connection lifecycle
        try:
            if db_uri and request.thread_id:
                # Use PostgresSaver
                # We need to setup the checkpointer
                # Use PostgresSaver with context manager to ensure cleanup
                try:
                    with ConnectionPool(conninfo=db_uri, max_size=20, kwargs={"autocommit": True}) as pool:
                        checkpointer = PostgresSaver(pool)
                        
                        # Ensure tables exist (Run once typically, but safe here)
                        checkpointer.setup() 
                        
                        # Compile graph with checkpointer
                        graph_with_memory = get_graph(checkpointer=checkpointer)
                        
                        config = {"configurable": {"thread_id": request.thread_id}}
                        
                        # Run with config
                        for event in graph_with_memory.stream(inputs, config=config):
                            for node_name, values in event.items():
                                 if "messages" in values:
                                    last_msg = values["messages"][-1]
                                    content = f"**{node_name}**: {last_msg.content}"
                                    yield f"data: {json.dumps({'content': content + '\\n\\n'})}\\n\\n"
                                    logging.info(f"Agent {node_name} response: {last_msg.content[:50]}...")
                    
                except Exception as e:
                    logging.error(f"Persistence Error: {e}")
                    # Try to yield error if stream is still open
                    yield f"data: {json.dumps({'error': f'Persistence Error: {str(e)}'})}\\n\\n"
                    
            else:
                # Stateless Fallback
                graph = get_graph()
                for event in graph.stream(inputs):
                    for node_name, values in event.items():
                        if "messages" in values:
                             last_msg = values["messages"][-1]
                             content = f"**{node_name}**: {last_msg.content}"
                             yield f"data: {json.dumps({'content': content + '\\n\\n'})}\\n\\n"

            yield "event: done\ndata: [DONE]\n\n"
            
        except Exception as e:
            logging.error(f"Graph Error: {e}")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")

# Keeping the blocking endpoint for backward compatibility if needed, or remove it.
# Ideally we replace logic of previous endpoint or keep both.
# I will keep /message for now but user wants improvement so frontend will switch to /stream.
