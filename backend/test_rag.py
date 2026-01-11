
import os
import sys
import json
import requests
# Mock enviroment if needed or assume .env is loaded by main imports if we were using main.
# But here we import supabase from db.

# Ensure backend directory is in path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from backend.db import supabase
    from backend.embeddings import get_embedding
except ImportError as e:
    print(f"Error importing modules: {e}")
    sys.exit(1)

def test_rag_flow():
    print("1. Testing Embedding Generation (Ollama)...")
    try:
        vec = get_embedding("Test query")
        if not vec:
            print("FAIL: get_embedding returned None. Check Ollama status.")
            return
        print(f"SUCCESS: Generated embedding. Length: {len(vec)}")
    except Exception as e:
        print(f"FAIL: Exception during embedding: {e}")
        return

    print("\n2. Testing DB RPC (match_chat_messages)...")
    try:
        # We need a valid agent_id. I'll pick one or use a dummy UUID if the function handles empty results.
        # But wait, filter_agent_id is required.
        # Let's fetch one agent first.
        agents = supabase.table("agents").select("id").limit(1).execute()
        if not agents.data:
            print("SKIP: No agents found in DB to test with.")
            agent_id = "00000000-0000-0000-0000-000000000000"
        else:
            agent_id = agents.data[0]['id']
            
        rpc_params = {
            "query_embedding": vec,
            "match_threshold": 0.1, 
            "match_count": 1,
            "filter_agent_id": agent_id
        }
        
        matches = supabase.rpc("match_chat_messages", rpc_params).execute()
        print(f"SUCCESS: RPC call executed. Matches found: {len(matches.data)}")
    except Exception as e:
        print(f"FAIL: RPC Call failed. Did you run the SQL? Error: {e}")
        # Identify common errors
        if "function match_chat_messages" in str(e) and "does not exist" in str(e):
             print(">> HINT: The SQL script was NOT run. Please run backend/rag_schema.sql in Supabase.")
        elif "operator does not exist" in str(e):
             print(">> HINT: pgvector extension missing or dimensions mismatch.")
        return

    print("\n3. Testing DB Insert...")
    try:
        msg_data = {
            "agent_id": agent_id,
            "role": "user",
            "content": "Diagnostics Insert Test",
            "embedding": vec,
            "metadata": {"test": True}
        }
        res = supabase.table("chat_messages").insert(msg_data).execute()
        print("SUCCESS: Insert executed.")
        
        # Cleanup
        if res.data:
             msg_id = res.data[0]['id']
             supabase.table("chat_messages").delete().eq("id", msg_id).execute()
             print("SUCCESS: Cleanup executed.")
    except Exception as e:
         print(f"FAIL: Insert failed. Error: {e}")

if __name__ == "__main__":
    test_rag_flow()
