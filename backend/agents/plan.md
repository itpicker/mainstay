
# AI Agent Implementation Plan

## Goal
Implement a multi-agent system using LangGraph where a **Supervisor** routes tasks to specialized workers (**Researcher**, **Developer**, **Reviewer**).

## Structure
- `backend/agents/state.py`: Define `AgentState` (messages, next_step, etc.)
- `backend/agents/nodes.py`: Define agent functions (Researcher, Developer...)
- `backend/agents/graph.py`: Define the LangGraph workflow (compile the graph).

## Integration
- The FastAPI endpoint `POST /chat` will trigger the graph.
- State will be persisted in memory for now (or Supabase checkpointer later).

## Next Steps
1. Define State.
2. Define Nodes.
3. Define Graph.
