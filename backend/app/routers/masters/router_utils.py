from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any, Optional
from aiomysql.connection import Connection
from app.core.database import get_masters_db
from app.repositories import masters_repo

def create_global_master_routes(router: APIRouter, path: str, entity_table: str, schema_class, create_schema, update_schema=None):
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
        record_id = await masters_repo.create_record(db, entity_table, data.dict(exclude_none=True))
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
