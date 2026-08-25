"""
schemas/master_schema.py
------------------------
Backward-compatibility shim.
All schemas have moved to schemas/masters/*.py
Import from there directly for new code.
"""
from app.schemas.masters.geography import (
    CountryBase, CountryCreate, Country,
    StateBase, StateCreate, State,
    CityBase, CityCreate, City
)
from app.schemas.masters.general import (
    CompanyTypeBase, CompanyTypeCreate, CompanyType,
    IndustryBase, IndustryCreate, Industry,
    ProductCategoryBase, ProductCategoryCreate, ProductCategory
)
from app.schemas.masters.sales import (
    LeadSourceBase, LeadSourceCreate, LeadSource,
    CampaignBase, CampaignCreate, Campaign,
    ActivityTypeBase, ActivityTypeCreate, ActivityType,
    LeadStatusBase, LeadStatusCreate, LeadStatus,
    NextActionBase, NextActionCreate, NextAction,
    PriorityBase, PriorityCreate, Priority
)

__all__ = [
    "CountryBase", "CountryCreate", "Country",
    "StateBase", "StateCreate", "State",
    "CityBase", "CityCreate", "City",
    "CompanyTypeBase", "CompanyTypeCreate", "CompanyType",
    "IndustryBase", "IndustryCreate", "Industry",
    "ProductCategoryBase", "ProductCategoryCreate", "ProductCategory",
    "LeadSourceBase", "LeadSourceCreate", "LeadSource",
    "CampaignBase", "CampaignCreate", "Campaign",
    "ActivityTypeBase", "ActivityTypeCreate", "ActivityType",
    "LeadStatusBase", "LeadStatusCreate", "LeadStatus",
    "NextActionBase", "NextActionCreate", "NextAction",
    "PriorityBase", "PriorityCreate", "Priority"
]
