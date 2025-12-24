import os
from functools import lru_cache
from langchain_openai import ChatOpenAI
from langchain_ollama import ChatOllama

@lru_cache(maxsize=1)
def get_llm():
    model_provider = os.getenv("LLM_PROVIDER", "ollama").lower()
    
    if model_provider == "openai":
        return ChatOpenAI(model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"))
    
    elif model_provider == "ollama":
        base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        model = os.getenv("OLLAMA_MODEL", "llama3")
        return ChatOllama(base_url=base_url, model=model)
        
    elif model_provider == "anthropic":
        # Placeholder for future implementation
        raise NotImplementedError("Anthropic provider not yet implemented")
        
    elif model_provider == "google":
        # Placeholder for future implementation
        raise NotImplementedError("Google provider not yet implemented")
        
    else:
        raise ValueError(f"Unknown LLM provider: {model_provider}")
