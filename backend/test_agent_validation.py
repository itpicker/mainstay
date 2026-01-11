
import os
import sys
from uuid import UUID

# Ensure backend directory is in path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from backend.db import supabase
    from backend.schemas import AgentResponse
except ImportError as e:
    print(f"Error importing modules: {e}")
    sys.exit(1)

def test_agent_validation():
    print("Fetching one agent...")
    try:
        # Fetch ALL agents for the failing project
        project_id = "4c1d1dd6-34e8-49f7-8d06-9d6b1cc8a1ff"
        response = supabase.table("agents").select("*").eq("project_id", project_id).execute()
        if not response.data:
            print("No agents found.")
            return
            
        print(f"Found {len(response.data)} agents.")
        
        for i, data in enumerate(response.data):
            print(f"Checking Agent {i+1} (ID: {data.get('id')})...")
            print(f"Data: {data}")

            print("Validating against AgentResponse schema...")
            try:
                model = AgentResponse(**data)
                print("SUCCESS: Agent validated successfully.")
            except Exception as e:
                print(f"FAIL: Validation Error for Agent {data.get('id')}: {e}")

    except Exception as e:
        print(f"FAIL: unexpected error: {e}")

if __name__ == "__main__":
    test_agent_validation()
