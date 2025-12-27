from langgraph.graph import StateGraph, END
from backend.agents.state import AgentState
from backend.agents.supervisor import supervisor_node
from backend.agents.planner import planner_node
from backend.agents.researcher import researcher_node
from backend.agents.developer import developer_node

def analyst_node(state: AgentState):
    # Fallback or simple implementation for Analyst if needed
    from langchain_core.messages import AIMessage
    return {"messages": [AIMessage(content="Analyst work complete (simulated).", name="Analyst")]}

# Graph Construction
workflow = StateGraph(AgentState)

workflow.add_node("Supervisor", supervisor_node)
workflow.add_node("Planner", planner_node)
workflow.add_node("Researcher", researcher_node)
workflow.add_node("Developer", developer_node)
workflow.add_node("Analyst", analyst_node)

# Edges
workflow.set_entry_point("Supervisor")

# Conditional edges from Supervisor
workflow.add_conditional_edges(
    "Supervisor",
    lambda x: x["next_step"],
    {
        "Planner": "Planner",
        "Researcher": "Researcher",
        "Developer": "Developer",
        "Analyst": "Analyst",
        "FINISH": END
    }
)

# Specialists return to supervisor
workflow.add_edge("Planner", "Supervisor")
workflow.add_edge("Researcher", "Supervisor")
workflow.add_edge("Developer", "Supervisor")
workflow.add_edge("Analyst", "Supervisor")

graph = workflow.compile()
