from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel
from backend.db import supabase
from backend.dependencies import get_current_user

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(get_current_user)]
)

# --- Schemas ---

class AIModelBase(BaseModel):
    name: str
    model_id: str
    provider: str
    api_key: Optional[str] = None
    base_url: Optional[str] = None
    is_active: bool = True

class AIModelCreate(AIModelBase):
    pass

class AIModelResponse(AIModelBase):
    id: str
    created_at: str

# --- Endpoints ---

@router.get("/models", response_model=List[AIModelResponse])
def get_ai_models(user = Depends(get_current_user)):
    """List all available AI models."""
    try:
        response = supabase.table("ai_models").select("*").order("created_at").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/models", response_model=AIModelResponse, status_code=status.HTTP_201_CREATED)
def create_ai_model(model: AIModelCreate, user = Depends(get_current_user)):
    """Add a new AI model."""
    try:
        new_model = model.dict()
        response = supabase.table("ai_models").insert(new_model).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create model")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/models/{model_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ai_model(model_id: UUID, user = Depends(get_current_user)):
    """Delete an AI model."""
    try:
        response = supabase.table("ai_models").delete().eq("id", str(model_id)).execute()
        return None
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- User Management ---

class UserUpdate(BaseModel):
    role: Optional[str] = None
    # is_active: bool = True # In Supabase Auth, disabling is different, but we can have app-level flag in profiles if needed.

# We assume 'profiles' table has: id, email, full_name, avatar_url, role, created_at
@router.get("/users")
def get_users(user = Depends(get_current_user)):
    """List all users."""
    try:
        response = supabase.table("profiles").select("*").order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/users/{user_id}")
def update_user(user_id: UUID, update: UserUpdate, user = Depends(get_current_user)):
    """Update a user's role."""
    try:
        response = supabase.table("profiles").update(update.dict(exclude_unset=True)).eq("id", str(user_id)).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="User not found")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- System Statistics ---

@router.get("/stats")
def get_system_stats(user = Depends(get_current_user)):
    """Get system-wide statistics for the dashboard."""
    try:
        # Supabase API doesn't support "count" easily in one go without 'head=True' for each.
        # We will make parallel requests or just simple separate ones.
        
        users_count = supabase.table("profiles").select("*", count="exact", head=True).execute().count
        projects_count = supabase.table("projects").select("*", count="exact", head=True).execute().count
        agents_count = supabase.table("agents").select("*", count="exact", head=True).execute().count
        tasks_count = supabase.table("tasks").select("*", count="exact", head=True).execute().count
        
        return {
            "total_users": users_count,
            "total_projects": projects_count,
            "total_agents": agents_count,
            "total_tasks": tasks_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
