from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from backend.db import supabase_client
import logging

router = APIRouter(prefix="/auth", tags=["auth"])
logger = logging.getLogger(__name__)

class LoginRequest(BaseModel):
    email: str
    password: str

class SignupRequest(BaseModel):
    email: str
    password: str
    name: str

@router.post("/login")
async def login(request: LoginRequest):
    try:
        # Use simple sign_in_with_password from supabase client
        # Note: The 'supabase_client' from backend.db is initialized with SERVICE_KEY?
        # If it's service key, we should be careful. 
        # But for sign_in, usually checking credentials works same way.
        # Actually proper way is: auth.sign_in_with_password({"email": ..., "password": ...})
        
        response = supabase_client.auth.sign_in_with_password({
            "email": request.email, 
            "password": request.password
        })
        
        if response.user and response.session:
            logger.info(f"User logged in via backend: {response.user.email}")
            return {
                "user": {
                    "id": response.user.id,
                    "email": response.user.email,
                    # Add other user metadata if needed
                },
                "session": {
                    "access_token": response.session.access_token,
                    "refresh_token": response.session.refresh_token,
                    "expires_in": response.session.expires_in
                }
            }
        else:
            raise HTTPException(status_code=401, detail="Invalid credentials")
            
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        # Check if it's a specific auth error
        if "Invalid login credentials" in str(e):
             raise HTTPException(status_code=401, detail="Invalid login credentials")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/signup")
async def signup(request: SignupRequest):
    try:
        response = supabase_client.auth.sign_up({
            "email": request.email,
            "password": request.password,
            "options": {
                "data": {
                    "full_name": request.name
                }
            }
        })
        
        if response.user:
             return {"message": "Signup successful", "user_id": response.user.id}
        else:
             raise HTTPException(status_code=400, detail="Signup failed")
             
    except Exception as e:
        logger.error(f"Signup error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
