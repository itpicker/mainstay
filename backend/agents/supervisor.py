from backend.agents.state import AgentState
from langchain_core.messages import SystemMessage

def supervisor_node(state: AgentState):
    # Deterministic Routing for MVP Stability
    # 1. User -> Planner
    # 2. Planner -> Executor
    # 3. Executor -> FINISH
    
    last_message = state["messages"][-1]
    last_sender = last_message.name if hasattr(last_message, "name") else "User"
    
    # Check content or type if name isn't reliable, but usually it is.
    # In LangGraph/LangChain, human input usually has name="User" or None.
    
    if last_sender == "User" or last_sender is None:
        next_step = "Planner"
    elif last_sender == "Planner":
        next_step = "Executor"
    elif last_sender == "Executor":
        next_step = "FINISH"
    else:
        # Fallback
        next_step = "FINISH"
        
    return {"next_step": next_step}
