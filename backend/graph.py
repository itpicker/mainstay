from langgraph.graph import StateGraph, END
from backend.agents.state import AgentState
from backend.agents.supervisor import supervisor_node
from backend.agents.planner import planner_node
from backend.agents.executor import executor_node

# Nodes - simplified as they now get LLM internally
# The node functions in separate files now take only (state) as argument because they use get_llm() internally

# Graph Construction
workflow = StateGraph(AgentState)

workflow.add_node("Supervisor", supervisor_node)
workflow.add_node("Planner", planner_node)
workflow.add_node("Executor", executor_node)

# Edges
workflow.set_entry_point("Supervisor")

# Conditional edges from Supervisor
workflow.add_conditional_edges(
    "Supervisor",
    lambda x: x["next_step"],
    {
        "Planner": "Planner",
        "Executor": "Executor",
        "FINISH": END
    }
)

# Workers return to supervisor
workflow.add_edge("Planner", "Supervisor")
workflow.add_edge("Executor", "Supervisor")

graph = workflow.compile()
