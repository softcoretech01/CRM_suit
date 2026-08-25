"""
routers/masters/sales.py
------------------------
Endpoints for Sales Configuration Masters.
"""
from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from aiomysql.connection import Connection
from app.core.database import get_masters_db
from app.repositories import masters_repo
from app.schemas.masters import sales as schemas

router = APIRouter(tags=["Masters — Sales"])

# ─── Lead Sources ─────────────────────────────────────────────────────────────

@router.get("/lead-sources", response_model=List[schemas.LeadSource])
async def get_lead_sources(db: Connection = Depends(get_masters_db)):
    return await masters_repo.get_all(db, "lead_sources")

@router.get("/lead-sources/{record_id}", response_model=schemas.LeadSource)
async def get_lead_source(record_id: int, db: Connection = Depends(get_masters_db)):
    record = await masters_repo.get_by_id(db, "lead_sources", record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Lead Source not found")
    return record

@router.post("/lead-sources", response_model=Dict[str, Any])
async def create_lead_source(data: schemas.LeadSourceCreate, db: Connection = Depends(get_masters_db)):
    record_id = await masters_repo.create_record(db, "lead_sources", data.dict(exclude_none=True))
    return {"message": "Created successfully", "id": record_id}

@router.put("/lead-sources/{record_id}")
async def update_lead_source(record_id: int, data: schemas.LeadSourceCreate, db: Connection = Depends(get_masters_db)):
    success = await masters_repo.update_record(db, "lead_sources", record_id, data.dict(exclude_unset=True))
    if not success:
        raise HTTPException(status_code=404, detail="Lead Source not found")
    return {"message": "Updated successfully"}

@router.delete("/lead-sources/{record_id}")
async def delete_lead_source(record_id: int, db: Connection = Depends(get_masters_db)):
    success = await masters_repo.delete_record(db, "lead_sources", record_id)
    if not success:
        raise HTTPException(status_code=404, detail="Lead Source not found")
    return {"message": "Deleted successfully"}


# ─── Campaigns ────────────────────────────────────────────────────────────────

@router.get("/campaigns", response_model=List[schemas.Campaign])
async def get_campaigns(db: Connection = Depends(get_masters_db)):
    return await masters_repo.get_all(db, "campaigns")

@router.get("/campaigns/{record_id}", response_model=schemas.Campaign)
async def get_campaign(record_id: int, db: Connection = Depends(get_masters_db)):
    record = await masters_repo.get_by_id(db, "campaigns", record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return record

@router.post("/campaigns", response_model=Dict[str, Any])
async def create_campaign(data: schemas.CampaignCreate, db: Connection = Depends(get_masters_db)):
    record_id = await masters_repo.create_record(db, "campaigns", data.dict(exclude_none=True))
    return {"message": "Created successfully", "id": record_id}

@router.put("/campaigns/{record_id}")
async def update_campaign(record_id: int, data: schemas.CampaignCreate, db: Connection = Depends(get_masters_db)):
    success = await masters_repo.update_record(db, "campaigns", record_id, data.dict(exclude_unset=True))
    if not success:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return {"message": "Updated successfully"}

@router.delete("/campaigns/{record_id}")
async def delete_campaign(record_id: int, db: Connection = Depends(get_masters_db)):
    success = await masters_repo.delete_record(db, "campaigns", record_id)
    if not success:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return {"message": "Deleted successfully"}


# ─── Activity Types ───────────────────────────────────────────────────────────

@router.get("/activity-types", response_model=List[schemas.ActivityType])
async def get_activity_types(db: Connection = Depends(get_masters_db)):
    return await masters_repo.get_all(db, "activity_types")

@router.get("/activity-types/{record_id}", response_model=schemas.ActivityType)
async def get_activity_type(record_id: int, db: Connection = Depends(get_masters_db)):
    record = await masters_repo.get_by_id(db, "activity_types", record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Activity Type not found")
    return record

@router.post("/activity-types", response_model=Dict[str, Any])
async def create_activity_type(data: schemas.ActivityTypeCreate, db: Connection = Depends(get_masters_db)):
    record_id = await masters_repo.create_record(db, "activity_types", data.dict(exclude_none=True))
    return {"message": "Created successfully", "id": record_id}

@router.put("/activity-types/{record_id}")
async def update_activity_type(record_id: int, data: schemas.ActivityTypeCreate, db: Connection = Depends(get_masters_db)):
    success = await masters_repo.update_record(db, "activity_types", record_id, data.dict(exclude_unset=True))
    if not success:
        raise HTTPException(status_code=404, detail="Activity Type not found")
    return {"message": "Updated successfully"}

@router.delete("/activity-types/{record_id}")
async def delete_activity_type(record_id: int, db: Connection = Depends(get_masters_db)):
    success = await masters_repo.delete_record(db, "activity_types", record_id)
    if not success:
        raise HTTPException(status_code=404, detail="Activity Type not found")
    return {"message": "Deleted successfully"}


# ─── Lead Statuses ────────────────────────────────────────────────────────────

@router.get("/lead-statuses", response_model=List[schemas.LeadStatus])
async def get_lead_statuses(db: Connection = Depends(get_masters_db)):
    return await masters_repo.get_all(db, "lead_statuses")

@router.get("/lead-statuses/{record_id}", response_model=schemas.LeadStatus)
async def get_lead_status(record_id: int, db: Connection = Depends(get_masters_db)):
    record = await masters_repo.get_by_id(db, "lead_statuses", record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Lead Status not found")
    return record

@router.post("/lead-statuses", response_model=Dict[str, Any])
async def create_lead_status(data: schemas.LeadStatusCreate, db: Connection = Depends(get_masters_db)):
    record_id = await masters_repo.create_record(db, "lead_statuses", data.dict(exclude_none=True))
    return {"message": "Created successfully", "id": record_id}

@router.put("/lead-statuses/{record_id}")
async def update_lead_status(record_id: int, data: schemas.LeadStatusCreate, db: Connection = Depends(get_masters_db)):
    success = await masters_repo.update_record(db, "lead_statuses", record_id, data.dict(exclude_unset=True))
    if not success:
        raise HTTPException(status_code=404, detail="Lead Status not found")
    return {"message": "Updated successfully"}

@router.delete("/lead-statuses/{record_id}")
async def delete_lead_status(record_id: int, db: Connection = Depends(get_masters_db)):
    success = await masters_repo.delete_record(db, "lead_statuses", record_id)
    if not success:
        raise HTTPException(status_code=404, detail="Lead Status not found")
    return {"message": "Deleted successfully"}


# ─── Next Actions ─────────────────────────────────────────────────────────────

@router.get("/next-actions", response_model=List[schemas.NextAction])
async def get_next_actions(db: Connection = Depends(get_masters_db)):
    return await masters_repo.get_all(db, "next_actions")

@router.get("/next-actions/{record_id}", response_model=schemas.NextAction)
async def get_next_action(record_id: int, db: Connection = Depends(get_masters_db)):
    record = await masters_repo.get_by_id(db, "next_actions", record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Next Action not found")
    return record

@router.post("/next-actions", response_model=Dict[str, Any])
async def create_next_action(data: schemas.NextActionCreate, db: Connection = Depends(get_masters_db)):
    record_id = await masters_repo.create_record(db, "next_actions", data.dict(exclude_none=True))
    return {"message": "Created successfully", "id": record_id}

@router.put("/next-actions/{record_id}")
async def update_next_action(record_id: int, data: schemas.NextActionCreate, db: Connection = Depends(get_masters_db)):
    success = await masters_repo.update_record(db, "next_actions", record_id, data.dict(exclude_unset=True))
    if not success:
        raise HTTPException(status_code=404, detail="Next Action not found")
    return {"message": "Updated successfully"}

@router.delete("/next-actions/{record_id}")
async def delete_next_action(record_id: int, db: Connection = Depends(get_masters_db)):
    success = await masters_repo.delete_record(db, "next_actions", record_id)
    if not success:
        raise HTTPException(status_code=404, detail="Next Action not found")
    return {"message": "Deleted successfully"}


# ─── Priorities ───────────────────────────────────────────────────────────────

@router.get("/priorities", response_model=List[schemas.Priority])
async def get_priorities(db: Connection = Depends(get_masters_db)):
    return await masters_repo.get_all(db, "priorities")

@router.get("/priorities/{record_id}", response_model=schemas.Priority)
async def get_priority(record_id: int, db: Connection = Depends(get_masters_db)):
    record = await masters_repo.get_by_id(db, "priorities", record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Priority not found")
    return record

@router.post("/priorities", response_model=Dict[str, Any])
async def create_priority(data: schemas.PriorityCreate, db: Connection = Depends(get_masters_db)):
    record_id = await masters_repo.create_record(db, "priorities", data.dict(exclude_none=True))
    return {"message": "Created successfully", "id": record_id}

@router.put("/priorities/{record_id}")
async def update_priority(record_id: int, data: schemas.PriorityCreate, db: Connection = Depends(get_masters_db)):
    success = await masters_repo.update_record(db, "priorities", record_id, data.dict(exclude_unset=True))
    if not success:
        raise HTTPException(status_code=404, detail="Priority not found")
    return {"message": "Updated successfully"}

@router.delete("/priorities/{record_id}")
async def delete_priority(record_id: int, db: Connection = Depends(get_masters_db)):
    success = await masters_repo.delete_record(db, "priorities", record_id)
    if not success:
        raise HTTPException(status_code=404, detail="Priority not found")
    return {"message": "Deleted successfully"}
