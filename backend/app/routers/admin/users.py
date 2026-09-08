"""
routers/admin/users.py
----------------------
All User-related API endpoints under /api/admin/users
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
import shutil
from pathlib import Path
import uuid
from aiomysql.connection import Connection
from app.core.database import get_admin_db
from app.core.dependencies import get_current_user
from app.core.config import settings
from app.repositories import admin_repo
from app.schemas.admin.user import UserCreate, UserUpdate, UserResponse
from app.core.security import get_password_hash

router = APIRouter(prefix="/users", tags=["Admin — Users"])


@router.post("/upload-profile-pic", summary="Upload an employee profile picture")
async def upload_user_profile_pic(file: UploadFile = File(...)):
    UPLOAD_DIR = Path(settings.MEDIA_ROOT) / "profiles"
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    
    file_extension = file.filename.split(".")[-1]
    new_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = UPLOAD_DIR / new_filename
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return {"success": True, "profile_pic": f"{settings.MEDIA_URL.rstrip('/')}/profiles/{new_filename}"}


def _tenant_id(current_user: dict) -> int | None:
    role = (current_user.get("role_name") or "").lower()
    tenant_id = current_user.get("tenant_company_id")
    # For global admins / super admins / tenant 1, return None to view all users
    if role in ["super admin", "administrator", "admin"] or tenant_id == 1 or tenant_id is None:
        return None
    return tenant_id


@router.get("", summary="List all users for this tenant")
async def get_users(
    company_id: int | None = None,
    db: Connection = Depends(get_admin_db),
    current_user: dict = Depends(get_current_user)
):
    target_tenant = company_id if company_id is not None else _tenant_id(current_user)
    users = await admin_repo.get_users(db, target_tenant)
    return {"success": True, "data": users}


@router.get("/{user_id}", summary="Get a single user by ID")
async def get_user(
    user_id: int,
    db: Connection = Depends(get_admin_db),
    current_user: dict = Depends(get_current_user)
):
    tenant_id = _tenant_id(current_user)
    user = await admin_repo.get_user(db, tenant_id, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"success": True, "data": user}


@router.post("", status_code=201, summary="Create a new user")
async def create_user(
    payload: UserCreate,
    db: Connection = Depends(get_admin_db),
    current_user: dict = Depends(get_current_user)
):
    default_tenant = current_user.get("tenant_company_id") or 1
    tenant_id = payload.companyId if payload.companyId else default_tenant

    # Prevent duplicate email
    existing = await admin_repo.get_user_by_email(db, payload.email)
    if existing:
        raise HTTPException(status_code=409, detail="A user with this email already exists")

    # Check max users limit
    company = await admin_repo.get_company(db, tenant_id)
    if not company:
        raise HTTPException(status_code=404, detail="Target company not found")
        
    max_users = company.get("max_users", 2)
    current_users_count = await admin_repo.get_user_count_for_company(db, tenant_id)
    
    if current_users_count >= max_users:
        raise HTTPException(status_code=400, detail=f"Maximum user limit ({max_users}) reached for this company")

    data = payload.dict()
    data.pop("companyId", None)
    password = data.pop("password")
    data["password_hash"] = get_password_hash(password)

    user_id = await admin_repo.create_user(db, tenant_id, data)
    return {"success": True, "message": "User created successfully", "data": {"id": user_id}}


@router.put("/{user_id}", summary="Update an existing user")
async def update_user(
    user_id: int,
    payload: UserUpdate,
    db: Connection = Depends(get_admin_db),
    current_user: dict = Depends(get_current_user)
):
    tenant_id = _tenant_id(current_user)
    data = payload.dict(exclude_unset=True)

    if "password" in data and data["password"]:
        data["password_hash"] = get_password_hash(data.pop("password"))
    elif "password" in data:
        data.pop("password")

    if "companyId" in data:
        data["tenant_company_id"] = data.pop("companyId")

    success = await admin_repo.update_user(db, tenant_id, user_id, data)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"success": True, "message": "User updated successfully"}


@router.patch("/{user_id}/status", summary="Update user active status only")
async def update_user_status(
    user_id: int,
    payload: dict,
    db: Connection = Depends(get_admin_db),
    current_user: dict = Depends(get_current_user)
):
    tenant_id = _tenant_id(current_user)
    new_status = payload.get("status")
    if not new_status:
        raise HTTPException(status_code=400, detail="'status' field is required")
    success = await admin_repo.update_user(db, tenant_id, user_id, {"status": new_status})
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"success": True, "message": "Status updated successfully"}


@router.delete("/{user_id}", summary="Delete a user")
async def delete_user(
    user_id: int,
    db: Connection = Depends(get_admin_db),
    current_user: dict = Depends(get_current_user)
):
    tenant_id = _tenant_id(current_user)
    success = await admin_repo.delete_user(db, tenant_id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"success": True, "message": "User deleted successfully"}
