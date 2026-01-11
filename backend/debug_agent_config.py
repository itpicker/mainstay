import os
from dotenv import load_dotenv
from supabase import create_client, Client
import json

load_dotenv("backend/.env")

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

def debug_config():
    print("--- 1. Checking Agents ---")
    agents = supabase.table("agents").select("*").execute()
    if not agents.data:
        print("No agents found.")
    else:
        for a in agents.data:
            print(f"Agent: {a.get('name')} | ID: {a.get('id')} | Model: {a.get('model')}")

    print("\n--- 2. Checking AI Models ---")
    models = supabase.table("ai_models").select("*").execute()
    if not models.data:
        print("No AI models found.")
    else:
        for m in models.data:
            print(f"Model: {m.get('name')} | ID: {m.get('model_id')} | Provider: {m.get('provider')} | Base URL: {m.get('base_url')}")

debug_config()
