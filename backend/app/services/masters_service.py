from fastapi import HTTPException
from aiomysql.connection import Connection
from app.repositories import masters_repo

async def get_companies(conn: Connection):
    return await masters_repo.get_companies(conn)

async def create_company(conn: Connection, data: dict):
    return await masters_repo.create_company(conn, data)

async def update_company(conn: Connection, company_id: int, data: dict):
    updated = await masters_repo.update_company(conn, company_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="Company not found")
    return True

async def delete_company(conn: Connection, company_id: int):
    deleted = await masters_repo.delete_company(conn, company_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Company not found")
    return True

async def get_products(conn: Connection, tenant_id: int):
    return await masters_repo.get_products(conn, tenant_id)

async def create_product(conn: Connection, tenant_id: int, data: dict):
    return await masters_repo.create_product(conn, tenant_id, data)

async def update_product(conn: Connection, tenant_id: int, product_id: int, data: dict):
    updated = await masters_repo.update_product(conn, tenant_id, product_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="Product not found")
    return True

async def delete_product(conn: Connection, tenant_id: int, product_id: int):
    deleted = await masters_repo.delete_product(conn, tenant_id, product_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Product not found")
    return True
