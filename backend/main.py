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
    initial_state = {"messages": [HumanMessage(content=task.description, name="User")]}
    
    # Run the graph
    # Using invoke for synchronous run (simple for now)
    final_state = graph.invoke(initial_state)
    
    # Extract the final answer/result
    # This might need refinement depending on what we want to return
    # For now, return the full history or the last message
    history = [m.content for m in final_state["messages"]]
    
    return {
        "message": "Task processed", 
        "task_description": task.description,
        "result_history": history
    }
