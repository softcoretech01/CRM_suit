"""
schemas/masters/geography.py
----------------------------
Pydantic schemas for Geography-related masters.
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CountryBase(BaseModel):
    code: Optional[str] = None
    name: str
    is_active: bool = True

class CountryCreate(CountryBase):
    pass

class Country(CountryBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class StateBase(BaseModel):
    country_id: int
    country: Optional[str] = None
    country_name: Optional[str] = None
    code: Optional[str] = None
    name: str
    is_active: bool = True

class StateCreate(StateBase):
    pass

class State(StateBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class CityBase(BaseModel):
    state_id: int
    state: Optional[str] = None
    state_name: Optional[str] = None
    country_id: Optional[int] = None
    country_name: Optional[str] = None
    name: str
    is_active: bool = True

class CityCreate(CityBase):
    pass

class City(CityBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
