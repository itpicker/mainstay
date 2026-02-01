from langgraph.graph import StateGraph, END
from backend.agents.state import AgentState
from backend.agents.nodes import supervisor_node, researcher_node, developer_node, reviewer_node

# 1. Initialize Graph
workflow = StateGraph(AgentState)

# 2. Add Nodes
workflow.add_node("supervisor", supervisor_node)
workflow.add_node("Researcher", researcher_node)
workflow.add_node("Developer", developer_node)
workflow.add_node("Reviewer", reviewer_node)

# 3. Define Edges
# From Supervisor, we branch to one of the workers or END
workflow.add_conditional_edges(
    "supervisor",
    lambda state: state["next"],
    {
        "Researcher": "Researcher",
        "Developer": "Developer",
        "Reviewer": "Reviewer",
        "FINISH": END
    }
)

# From workers, we always go back to supervisor to report results and get next assignment
workflow.add_edge("Researcher", "supervisor")
workflow.add_edge("Developer", "supervisor")
workflow.add_edge("Reviewer", "supervisor")

# 4. Set Entry Point
workflow.set_entry_point("supervisor")

# 5. Compile
# We export a helper to compile with a checkpointer if needed
def get_graph(checkpointer=None):
    return workflow.compile(checkpointer=checkpointer)

# Default compiled graph for stateless usage
graph = get_graph()
