from backend.agents.state import AgentState
from langchain_core.messages import SystemMessage

def supervisor_node(state: AgentState):
    # Retrieve the goal DAG from state
    goal_dag = state.get("goal_dag", {})
    tasks = goal_dag.get("tasks", [])
    
    if not tasks:
        # If no tasks yet, we need the Planner to create them
        return {"next_step": "Planner", "active_specialist": "Supervisor"}

    # Find the next task that is not completed and whose dependencies are met
    completed_task_ids = {t["task_id"] for t in tasks if t.get("status") == "completed"}
    
    next_task = None
    for t in tasks:
        if t.get("status") != "completed":
            # Check dependencies
            deps = t.get("dependencies", [])
            if all(dep in completed_task_ids for dep in deps):
                next_task = t
                break
    
    if next_task:
        # Route to the assignee
        assignee = next_task["assignee"]
        return {"next_step": assignee, "active_specialist": "Supervisor"}
    else:
        # All tasks completed
        return {"next_step": "FINISH", "active_specialist": "Supervisor"}
