import os
from langchain_core.tools import tool
try:
    from langchain_community.tools.tavily_search import TavilySearchResults
except ImportError:
    TavilySearchResults = None

@tool
def search_tool(query: str):
    """
    Perform a web search for the given query.
    Useful for finding up-to-date information, documentation, or solving errors.
    """
    api_key = os.getenv("TAVILY_API_KEY")
    
    if api_key and TavilySearchResults:
        try:
            search = TavilySearchResults(k=3)
            return search.invoke(query)
        except Exception as e:
            return f"Search failed: {e}. Falling back to mock."
            
    # Mock fallback
    return (
        f"Mock Search Results for '{query}':\n"
        "- [Result 1] Mainstay is an AI project management tool.\n"
        "- [Result 2] LangGraph is a library for building stateful, multi-actor applications with LLMs.\n"
        "- [Result 3] Tavily is a search engine optimized for AI agents."
    )
