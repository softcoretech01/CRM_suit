"""
schemas/admin/company.py
------------------------
Pydantic schemas for Tenant Companies (Admin_crm.companies).
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CompanyBase(BaseModel):
    name: str
    industry_id: Optional[int] = None
    type_id: Optional[int] = None
    founder: Optional[str] = None
    address: Optional[str] = None
    city_id: Optional[int] = None
    state_id: Optional[int] = None
    country_id: Optional[int] = None
    remarks: Optional[str] = None
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    contact_mobile: Optional[str] = None
    contact_designation: Optional[str] = None
    logo_url: Optional[str] = None
    status: str = "Active"
    is_active: bool = True
    max_users: int = 2


class CompanyCreate(CompanyBase):
    """Request body for creating a new tenant company."""
    pass


class CompanyUpdate(BaseModel):
    """All fields optional — supports full or partial updates."""
    name: Optional[str] = None
    industry_id: Optional[int] = None
    type_id: Optional[int] = None
    founder: Optional[str] = None
    address: Optional[str] = None
    city_id: Optional[int] = None
    state_id: Optional[int] = None
    country_id: Optional[int] = None
    remarks: Optional[str] = None
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    contact_mobile: Optional[str] = None
    contact_designation: Optional[str] = None
    logo_url: Optional[str] = None
    status: Optional[str] = None
    is_active: Optional[bool] = None
    max_users: Optional[int] = None


class Company(CompanyBase):
    """Full company response."""
    id: int
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None

    class Config:
        from_attributes = True
