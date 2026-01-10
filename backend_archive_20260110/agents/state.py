from typing import TypedDict, Annotated, Sequence, Dict, Any, List
import operator
from langchain_core.messages import BaseMessage

class AgentState(TypedDict):
    project_id: str
    messages: Annotated[Sequence[BaseMessage], operator.add]
    team: List[Dict[str, Any]]                # Active specialists (Hired agents)
    goal_dag: Dict[str, Any]                 # Live task graph with status
    knowledge_base: Dict[str, Any]           # Shared findings and data
    execution_logs: List[str]                # Professional activity logs
    active_specialist: str                   # Specialist currently in control
    next_step: str                           # Routing instruction
