from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class CompanyBase(BaseModel):
    name: str
    contact_name: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_mobile: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    gst_number: Optional[str] = None
    pan_number: Optional[str] = None
    website: Optional[str] = None
    logo_url: Optional[str] = None
    status: Optional[str] = "ACTIVE"

class CompanyCreate(CompanyBase):
    pass

class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    contact_name: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_mobile: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    gst_number: Optional[str] = None
    pan_number: Optional[str] = None
    website: Optional[str] = None
    logo_url: Optional[str] = None
    status: Optional[str] = None

class CompanyResponse(CompanyBase):
    id: int
    created_at: datetime
    updated_at: datetime

class ProductBase(BaseModel):
    name: str
    code: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    unit: Optional[str] = None
    price: Optional[float] = None
    status: Optional[str] = "ACTIVE"

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    unit: Optional[str] = None
    price: Optional[float] = None
    status: Optional[str] = None

class ProductResponse(ProductBase):
    id: int
    tenant_company_id: int
    created_at: datetime
    updated_at: datetime
