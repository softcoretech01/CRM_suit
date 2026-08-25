from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from aiomysql.connection import Connection
from datetime import timedelta
from app.core.config import settings
from app.core.database import get_admin_db, get_masters_db
from app.core.security import verify_password, create_access_token
from app.core.dependencies import get_current_user
from app.repositories import admin_repo, masters_repo

router = APIRouter()

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Connection = Depends(get_admin_db), masters_db: Connection = Depends(get_masters_db)):
    # Support login with username or email
    user = await admin_repo.get_user_by_username_or_email(db, form_data.username)
    if not user:
        raise HTTPException(status_code=400, detail=f"User '{form_data.username}' not found in database")
        
    if not verify_password(form_data.password, user["password_hash"]):
        raise HTTPException(status_code=400, detail="Incorrect password")
        
    if user["status"].upper() != "ACTIVE":
        raise HTTPException(status_code=400, detail="Inactive user account")

    # Fetch company details
    company_name = None
    company_logo = None
    if user.get("tenant_company_id"):
        company = await admin_repo.get_company(db, user["tenant_company_id"])
        if company:
            company_name = company.get("name")
            company_logo = company.get("logo_url")

    # Build token payload (kept small — the permission matrix is returned in the
    # response body, not embedded in the JWT).
    user_payload = {
        "id": user["id"],
        "username": user["username"],
        "name": user.get("name", ""),
        "full_name": user.get("name", ""),
        "role_id": user["role_id"],
        "role_name": user.get("role_name"),
        "tenant_company_id": user["tenant_company_id"],
        "tenant_company_name": company_name,
        "tenant_company_logo": company_logo,
        "profile_pic": user.get("profile_pic")
    }

    # Resolve the role's actual permission matrix so the client can enforce
    # portal access from real DB permissions (not a guess from the role name).
    permissions = {}
    if user.get("role_id"):
        permissions = await admin_repo._build_matrix(db, user["role_id"])

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user["id"]), "user": user_payload}, expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {**user_payload, "permissions": permissions},
    }

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user

@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    return {"success": True, "message": "Logged out successfully"}
