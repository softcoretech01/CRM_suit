"""
routers/masters/geography.py
----------------------------
Endpoints for Geography Masters (Countries, States, Cities).
"""
from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any, Optional
from aiomysql.connection import Connection
from app.core.database import get_masters_db
from app.repositories import masters_repo
from app.schemas.masters import geography as schemas

router = APIRouter(tags=["Masters — Geography"])

# ─── Countries ──────────────────────────────────────────────────────────────────

@router.get("/countries", response_model=List[schemas.Country])
async def get_countries(db: Connection = Depends(get_masters_db)):
    return await masters_repo.get_all(db, "countries")

@router.get("/countries/{record_id}", response_model=schemas.Country)
async def get_country(record_id: int, db: Connection = Depends(get_masters_db)):
    record = await masters_repo.get_by_id(db, "countries", record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Country not found")
    return record

@router.post("/countries", response_model=Dict[str, Any])
async def create_country(data: schemas.CountryCreate, db: Connection = Depends(get_masters_db)):
    record_id = await masters_repo.create_record(db, "countries", data.dict(exclude_none=True))
    return {"message": "Created successfully", "id": record_id}

@router.put("/countries/{record_id}")
async def update_country(record_id: int, data: schemas.CountryCreate, db: Connection = Depends(get_masters_db)):
    success = await masters_repo.update_record(db, "countries", record_id, data.dict(exclude_unset=True))
    if not success:
        raise HTTPException(status_code=404, detail="Country not found")
    return {"message": "Updated successfully"}

@router.delete("/countries/{record_id}")
async def delete_country(record_id: int, db: Connection = Depends(get_masters_db)):
    success = await masters_repo.delete_record(db, "countries", record_id)
    if not success:
        raise HTTPException(status_code=404, detail="Country not found")
    return {"message": "Deleted successfully"}

# Dependent Global Masters — States (country-scoped)
@router.get("/states", response_model=List[schemas.State])
async def get_states(country_id: Optional[int] = None, db: Connection = Depends(get_masters_db)):
    if country_id:
        return await masters_repo.get_by_foreign_key(db, "states", "country_id", country_id)
    return await masters_repo.get_states_with_country(db)

@router.get("/states/{record_id}", response_model=schemas.State)
async def get_state(record_id: int, db: Connection = Depends(get_masters_db)):
    record = await masters_repo.get_by_id(db, "states", record_id)
    if not record:
        raise HTTPException(status_code=404, detail="State not found")
    return record

@router.post("/states", response_model=Dict[str, Any])
async def create_state(data: schemas.StateCreate, db: Connection = Depends(get_masters_db)):
    record_id = await masters_repo.create_record(db, "states", data.dict(exclude_none=True))
    return {"message": "State created", "id": record_id}

@router.put("/states/{record_id}")
async def update_state(record_id: int, data: schemas.StateCreate, db: Connection = Depends(get_masters_db)):
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
@router.get("/cities", response_model=List[schemas.City])
async def get_cities(state_id: Optional[int] = None, db: Connection = Depends(get_masters_db)):
    if state_id:
        return await masters_repo.get_by_foreign_key(db, "cities", "state_id", state_id)
    return await masters_repo.get_cities_with_state(db)

@router.get("/cities/{record_id}", response_model=schemas.City)
async def get_city(record_id: int, db: Connection = Depends(get_masters_db)):
    record = await masters_repo.get_by_id(db, "cities", record_id)
    if not record:
        raise HTTPException(status_code=404, detail="City not found")
    return record

@router.post("/cities", response_model=Dict[str, Any])
async def create_city(data: schemas.CityCreate, db: Connection = Depends(get_masters_db)):
    record_id = await masters_repo.create_record(db, "cities", data.dict(exclude_none=True))
    return {"message": "City created", "id": record_id}

@router.put("/cities/{record_id}")
async def update_city(record_id: int, data: schemas.CityCreate, db: Connection = Depends(get_masters_db)):
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
