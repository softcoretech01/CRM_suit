"""
schemas/masters/general.py
--------------------------
Pydantic schemas for General Business Masters.
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CompanyTypeBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: bool = True

class CompanyTypeCreate(CompanyTypeBase):
    pass

class CompanyType(CompanyTypeBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class IndustryBase(BaseModel):
    code: Optional[str] = None
    name: str
    description: Optional[str] = None
    is_active: bool = True

class IndustryCreate(IndustryBase):
    pass

class Industry(IndustryBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ProductCategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: bool = True

class ProductCategoryCreate(ProductCategoryBase):
    pass

class ProductCategory(ProductCategoryBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
