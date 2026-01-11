from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from uuid import UUID
from backend.db import supabase
from backend.dependencies import get_current_user
from backend.schemas import ProjectCreate, ProjectResponse, ProjectUpdate, TaskCreate, TaskResponse, AgentResponse
import uuid

router = APIRouter(
    prefix="/projects",
    tags=["projects"],
    dependencies=[Depends(get_current_user)]
)

# --- Projects ---

@router.get("/", response_model=List[ProjectResponse])
def get_projects(user = Depends(get_current_user)):
    """List all projects for the current user."""
    try:
        # Fetch projects where owner_id is the current user
        response = supabase.table("projects").select("*").eq("owner_id", user.id).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(project: ProjectCreate, user = Depends(get_current_user)):
    """Create a new project."""
    try:
        new_project = {
            "title": project.title,
            "description": project.description,
            "owner_id": user.id,
            "status": "PLANNING"
        }
        response = supabase.table("projects").insert(new_project).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create project")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: UUID, user = Depends(get_current_user)):
    """Get specific project details."""
    try:
        # Ensure user owns project (Naive RLS via API check, ideally RLS in DB handles this too)
        response = supabase.table("projects").select("*").eq("id", str(project_id)).eq("owner_id", user.id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Project not found")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Project Sub-Resources (Teams, Tasks) ---

@router.get("/{project_id}/tasks", response_model=List[TaskResponse])
def get_project_tasks(project_id: UUID, user = Depends(get_current_user)):
    """List tasks for a project."""
    try:
        # Verify access
        p_response = supabase.table("projects").select("id").eq("id", str(project_id)).eq("owner_id", user.id).execute()
        if not p_response.data:
             raise HTTPException(status_code=404, detail="Project not found")
             
        response = supabase.table("tasks").select("*").eq("project_id", str(project_id)).execute()
        return response.data
    except Exception as e:
         raise HTTPException(status_code=500, detail=str(e))
         
@router.post("/{project_id}/tasks", response_model=TaskResponse)
def create_project_task(project_id: UUID, task: TaskCreate, user = Depends(get_current_user)):
    """Create a task in a project."""
    try:
        # Verify access
        p_response = supabase.table("projects").select("id").eq("id", str(project_id)).eq("owner_id", user.id).execute()
        if not p_response.data:
             raise HTTPException(status_code=404, detail="Project not found")
        
        new_task = {
            "project_id": str(project_id),
            "title": task.title,
            "description": task.description,
            "status": task.status,
            "priority": task.priority
        }
        response = supabase.table("tasks").insert(new_task).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{project_id}/team", response_model=List[AgentResponse])
def get_project_team(project_id: UUID, user = Depends(get_current_user)):
    """List agents assigned to a project."""
    try:
        # Verify access
        p_response = supabase.table("projects").select("id").eq("id", str(project_id)).eq("owner_id", user.id).execute()
        if not p_response.data:
             raise HTTPException(status_code=404, detail="Project not found")
             
        response = supabase.table("agents").select("*").eq("project_id", str(project_id)).execute()
        return response.data
    except Exception as e:
         raise HTTPException(status_code=500, detail=str(e))
