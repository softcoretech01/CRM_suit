"""
schemas/admin/user.py
---------------------
Pydantic schemas for Users (tenant-scoped).
"""
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, date


class UserBase(BaseModel):
    name: str
    department: Optional[str] = None
    designation: Optional[str] = None
    joining_date: Optional[date] = None
    username: Optional[str] = None
    email: EmailStr
    mobile: Optional[str] = None
    role_id: Optional[int] = None
    status: str = 'Active'
    color: Optional[str] = None
    profile_pic: Optional[str] = None
    signature_url: Optional[str] = None
    is_active: bool = True


class UserCreate(UserBase):
    """User creation — requires a plain-text password (will be hashed server-side)."""
    password: str
    companyId: Optional[int] = None


class UserUpdate(BaseModel):
    """All fields optional — supports full or partial updates."""
    name: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    joining_date: Optional[date] = None
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    mobile: Optional[str] = None
    role_id: Optional[int] = None
    status: Optional[str] = None
    color: Optional[str] = None
    profile_pic: Optional[str] = None
    signature_url: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None  # Hashed before saving
    companyId: Optional[int] = None


class UserResponse(BaseModel):
    """Safe user response — never exposes password_hash."""
    id: int
    tenant_company_id: int
    name: str
    department: Optional[str] = None
    designation: Optional[str] = None
    joining_date: Optional[date] = None
    username: Optional[str] = None
    email: str
    mobile: Optional[str] = None
    role_id: Optional[int] = None
    status: str
    color: Optional[str] = None
    profile_pic: Optional[str] = None
    signature_url: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    # Joined fields from repo query
    role: Optional[str] = None
    company_name: Optional[str] = None
    company_logo: Optional[str] = None

    class Config:
        from_attributes = True


# Legacy aliases
User = UserResponse


class UserListResponse(UserResponse):
    """Extended response used for list views."""
    pass
