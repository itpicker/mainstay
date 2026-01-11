
import os
import sys

# Ensure backend directory is in path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from backend.db import supabase
except ImportError as e:
    print(f"Error importing modules: {e}")
    sys.exit(1)

def check_last_message():
    print("Fetching last 3 messages from chat_messages...")
    try:
        response = supabase.table("chat_messages").select("*").order("created_at", desc=True).limit(3).execute()
        
        if not response.data:
            print("No messages found.")
            return

        for msg in response.data:
            print(f"ID: {msg.get('id')}")
            print(f"Role: {msg.get('role')}")
            content = msg.get('content')
            print(f"Content Length: {len(content) if content else 0}")
            print(f"Content Preview: {content[:50]}..." if content else "EMPTY/NONE")
            print("-" * 20)

    except Exception as e:
        print(f"FAIL: unexpected error: {e}")

if __name__ == "__main__":
    check_last_message()
