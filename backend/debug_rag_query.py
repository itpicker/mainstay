import asyncio
import os
from supabase import create_client, Client
from dotenv import load_dotenv
from embeddings import get_embedding

# Load env
load_dotenv()
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

AGENT_ID = "00614f7b-13b8-4df3-bf91-2f8e181b412a"  # Replace with actual Agent ID if needed, or remove filter

def debug_rag(query_text: str):
    print(f"\n--- Debugging RAG for query: '{query_text}' ---")
    
    # 1. Generate Embedding
    print("Generating embedding...")
    embedding = get_embedding(query_text)
    if not embedding:
        print("Failed to generate embedding.")
        return

    # 2. Call RPC with low threshold to see ALL candidates
    print("Querying Supabase (Threshold: 0.1, Limit: 10)...")
    rpc_params = {
        "query_embedding": embedding,
        "match_threshold": 0.1,  # Very low to catch everything
        "match_count": 10,
        "filter_agent_id": AGENT_ID
    }
    
    try:
        response = supabase.rpc("match_chat_messages", rpc_params).execute()
        matches = response.data
        
        print(f"Found {len(matches)} matches:")
        for i, m in enumerate(matches):
            print(f"[{i+1}] Score: {m['similarity']:.4f} | Role: {m['role']} | Content: {m['content'][:50]}...")
            
    except Exception as e:
        print(f"RPC Error: {e}")

if __name__ == "__main__":
    # Test queries based on user conversation
    debug_rag("내 이름은 PP 입니다.")
    debug_rag("내 이름이 뭐지?")
