
import os
import sys
from uuid import UUID

# Ensure backend directory is in path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from backend.db import supabase
    from backend.schemas import ProjectResponse
except ImportError as e:
    print(f"Error importing modules: {e}")
    sys.exit(1)

def test_validation():
    print("Fetching one project...")
    try:
        # Assuming we can just fetch any project to test validation
        response = supabase.table("projects").select("*").limit(1).execute()
        if not response.data:
            print("No projects found.")
            return

        data = response.data[0]
        print(f"Data from DB: {data}")

        print("\nValidating against ProjectResponse schema...")
        try:
            model = ProjectResponse(**data)
            print("SUCCESS: Data validated successfully.")
            print(model.model_dump())
        except Exception as e:
            print(f"FAIL: Validation Error: {e}")

    except Exception as e:
        print(f"FAIL: unexpected error: {e}")

if __name__ == "__main__":
    test_validation()
