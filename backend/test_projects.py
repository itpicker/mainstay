
import os
import sys
import json

# Ensure backend directory is in path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from backend.db import supabase
except ImportError:
    print("Error importing backend.db")
    sys.exit(1)

def test_fetch_projects():
    print("Attempting to fetch projects...")
    try:
        # Fetch first 5 projects
        response = supabase.table("projects").select("*").limit(5).execute()
        
        if response.data is not None:
            print(f"SUCCESS: Fetched {len(response.data)} projects.")
            if len(response.data) > 0:
                print(f"Sample Project Keys: {response.data[0].keys()}")
                print(f"Sample Project Data: {response.data[0]}")
        else:
            print("FAIL: Response data is None.")
            
    except Exception as e:
        print(f"FAIL: Exception fetching projects: {e}")
        # Check for common errors
        if "relation" in str(e) and "does not exist" in str(e):
             print(">> CRITICAL: The 'projects' table seems to be missing!")

if __name__ == "__main__":
    test_fetch_projects()
