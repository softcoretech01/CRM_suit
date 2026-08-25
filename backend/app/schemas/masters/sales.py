"""
schemas/masters/sales.py
------------------------
Pydantic schemas for Sales Configuration Masters.
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date

class LeadSourceBase(BaseModel):
    code: Optional[str] = None
    name: str
    description: Optional[str] = None
    is_active: bool = True

class LeadSourceCreate(LeadSourceBase):
    pass

class LeadSource(LeadSourceBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class CampaignBase(BaseModel):
    name: str
    channel: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    description: Optional[str] = None
    is_active: bool = True

class CampaignCreate(CampaignBase):
    pass

class Campaign(CampaignBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ActivityTypeBase(BaseModel):
    name: str
    color_code: Optional[str] = None
    icon: Optional[str] = None
    description: Optional[str] = None
    is_active: bool = True

class ActivityTypeCreate(ActivityTypeBase):
    pass

class ActivityType(ActivityTypeBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class LeadStatusBase(BaseModel):
    name: str
    color_code: Optional[str] = None
    sort_order: int = 0
    description: Optional[str] = None
    is_active: bool = True

class LeadStatusCreate(LeadStatusBase):
    pass

class LeadStatus(LeadStatusBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class NextActionBase(BaseModel):
    name: str
    color_code: Optional[str] = None
    sort_order: int = 0
    description: Optional[str] = None
    is_active: bool = True

class NextActionCreate(NextActionBase):
    pass

class NextAction(NextActionBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class PriorityBase(BaseModel):
    name: str
    color_code: Optional[str] = None
    sort_order: int = 0
    description: Optional[str] = None
    is_active: bool = True

class PriorityCreate(PriorityBase):
    pass

class Priority(PriorityBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
