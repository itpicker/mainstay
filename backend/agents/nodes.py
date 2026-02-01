from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from langchain_openai import ChatOpenAI
from backend.agents.state import AgentState
from backend.tools.search import search_tool
from backend.tools.filesystem import list_directory, read_file, write_file
import os
import json

# --- Model Setup ---
base_url = os.getenv("OPENAI_API_BASE", "http://localhost:11434/v1")
api_key = os.getenv("OPENAI_API_KEY", "ollama") 
model_name = os.getenv("MODEL_NAME", "llama3") 

llm = ChatOpenAI(
    base_url=base_url,
    api_key=api_key,
    model=model_name,
    temperature=0
)

# --- Supervisor Node (Router) ---
def supervisor_node(state: AgentState):
    messages = state['messages']
    options = ["Researcher", "Developer", "Reviewer", "FINISH"]
    
    prompt = (
        "You are a supervisor managing: Researcher, Developer, Reviewer.\n"
        "Your goal is to route the conversation to the right worker or FINISH.\n"
        "Researcher: Searches for information.\n"
        "Developer: Writes code or files.\n"
        "Reviewer: Reviews code/files.\n\n"
        "Based on the conversation below, who should act next?\n"
        f"Select one of: {', '.join(options)}\n"
        "Respond ONLY with the role name."
    )
    
    response = llm.invoke([SystemMessage(content=prompt)] + messages)
    next_agent = response.content.strip().replace("'", "").replace('"', "")
    
    if next_agent not in options:
        lower = next_agent.lower()
        if "research" in lower: next_agent = "Researcher"
        elif "develop" in lower or "code" in lower: next_agent = "Developer"
        elif "review" in lower: next_agent = "Reviewer"
        else: next_agent = "FINISH"

    return {"next": next_agent}

# --- Tool Execution Helper ---
def run_tool_from_response(response_content: str, available_tools: dict):
    if "TOOL_CALL:" in response_content:
        try:
            parts = response_content.split("TOOL_CALL:", 1)[1].strip()
            tool_name, args_str = parts.split(" ", 1)
            tool_name = tool_name.strip()
            args = json.loads(args_str)
            
            tool_func = available_tools.get(tool_name)
            if tool_func:
                print(f"--- Executing {tool_name} with {args} ---")
                return tool_func.invoke(args)
            else:
                return f"Error: Tool {tool_name} not found."
        except Exception as e:
            return f"Error executing tool: {e}"
    return None

# --- Worker Nodes (Manual ReAct) ---

def get_react_prompt(role: str, tools_desc: str):
    return (
        f"You are the {role}.\n"
        f"You have access to these tools:\n{tools_desc}\n\n"
        "To use a tool, your LAST line must be exactly:\n"
        "TOOL_CALL: ToolName {\"arg\": \"value\"}\n\n"
        "Examples:\n"
        "TOOL_CALL: search_tool {\"query\": \"LangGraph\"}\n"
        "TOOL_CALL: write_file {\"path\": \"hello.txt\", \"content\": \"Hello\"}\n\n"
        "If you have completed your task or don't need tools, just respond with your report/answer."
    )

def researcher_node(state: AgentState):
    tools_map = {"search_tool": search_tool}
    tools_desc = "- search_tool(query): Web search."
    
    prompt = get_react_prompt("Researcher", tools_desc)
    messages = [SystemMessage(content=prompt)] + state['messages']
    
    response = llm.invoke(messages)
    content = response.content
    
    tool_result = run_tool_from_response(content, tools_map)
    if tool_result:
        summary = f"{content}\n\n[Tool Result]: {tool_result}"
    else:
        summary = content
        
    return {
        "messages": [AIMessage(content=summary, name="Researcher")]
    }

def developer_node(state: AgentState):
    tools_map = {
        "list_directory": list_directory,
        "read_file": read_file,
        "write_file": write_file
    }
    tools_desc = (
        "- list_directory(path): List files.\n"
        "- read_file(path): Read file content.\n"
        "- write_file(path, content): Write file content."
    )
    
    prompt = get_react_prompt("Developer", tools_desc)
    messages = [SystemMessage(content=prompt)] + state['messages']
    
    response = llm.invoke(messages)
    content = response.content
    
    tool_result = run_tool_from_response(content, tools_map)
    if tool_result:
        summary = f"{content}\n\n[Tool Result]: {tool_result}"
    else:
        summary = content
        
    return {
        "messages": [AIMessage(content=summary, name="Developer")]
    }

def reviewer_node(state: AgentState):
    prompt = "You are a Reviewer. Review the previous work. If acceptable, say 'Approved'."
    messages = [SystemMessage(content=prompt)] + state['messages']
    response = llm.invoke(messages)
    return {
        "messages": [AIMessage(content=response.content, name="Reviewer")]
    }
