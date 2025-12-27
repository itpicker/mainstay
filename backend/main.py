from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from langchain_core.messages import HumanMessage
from backend.graph import graph

load_dotenv(dotenv_path="backend/.env")

app = FastAPI(title="Mainstay API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TaskInput(BaseModel):
    description: str

@app.get("/")
def read_root():
    return {"message": "Welcome to Mainstay API"}

@app.post("/tasks")
def create_task(task: TaskInput):
    initial_state = {
        "project_id": "proj_" + str(hash(task.description))[:8],
        "messages": [HumanMessage(content=task.description, name="User")],
        "team": [],
        "goal_dag": {},
        "knowledge_base": {},
        "execution_logs": ["Project initiated by user."],
        "active_specialist": "Supervisor",
        "next_step": "Planner"
    }
    
    # Run the graph
    # Using invoke for synchronous run (simple for now)
    final_state = graph.invoke(initial_state)
    
    # Extract the final answer/result and detailed logs
    final_result = final_state["messages"][-1].content if final_state["messages"] else ""
    execution_logs = final_state.get("execution_logs", [])
    knowledge_base = final_state.get("knowledge_base", {})
    
    return {
        "message": "Task processed", 
        "task_description": task.description,
        "final_result": final_result,
        "execution_logs": execution_logs,
        "findings": knowledge_base
    }
