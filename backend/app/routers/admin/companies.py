"""
routers/admin/companies.py
--------------------------
All Tenant Company endpoints under /api/admin/companies
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
import os
import shutil
from pathlib import Path
from aiomysql.connection import Connection
from app.core.database import get_admin_db
from app.core.dependencies import get_current_user
from app.repositories import admin_repo
from app.schemas.admin.company import CompanyCreate, CompanyUpdate, Company

router = APIRouter(prefix="/companies", tags=["Admin — Companies"])


@router.get("", summary="List all tenant companies")
async def get_companies(
    db: Connection = Depends(get_admin_db)
):
    companies = await admin_repo.get_companies(db)
    return {"success": True, "data": companies}


@router.get("/{company_id}", summary="Get a single company by ID")
async def get_company(
    company_id: int,
    db: Connection = Depends(get_admin_db)
):
    company = await admin_repo.get_company(db, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return {"success": True, "data": company}


@router.post("", status_code=201, summary="Create a new tenant company")
async def create_company(
    data: CompanyCreate,
    db: Connection = Depends(get_admin_db)
):
    record_id = await admin_repo.create_company(db, data.dict(exclude_none=True))
    return {"success": True, "message": "Company created successfully", "data": {"id": record_id}}


@router.put("/{company_id}", summary="Update a tenant company")
async def update_company(
    company_id: int,
    data: CompanyUpdate,
    db: Connection = Depends(get_admin_db)
):
    success = await admin_repo.update_company(db, company_id, data.dict(exclude_unset=True))
    if not success:
        raise HTTPException(status_code=404, detail="Company not found")
    return {"success": True, "message": "Company updated successfully"}


@router.delete("/{company_id}", summary="Hard-delete a tenant company")
async def delete_company(
    company_id: int,
    db: Connection = Depends(get_admin_db)
):
    success = await admin_repo.delete_company(db, company_id)
    if not success:
        raise HTTPException(status_code=404, detail="Company not found")
    return {"success": True, "message": "Company deleted successfully"}

@router.post("/upload-logo", summary="Upload a company logo")
async def upload_company_logo(file: UploadFile = File(...)):
    UPLOAD_DIR = Path("uploads/logos")
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    
    file_extension = file.filename.split(".")[-1]
    import uuid
    new_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = UPLOAD_DIR / new_filename
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return {"success": True, "logo_url": f"/uploads/logos/{new_filename}"}
