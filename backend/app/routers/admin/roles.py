"""
routers/admin/roles.py
----------------------
All Role-related API endpoints under /api/admin/roles
"""
from fastapi import APIRouter, Depends, HTTPException
from aiomysql.connection import Connection
from app.core.database import get_admin_db
from app.core.dependencies import get_current_user
from app.repositories import admin_repo
from app.schemas.admin.role import RoleCreate, RoleUpdate, Role

router = APIRouter(prefix="/roles", tags=["Admin — Roles"])


@router.get("", summary="List all roles")
async def get_roles(
    db: Connection = Depends(get_admin_db),
    current_user: dict = Depends(get_current_user)
):
    roles = await admin_repo.get_roles(db)
    return {"success": True, "data": roles}


@router.get("/{role_id}", summary="Get a single role by ID")
async def get_role(
    role_id: int,
    db: Connection = Depends(get_admin_db),
    current_user: dict = Depends(get_current_user)
):
    role = await admin_repo.get_role(db, role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return {"success": True, "data": role}


@router.post("", status_code=201, summary="Create a new role")
async def create_role(
    payload: RoleCreate,
    db: Connection = Depends(get_admin_db),
    current_user: dict = Depends(get_current_user)
):
    role_id = await admin_repo.create_role(db, payload.dict())
    return {"success": True, "message": "Role created successfully", "data": {"id": role_id}}


@router.put("/{role_id}", summary="Update an existing role")
async def update_role(
    role_id: int,
    payload: RoleUpdate,
    db: Connection = Depends(get_admin_db),
    current_user: dict = Depends(get_current_user)
):
    existing = await admin_repo.get_role(db, role_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Role not found")
    await admin_repo.update_role(db, role_id, payload.dict(exclude_unset=True))
    return {"success": True, "message": "Role updated successfully"}


@router.delete("/{role_id}", summary="Hard-delete a role")
async def delete_role(
    role_id: int,
    db: Connection = Depends(get_admin_db),
    current_user: dict = Depends(get_current_user)
):
    existing = await admin_repo.get_role(db, role_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Role not found")
    await admin_repo.delete_role(db, role_id)
    return {"success": True, "message": "Role deleted successfully"}
