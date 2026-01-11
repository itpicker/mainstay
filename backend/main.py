from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from backend.dependencies import get_current_user
from backend.db import supabase
from backend.routers import projects, admin, chat

load_dotenv(dotenv_path="backend/.env")

app = FastAPI(title="Mainstay API via Supabase")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects.router)
app.include_router(projects.tasks_router)
app.include_router(admin.router)
app.include_router(chat.router)

@app.get("/")
def read_root():
    return {"message": "Mainstay API is running with Supabase integration"}

@app.get("/me")
def get_my_profile(user = Depends(get_current_user)):
    """
    Returns the current user's profile from the 'profiles' table.
    The 'auth.users' data is available in 'user' object, but we fetch profile for application data.
    """
    try:
        response = supabase.table("profiles").select("*").eq("id", user.id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Profile not found")
        return {
            "auth": {
                "id": user.id,
                "email": user.email
            },
            "profile": response.data[0]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
