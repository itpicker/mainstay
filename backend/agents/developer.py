from langchain_core.messages import AIMessage
from backend.agents.state import AgentState
from backend.llm_factory import get_llm

def developer_node(state: AgentState):
    llm = get_llm()
    
    # Identify the current task assigned to Developer
    current_task = next((t for t in state["goal_dag"].get("tasks", []) if t["assignee"] == "Developer" and t.get("status") != "completed"), None)
    
    if not current_task:
        return {"messages": [AIMessage(content="No pending developer tasks found.", name="Developer")]}
    
    # Simulate work: Writing code or creating tools
    user_request = state["messages"][0].content
    task_desc = current_task["description"]
    
    system_msg = (
        "You are the Developer Specialist for Mainstay. Your goal is to write code, design systems, and build tools. "
        "Provide robust implementations and technical solutions.\n"
        "CRITICAL: Respond in the user's language (Korean if the request is in Korean)."
    )
    
    response = llm.invoke([
        ("system", system_msg),
        ("human", f"Project: {user_request}\nTask: {task_desc}")
    ])
    
    # Update knowledge base (or file system in the future) and task status
    knowledge_key = current_task["task_id"]
    log_entry = f"Developer completed task: {current_task['title']}"
    
    # Update task status in goal_dag
    for t in state["goal_dag"]["tasks"]:
        if t["task_id"] == current_task["task_id"]:
            t["status"] = "completed"
    
    return {
        "goal_dag": state["goal_dag"],
        "knowledge_base": {**state["knowledge_base"], knowledge_key: response.content},
        "execution_logs": state["execution_logs"] + [log_entry],
        "messages": [AIMessage(content=response.content, name="Developer")]
    }
