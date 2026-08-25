from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from typing import List, Dict, Any, Optional
from app.core.database import get_masters_db, get_crm_db, get_admin_db
from aiomysql.connection import Connection
from app.repositories import masters_repo
from app.schemas import master_schema
import os
import time

router = APIRouter(tags=["Masters"])

@router.get("/dashboard/summary")
async def get_dashboard_summary(db: Connection = Depends(get_masters_db)):
    async with db.cursor() as cur:
        await cur.execute("SELECT COUNT(*) FROM campaigns")
        total_campaigns = (await cur.fetchone())[0]
        await cur.execute("SELECT COUNT(*) FROM lead_sources")
        total_lead_sources = (await cur.fetchone())[0]
        await cur.execute("SELECT COUNT(*) FROM industries")
        total_industries = (await cur.fetchone())[0]
        await cur.execute("SELECT COUNT(*) FROM product_categories")
        total_product_categories = (await cur.fetchone())[0]
        await cur.execute("SELECT COUNT(*) FROM company_types")
        total_company_types = (await cur.fetchone())[0]
        await cur.execute("SELECT COUNT(*) FROM activity_types")
        total_activity_types = (await cur.fetchone())[0]

    return {
        "success": True,
        "data": {
            "total_activity_types": total_activity_types,
            "total_campaigns": total_campaigns,
            "total_lead_sources": total_lead_sources,
            "total_industries": total_industries,
            "total_product_categories": total_product_categories,
            "total_company_types": total_company_types
        }
    }

@router.get("/dashboard/distributions")
async def get_dashboard_distributions(db: Connection = Depends(get_masters_db)):
    async with db.cursor() as cur:
        await cur.execute("SELECT COUNT(*) FROM lead_sources")
        ls = (await cur.fetchone())[0]
        await cur.execute("SELECT COUNT(*) FROM campaigns")
        camp = (await cur.fetchone())[0]
        await cur.execute("SELECT COUNT(*) FROM activity_types")
        act = (await cur.fetchone())[0]
        await cur.execute("SELECT COUNT(*) FROM priorities")
        prio = (await cur.fetchone())[0]
        await cur.execute("SELECT COUNT(*) FROM lead_statuses")
        stat = (await cur.fetchone())[0]
        await cur.execute("SELECT COUNT(*) FROM next_actions")
        nxt = (await cur.fetchone())[0]
        await cur.execute("SELECT COUNT(*) FROM product_categories")
        prod = (await cur.fetchone())[0]
        await cur.execute("SELECT COUNT(*) FROM company_types")
        comp = (await cur.fetchone())[0]
        await cur.execute("SELECT COUNT(*) FROM industries")
        ind = (await cur.fetchone())[0]
        
    return {
        "success": True,
        "data": {
            "master_records": [
                {"name": "Lead Sources", "value": ls},
                {"name": "Campaigns", "value": camp},
                {"name": "Activity Types", "value": act},
                {"name": "Priorities", "value": prio},
                {"name": "Lead Statuses", "value": stat},
                {"name": "Next Actions", "value": nxt},
                {"name": "Product Categories", "value": prod},
                {"name": "Company Types", "value": comp},
                {"name": "Industries", "value": ind}
            ]
        }
    }

# 1. Global Entity Router factory
def create_global_master_routes(path: str, entity_table: str, schema_class, create_schema, update_schema=None):
    if update_schema is None:
        update_schema = create_schema

    @router.get(f"/{path}", response_model=List[schema_class])
    async def get_all(db: Connection = Depends(get_masters_db)):
        return await masters_repo.get_all(db, entity_table)

    @router.get(f"/{path}/{{record_id}}", response_model=schema_class)
    async def get_one(record_id: int, db: Connection = Depends(get_masters_db)):
        record = await masters_repo.get_by_id(db, entity_table, record_id)
        if not record:
            raise HTTPException(status_code=404, detail="Record not found")
        return record

    @router.post(f"/{path}", response_model=Dict[str, Any])
    async def create(data: create_schema, db: Connection = Depends(get_masters_db)):
        record_id = await masters_repo.create_record(db, entity_table, data.dict())
        return {"message": "Created successfully", "id": record_id}

    @router.put(f"/{path}/{{record_id}}")
    async def update(record_id: int, data: update_schema, db: Connection = Depends(get_masters_db)):
        success = await masters_repo.update_record(db, entity_table, record_id, data.dict(exclude_unset=True))
        if not success:
            raise HTTPException(status_code=404, detail="Record not found")
        return {"message": "Updated successfully"}

    @router.delete(f"/{path}/{{record_id}}")
    async def delete(record_id: int, db: Connection = Depends(get_masters_db)):
        success = await masters_repo.delete_record(db, entity_table, record_id)
        if not success:
            raise HTTPException(status_code=404, detail="Record not found")
        return {"message": "Deleted successfully"}


