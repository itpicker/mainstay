import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv("backend/.env")

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

if not url or not key:
    print("Error: SUPABASE_URL or SUPABASE_KEY not set")
    exit(1)

supabase: Client = create_client(url, key)

try:
    # Try to insert a dummy agent with all fields to see if it fails (dry run-ish)
    # Actually, better to just try a select, but select * won't show missing columns if we don't ask for them?
    # Supabase doesn't have a simple "describe table" via API usually.
    # But we can try to select 'model, goal' and see if it errors.
    
    print("Checking if 'model' and 'goal' columns exist in 'agents' table...")
    response = supabase.table("agents").select("model, goal").limit(1).execute()
    print("Success! Columns exist.")
except Exception as e:
    print(f"Schema Error: {e}")
