"""
schemas/admin/role.py
---------------------
Pydantic schemas for Roles and Permissions.
"""
from pydantic import BaseModel
from typing import Optional, Dict
from datetime import datetime


# ─── Permissions ──────────────────────────────────────────────────────────────

class PermissionBase(BaseModel):
    portal: str
    screen: str
    description: Optional[str] = None
    is_active: bool = True


class Permission(PermissionBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Roles ────────────────────────────────────────────────────────────────────

class RoleBase(BaseModel):
    name: str
    description: Optional[str] = None
    color: Optional[str] = None
    is_active: bool = True


class RoleCreate(RoleBase):
    """Request body for creating a new role. Optionally include permission matrix."""
    matrix: Optional[Dict[str, Dict[str, bool]]] = None


class RoleUpdate(BaseModel):
    """All fields optional — supports partial updates."""
    name: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None
    is_active: Optional[bool] = None
    matrix: Optional[Dict[str, Dict[str, bool]]] = None


class Role(RoleBase):
    """Full role response including permission matrix and user count."""
    id: int
    created_at: datetime
    updated_at: datetime
    matrix: Optional[Dict[str, Dict[str, bool]]] = None
    users: Optional[int] = 0

    class Config:
        from_attributes = True
