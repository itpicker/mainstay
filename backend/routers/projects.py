from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from uuid import UUID
from backend.db import supabase
from backend.dependencies import get_current_user
from backend.schemas import ProjectCreate, ProjectResponse, ProjectUpdate, TaskCreate, TaskResponse, AgentResponse, AgentCreate
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
    print(f"DEBUG: get_projects called for user {user.id}")
    try:
        # Fetch projects where owner_id is the current user
        print("DEBUG: Executing supabase query...")
        response = supabase.table("projects").select("*").eq("owner_id", user.id).execute()
        print(f"DEBUG: Query result count: {len(response.data) if response.data else 0}")
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(project: ProjectCreate, user = Depends(get_current_user)):
    """Create a new project."""
    new_project = {
        "title": project.title,
        "description": project.description,
        "owner_id": user.id,
        "status": "PLANNING"
    }
    
    created_project = None
    
    try:
        response = supabase.table("projects").insert(new_project).execute()
        if response.data:
            created_project = response.data[0]
    except Exception as e:
        # Check for Foreign Key violation (common if profile is missing)
        if "foreign key constraint" in str(e).lower():
            print(f"DEBUG: Foreign key error. Attempting to create missing profile for {user.id}")
            try:
                # Self-healing: Create the missing profile
                profile_data = {
                    "id": user.id,
                    "email": user.email,
                    "full_name": user.user_metadata.get("full_name", "") if user.user_metadata else "",
                    "avatar_url": user.user_metadata.get("avatar_url", "") if user.user_metadata else ""
                }
                supabase.table("profiles").insert(profile_data).execute()
                
                # Retry project creation
                response = supabase.table("projects").insert(new_project).execute()
                if response.data:
                    created_project = response.data[0]
            except Exception as inner_e:
                print(f"DEBUG: Failed to recover profile: {inner_e}")
                raise HTTPException(status_code=500, detail="User profile mismatch. Please contact support or re-register.")
        else:
            raise e

    if not created_project:
        raise HTTPException(status_code=500, detail="Failed to create project")

    # Seed default agents
    project_id = created_project['id']
    default_agents = [
        {"project_id": project_id, "name": "Alpha-PM", "role": "MANAGER", "status": "IDLE", "capabilities": ["planning", "management"], "model": "gpt-4-turbo"}
    ]
    try:
        supabase.table("agents").insert(default_agents).execute()
    except Exception as agent_e:
        print(f"Warning: Failed to seed agents: {agent_e}")
        # Non-blocking, return project anyway

    return created_project

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

# Additional router for top-level /tasks endpoints
tasks_router = APIRouter(
    prefix="/tasks",
    tags=["tasks"],
    dependencies=[Depends(get_current_user)]
)

@tasks_router.patch("/{task_id}", response_model=TaskResponse)
def update_task(task_id: UUID, task_update: dict, user = Depends(get_current_user)):
    """Update a task's status, priority, or details."""
    try:
        # In a real app, we should check if user has access to the project this task belongs to.
        # For MVP/PoC, we assume if valid user, let them update (RLS handles security).
        response = supabase.table("tasks").update(task_update).eq("id", str(task_id)).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Task not found or update failed")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@tasks_router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: UUID, user = Depends(get_current_user)):
    """Delete a task."""
    try:
        response = supabase.table("tasks").delete().eq("id", str(task_id)).execute()
        # Supabase delete response data contains the deleted rows. If empty, maybe not found or RLS blocked.
        if not response.data:
             # It might be 404 or just already gone. 204 is safe.
             pass
        return None
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

@router.post("/{project_id}/agents", response_model=AgentResponse)
def create_project_agent(project_id: UUID, agent: AgentCreate, user = Depends(get_current_user)):
    """Add a new agent to the project team."""
    try:
        # Verify access
        p_response = supabase.table("projects").select("id").eq("id", str(project_id)).eq("owner_id", user.id).execute()
        if not p_response.data:
             raise HTTPException(status_code=404, detail="Project not found")
        
        new_agent = {
            "project_id": str(project_id),
            "name": agent.name,
            "role": agent.role,
            "capabilities": agent.capabilities,
            "model": agent.model,
            "goal": agent.goal,
            "status": "IDLE",
            "autonomy_level": 3 # Default to Senior Collaborator
        }
        
        response = supabase.table("agents").insert(new_agent).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{project_id}/agents/{agent_id}", response_model=AgentResponse)
def update_project_agent(project_id: UUID, agent_id: UUID, agent_update: dict, user = Depends(get_current_user)):
    """Update an agent's details (role, model, goal, etc.)."""
    try:
        # Verify access
        p_response = supabase.table("projects").select("id").eq("id", str(project_id)).eq("owner_id", user.id).execute()
        if not p_response.data:
             raise HTTPException(status_code=404, detail="Project not found")
        
        # Filter allowed fields
        allowed_fields = {"name", "role", "model", "goal", "capabilities", "autonomy_level", "status"}
        update_data = {k: v for k, v in agent_update.items() if k in allowed_fields}
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No valid fields to update")

        response = supabase.table("agents").update(update_data).eq("id", str(agent_id)).eq("project_id", str(project_id)).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Agent not found or update failed")
            
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
