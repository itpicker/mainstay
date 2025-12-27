from langchain_core.messages import AIMessage
from backend.agents.state import AgentState
from backend.llm_factory import get_llm

def researcher_node(state: AgentState):
    llm = get_llm()
    
    # Identify the current task assigned to Researcher
    current_task = next((t for t in state["goal_dag"].get("tasks", []) if t["assignee"] == "Researcher" and t.get("status") != "completed"), None)
    
    if not current_task:
        return {"messages": [AIMessage(content="No pending researcher tasks found.", name="Researcher")]}
    
    # Simulate work for now, or use tools if available in the future
    user_request = state["messages"][0].content
    task_desc = current_task["description"]
    
    system_msg = (
        "You are the Researcher Specialist for Mainstay. Your goal is to gather information and provide findings. "
        "Use your professional knowledge to address the task.\n"
        "CRITICAL: Respond in the user's language (Korean if the request is in Korean)."
    )
    
    response = llm.invoke([
        ("system", system_msg),
        ("human", f"Project: {user_request}\nTask: {task_desc}")
    ])
    
    # Update knowledge base and task status
    knowledge_key = current_task["task_id"]
    log_entry = f"Researcher completed task: {current_task['title']}"
    
    # Update task status in goal_dag
    for t in state["goal_dag"]["tasks"]:
        if t["task_id"] == current_task["task_id"]:
            t["status"] = "completed"
    
    return {
        "goal_dag": state["goal_dag"],
        "knowledge_base": {**state["knowledge_base"], knowledge_key: response.content},
        "execution_logs": state["execution_logs"] + [log_entry],
        "messages": [AIMessage(content=response.content, name="Researcher")]
    }
