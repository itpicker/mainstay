from typing import List, Dict, Any
from pydantic import BaseModel, Field
from langchain_core.messages import AIMessage, HumanMessage
from backend.agents.state import AgentState
from backend.llm_factory import get_llm

class Task(BaseModel):
    task_id: str = Field(description="Unique ID for the task (e.g. T1, T2)")
    title: str = Field(description="Short title of the task")
    description: str = Field(description="Detailed description of what needs to be done")
    assignee: str = Field(description="The specialist role best suited for this (Developer, Researcher, Analyst)")
    dependencies: List[str] = Field(default_factory=list, description="IDs of tasks that must be completed before this one")

class GoalDAG(BaseModel):
    tasks: List[Task] = Field(description="List of tasks that form the project plan")

def planner_node(state: AgentState):
    llm = get_llm()
    structured_llm = llm.with_structured_output(GoalDAG)
    
    # Extract the original user request
    user_request = state["messages"][0].content
    
    system_msg = (
        "You are the Project Manager for Mainstay. Your goal is to decompose the user's project request "
        "into a structured set of tasks (Goal DAG). Identify which specialists (Developer, Researcher, Analyst) "
        "should handle each task. If the request is simple, create a simple plan. If complex, break it down logically.\n"
        "CRITICAL: Respond in the user's language (Korean if the request is in Korean)."
    )
    
    response = structured_llm.invoke([
        ("system", system_msg),
        ("human", user_request)
    ])
    
    # Convert Pydantic to dict for state storage
    goal_dag_dict = response.model_dump()
    
    # Add a log entry
    log_entry = f"Project Manager created a plan with {len(response.tasks)} tasks."
    
    return {
        "goal_dag": goal_dag_dict,
        "execution_logs": state["execution_logs"] + [log_entry],
        "messages": [AIMessage(content=f"Plan created: {len(response.tasks)} tasks identified.", name="Planner")]
    }
