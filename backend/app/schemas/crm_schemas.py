from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime, date

class CrmCompanyBase(BaseModel):
    name: str
    industry: Optional[str] = None
    type: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    address: Optional[str] = None
    remarks: Optional[str] = None
    status: Optional[str] = "ACTIVE"
    created_by: Optional[int] = None
    assigned_to: Optional[int] = None

class CrmCompanyCreate(CrmCompanyBase):
    pass

class CrmCompanyUpdate(CrmCompanyBase):
    name: Optional[str] = None

class CrmCompanyResponse(CrmCompanyBase):
    id: int
    tenant_company_id: int
    created_at: datetime
    updated_at: datetime

class ProductBase(BaseModel):
    name: str
    sku_code: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    unit: Optional[str] = None
    unit_price: Optional[float] = None
    tax_rate: Optional[float] = None
    created_by: Optional[int] = None
    is_active: bool = True

class ProductCreate(ProductBase):
    pass

class ProductUpdate(ProductBase):
    name: Optional[str] = None

class ProductResponse(ProductBase):
    id: int
    tenant_company_id: int
    created_at: datetime
    updated_at: datetime
class LeadBase(BaseModel):
    company_id: Optional[int] = None
    lead_name: Optional[str] = None
    contact_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    source: Optional[str] = None
    status: Optional[str] = "New"
    priority: Optional[str] = None
    assigned_to: Optional[int] = None
    created_by: Optional[int] = None
    notes: Optional[str] = None
    value: Optional[float] = None

    @field_validator('email', mode='before')
    @classmethod
    def _blank_email_to_none(cls, v):
        if v is None or (isinstance(v, str) and v.strip() == ''):
            return None
        return v

class LeadCreate(LeadBase):
    pass

class LeadUpdate(LeadBase):
    pass

class LeadResponse(LeadBase):
    id: int
    tenant_company_id: int
    created_at: datetime
    updated_at: datetime

class ContactBase(BaseModel):
    company_id: Optional[int] = None
    first_name: str
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    mobile: Optional[str] = None
    whatsapp: Optional[str] = None
    linkedin: Optional[str] = None
    designation: Optional[str] = None
    department: Optional[str] = None
    source: Optional[str] = None
    status: Optional[str] = "ACTIVE"
    notes: Optional[str] = None
    assigned_to: Optional[int] = None
    created_by: Optional[int] = None

    @field_validator('email', mode='before')
    @classmethod
    def _blank_email_to_none(cls, v):
        # Treat an empty/whitespace email as "not provided" so EmailStr validation is skipped.
        if v is None or (isinstance(v, str) and v.strip() == ''):
            return None
        return v

class ContactCreate(ContactBase):
    pass

class ContactUpdate(ContactBase):
    first_name: Optional[str] = None

class ContactResponse(ContactBase):
    id: int
    tenant_company_id: int
    created_at: datetime
    updated_at: datetime

class OpportunityBase(BaseModel):
    lead_id: Optional[int] = None
    company_id: Optional[int] = None
    name: str
    description: Optional[str] = None
    value: Optional[float] = None
    stage: Optional[str] = None
    probability: Optional[int] = None
    expected_close_date: Optional[date] = None
    assigned_to: Optional[int] = None
    created_by: Optional[int] = None
    status: Optional[str] = "ACTIVE"

class OpportunityCreate(OpportunityBase):
    pass

class OpportunityUpdate(OpportunityBase):
    name: Optional[str] = None

class OpportunityResponse(OpportunityBase):
    id: int
    tenant_company_id: int
    created_at: datetime
    updated_at: datetime

class ActivityBase(BaseModel):
    company_id: Optional[int] = None
    contact_id: Optional[int] = None
    lead_id: Optional[int] = None
    opportunity_id: Optional[int] = None
    activity_type: Optional[str] = None
    subject: str
    activity_datetime: Optional[datetime] = None
    duration: Optional[int] = None
    outcome: Optional[str] = None
    next_action: Optional[str] = None
    assigned_to: Optional[int] = None
    created_by: Optional[int] = None
    notes: Optional[str] = None

class ActivityCreate(ActivityBase):
    pass

class ActivityUpdate(ActivityBase):
    subject: Optional[str] = None

class ActivityResponse(ActivityBase):
    id: int
    tenant_company_id: int
    created_at: datetime
    updated_at: datetime

class FollowupBase(BaseModel):
    lead_id: Optional[int] = None
    contact_id: Optional[int] = None
    opportunity_id: Optional[int] = None
    followup_date: Optional[datetime] = None
    followup_type: Optional[str] = None
    status: Optional[str] = "Pending"
    notes: Optional[str] = None
    assigned_to: Optional[int] = None
    created_by: Optional[int] = None

class FollowupCreate(FollowupBase):
    pass

class FollowupUpdate(FollowupBase):
    status: Optional[str] = None

class FollowupResponse(FollowupBase):
    id: int
    tenant_company_id: int
    created_at: datetime
    updated_at: datetime


# ─── Lead Conversion ───────────────────────────────────────────────────────────

class LeadConvertPayload(BaseModel):
    opportunity_name: Optional[str] = None
    value: Optional[float] = None
    stage: Optional[str] = "Qualification"
