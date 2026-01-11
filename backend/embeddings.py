import requests
from typing import List, Optional

# Configuration
OLLAMA_BASE_URL = "http://localhost:11434"
EMBEDDING_MODEL = "qwen3-embedding:latest"

def get_embedding(text: str, model: str = EMBEDDING_MODEL) -> Optional[List[float]]:
    """
    Generates a vector embedding for the given text using Ollama.
    Returns None if generation fails.
    """
    url = f"{OLLAMA_BASE_URL}/api/embeddings"
    payload = {
        "model": model,
        "prompt": text
    }
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        response.raise_for_status()
        data = response.json()
        return data.get("embedding")
    except requests.exceptions.RequestException as e:
        print(f"Error generating embedding: {e}")
        return None
    except Exception as e:
        print(f"Unexpected error in get_embedding: {e}")
        return None

if __name__ == "__main__":
    # Simple test
    test_text = "This is a test sentence for embedding."
    vector = get_embedding(test_text)
    if vector:
        print(f"Successfully generated embedding. Dimensions: {len(vector)}")
        print(f"First 5 values: {vector[:5]}")
    else:
        print("Failed to generate embedding. Make sure Ollama is running and 'nomic-embed-text' is pulled.")