# Register Global Masters
create_global_master_routes("countries", "countries", master_schema.Country, master_schema.CountryCreate)
create_global_master_routes("company-types", "company_types", master_schema.CompanyType, master_schema.CompanyTypeCreate)
create_global_master_routes("industries", "industries", master_schema.Industry, master_schema.IndustryCreate)
create_global_master_routes("product-categories", "product_categories", master_schema.ProductCategory, master_schema.ProductCategoryCreate)
create_global_master_routes("lead-sources", "lead_sources", master_schema.LeadSource, master_schema.LeadSourceCreate)
create_global_master_routes("campaigns", "campaigns", master_schema.Campaign, master_schema.CampaignCreate)
create_global_master_routes("activity-types", "activity_types", master_schema.ActivityType, master_schema.ActivityTypeCreate)
create_global_master_routes("lead-statuses", "lead_statuses", master_schema.LeadStatus, master_schema.LeadStatusCreate)
create_global_master_routes("next-actions", "next_actions", master_schema.NextAction, master_schema.NextActionCreate)
create_global_master_routes("priorities", "priorities", master_schema.Priority, master_schema.PriorityCreate)

# Dependent Global Masters — States (country-scoped)
@router.get("/states", response_model=List[master_schema.State])
async def get_states(country_id: Optional[int] = None, db: Connection = Depends(get_masters_db)):
    if country_id:
        states = await masters_repo.get_states_with_country(db)
        return [s for s in states if s['country_id'] == country_id]
    return await masters_repo.get_states_with_country(db)

@router.get("/states/{record_id}", response_model=master_schema.State)
async def get_state(record_id: int, db: Connection = Depends(get_masters_db)):
    record = await masters_repo.get_by_id(db, "states", record_id)
    if not record:
        raise HTTPException(status_code=404, detail="State not found")
    return record

@router.post("/states", response_model=Dict[str, Any])
async def create_state(data: master_schema.StateCreate, db: Connection = Depends(get_masters_db)):
    record_id = await masters_repo.create_record(db, "states", data.dict(exclude_none=True))
    return {"message": "State created", "id": record_id}

@router.put("/states/{record_id}")
async def update_state(record_id: int, data: master_schema.StateCreate, db: Connection = Depends(get_masters_db)):
    success = await masters_repo.update_record(db, "states", record_id, data.dict(exclude_unset=True))
    if not success:
        raise HTTPException(status_code=404, detail="State not found")
    return {"message": "State updated"}

@router.delete("/states/{record_id}")
async def delete_state(record_id: int, db: Connection = Depends(get_masters_db)):
    success = await masters_repo.delete_record(db, "states", record_id)
    if not success:
        raise HTTPException(status_code=404, detail="State not found")
    return {"message": "State deleted"}


# Dependent Global Masters — Cities (state-scoped)
@router.get("/cities", response_model=List[master_schema.City])
async def get_cities(state_id: Optional[int] = None, db: Connection = Depends(get_masters_db)):
    if state_id:
        cities = await masters_repo.get_cities_with_state(db)
        return [c for c in cities if c['state_id'] == state_id]
    return await masters_repo.get_cities_with_state(db)

@router.get("/cities/{record_id}", response_model=master_schema.City)
async def get_city(record_id: int, db: Connection = Depends(get_masters_db)):
    record = await masters_repo.get_by_id(db, "cities", record_id)
    if not record:
        raise HTTPException(status_code=404, detail="City not found")
    return record

@router.post("/cities", response_model=Dict[str, Any])
async def create_city(data: master_schema.CityCreate, db: Connection = Depends(get_masters_db)):
    record_id = await masters_repo.create_record(db, "cities", data.dict(exclude_none=True))
    return {"message": "City created", "id": record_id}

@router.put("/cities/{record_id}")
async def update_city(record_id: int, data: master_schema.CityCreate, db: Connection = Depends(get_masters_db)):
    success = await masters_repo.update_record(db, "cities", record_id, data.dict(exclude_unset=True))
    if not success:
        raise HTTPException(status_code=404, detail="City not found")
    return {"message": "City updated"}

@router.delete("/cities/{record_id}")
async def delete_city(record_id: int, db: Connection = Depends(get_masters_db)):
    success = await masters_repo.delete_record(db, "cities", record_id)
    if not success:
        raise HTTPException(status_code=404, detail="City not found")
    return {"message": "City deleted"}
