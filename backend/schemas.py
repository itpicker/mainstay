from pydantic import BaseModel
from typing import Optional, List, Any
from uuid import UUID
from datetime import datetime

# --- Project Scehmas ---
class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    is_active: Optional[bool] = None

class ProjectResponse(ProjectBase):
    id: UUID
    status: str
    owner_id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# --- Task Schemas ---
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: Optional[str] = "MEDIUM"
    status: Optional[str] = "TODO"

class TaskCreate(TaskBase):
    pass

class TaskResponse(TaskBase):
    id: UUID
    project_id: UUID
    assignee_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime

# --- Agent Schemas ---
class AgentBase(BaseModel):
    name: str
    role: str
    model: Optional[str] = None
    goal: Optional[str] = None # User Instruction / Persona
    capabilities: List[str] = []

class AgentCreate(AgentBase):
    pass

class AgentResponse(AgentBase):
    id: UUID
    project_id: UUID
    status: str
    autonomy_level: int
