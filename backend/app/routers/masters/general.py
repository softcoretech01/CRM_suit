"""
routers/masters/general.py
--------------------------
Endpoints for General Masters (Company Types, Industries, Product Categories).
"""
from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from aiomysql.connection import Connection
from app.core.database import get_masters_db
from app.repositories import masters_repo
from app.schemas.masters import general as schemas

router = APIRouter(tags=["Masters — General"])

# ─── Company Types ─────────────────────────────────────────────────────────────

@router.get("/company-types", response_model=List[schemas.CompanyType])
async def get_company_types(db: Connection = Depends(get_masters_db)):
    return await masters_repo.get_all(db, "company_types")

@router.get("/company-types/{record_id}", response_model=schemas.CompanyType)
async def get_company_type(record_id: int, db: Connection = Depends(get_masters_db)):
    record = await masters_repo.get_by_id(db, "company_types", record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Company Type not found")
    return record

@router.post("/company-types", response_model=Dict[str, Any])
async def create_company_type(data: schemas.CompanyTypeCreate, db: Connection = Depends(get_masters_db)):
    record_id = await masters_repo.create_record(db, "company_types", data.dict(exclude_none=True))
    return {"message": "Created successfully", "id": record_id}

@router.put("/company-types/{record_id}")
async def update_company_type(record_id: int, data: schemas.CompanyTypeCreate, db: Connection = Depends(get_masters_db)):
    success = await masters_repo.update_record(db, "company_types", record_id, data.dict(exclude_unset=True))
    if not success:
        raise HTTPException(status_code=404, detail="Company Type not found")
    return {"message": "Updated successfully"}

@router.delete("/company-types/{record_id}")
async def delete_company_type(record_id: int, db: Connection = Depends(get_masters_db)):
    success = await masters_repo.delete_record(db, "company_types", record_id)
    if not success:
        raise HTTPException(status_code=404, detail="Company Type not found")
    return {"message": "Deleted successfully"}


# ─── Industries ────────────────────────────────────────────────────────────────

@router.get("/industries", response_model=List[schemas.Industry])
async def get_industries(db: Connection = Depends(get_masters_db)):
    return await masters_repo.get_all(db, "industries")

@router.get("/industries/{record_id}", response_model=schemas.Industry)
async def get_industry(record_id: int, db: Connection = Depends(get_masters_db)):
    record = await masters_repo.get_by_id(db, "industries", record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Industry not found")
    return record

@router.post("/industries", response_model=Dict[str, Any])
async def create_industry(data: schemas.IndustryCreate, db: Connection = Depends(get_masters_db)):
    record_id = await masters_repo.create_record(db, "industries", data.dict(exclude_none=True))
    return {"message": "Created successfully", "id": record_id}

@router.put("/industries/{record_id}")
async def update_industry(record_id: int, data: schemas.IndustryCreate, db: Connection = Depends(get_masters_db)):
    success = await masters_repo.update_record(db, "industries", record_id, data.dict(exclude_unset=True))
    if not success:
        raise HTTPException(status_code=404, detail="Industry not found")
    return {"message": "Updated successfully"}

@router.delete("/industries/{record_id}")
async def delete_industry(record_id: int, db: Connection = Depends(get_masters_db)):
    success = await masters_repo.delete_record(db, "industries", record_id)
    if not success:
        raise HTTPException(status_code=404, detail="Industry not found")
    return {"message": "Deleted successfully"}


# ─── Product Categories ────────────────────────────────────────────────────────

@router.get("/product-categories", response_model=List[schemas.ProductCategory])
async def get_product_categories(db: Connection = Depends(get_masters_db)):
    return await masters_repo.get_all(db, "product_categories")

@router.get("/product-categories/{record_id}", response_model=schemas.ProductCategory)
async def get_product_category(record_id: int, db: Connection = Depends(get_masters_db)):
    record = await masters_repo.get_by_id(db, "product_categories", record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Product Category not found")
    return record

@router.post("/product-categories", response_model=Dict[str, Any])
async def create_product_category(data: schemas.ProductCategoryCreate, db: Connection = Depends(get_masters_db)):
    record_id = await masters_repo.create_record(db, "product_categories", data.dict(exclude_none=True))
    return {"message": "Created successfully", "id": record_id}

@router.put("/product-categories/{record_id}")
async def update_product_category(record_id: int, data: schemas.ProductCategoryCreate, db: Connection = Depends(get_masters_db)):
    success = await masters_repo.update_record(db, "product_categories", record_id, data.dict(exclude_unset=True))
    if not success:
        raise HTTPException(status_code=404, detail="Product Category not found")
    return {"message": "Updated successfully"}

@router.delete("/product-categories/{record_id}")
async def delete_product_category(record_id: int, db: Connection = Depends(get_masters_db)):
    success = await masters_repo.delete_record(db, "product_categories", record_id)
    if not success:
        raise HTTPException(status_code=404, detail="Product Category not found")
    return {"message": "Deleted successfully"}
