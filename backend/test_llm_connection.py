import requests
import json

def test_ollama():
    url = "http://localhost:11434/api/tags"
    print(f"Testing connection to Ollama at {url}...")
    try:
        res = requests.get(url, timeout=5)
        if res.status_code == 200:
            print("SUCCESS: Ollama is reachable.")
            models = res.json().get("models", [])
            print("Available models:")
            for m in models:
                print(f" - {m.get('name')}")
            
            # Try a completion
            test_model = "deepseek-r1:8b"
            # Check if model exists in list
            if any(m.get('name') == test_model for m in models):
                print(f"\nModel '{test_model}' found. Attempting chat...")
                chat_url = "http://localhost:11434/api/chat"
                payload = {
                    "model": test_model,
                    "messages": [{"role": "user", "content": "Hello, are you there?"}],
                    "stream": False
                }
                chat_res = requests.post(chat_url, json=payload, timeout=30)
                if chat_res.status_code == 200:
                    print(f"Chat Response: {chat_res.json().get('message', {}).get('content')}")
                else:
                    print(f"Chat Failed: {chat_res.status_code} - {chat_res.text}")
            else:
                print(f"\nWARNING: Model '{test_model}' NOT found in Ollama list.")
                print("Please run 'ollama pull deepseek-r1:8b'")
        else:
            print(f"FAILED: Status {res.status_code}")
    except Exception as e:
        print(f"CONNECTION ERROR: {e}")
        print("Ensure Ollama is running (ollama serve).")

if __name__ == "__main__":
    test_ollama()
