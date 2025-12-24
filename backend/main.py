from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

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
    # Placeholder for agent orchestration
    return {"message": "Task received", "task_description": task.description}
