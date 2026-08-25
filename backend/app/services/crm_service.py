from fastapi import HTTPException
from aiomysql.connection import Connection
from app.repositories import crm_repo

async def get_records(conn: Connection, table: str, tenant_id: int):
    return await crm_repo.get_crm_records(conn, table, tenant_id)

async def create_record(conn: Connection, table: str, tenant_id: int, data: dict):
    return await crm_repo.create_crm_record(conn, table, tenant_id, data)

async def update_record(conn: Connection, table: str, tenant_id: int, record_id: int, data: dict):
    updated = await crm_repo.update_crm_record(conn, table, tenant_id, record_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="Record not found")
    return True

async def delete_record(conn: Connection, table: str, tenant_id: int, record_id: int):
    deleted = await crm_repo.delete_crm_record(conn, table, tenant_id, record_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Record not found")
    return True
