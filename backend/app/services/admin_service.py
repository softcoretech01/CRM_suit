from fastapi import HTTPException, status
from aiomysql.connection import Connection
from app.repositories import admin_repo
from app.core.security import get_password_hash

async def get_users(conn: Connection):
    return await admin_repo.get_users(conn)

async def create_user(conn: Connection, data: dict):
    # Check if user exists
    user = await admin_repo.get_user_by_username(conn, data["username"])
    if user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # Hash password
    data["password_hash"] = get_password_hash(data.pop("password"))
    
    user_id = await admin_repo.create_user(conn, data)
    return user_id

async def update_user(conn: Connection, user_id: int, data: dict):
    if "password" in data and data["password"]:
        data["password_hash"] = get_password_hash(data.pop("password"))
    elif "password" in data:
        data.pop("password")
        
    updated = await admin_repo.update_user(conn, user_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="User not found")
    return True

async def delete_user(conn: Connection, user_id: int):
    deleted = await admin_repo.delete_user(conn, user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="User not found")
    return True

async def get_roles(conn: Connection):
    return await admin_repo.get_roles(conn)

async def create_role(conn: Connection, data: dict):
    return await admin_repo.create_role(conn, data)

async def update_role(conn: Connection, role_id: int, data: dict):
    updated = await admin_repo.update_role(conn, role_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="Role not found")
    return True

async def delete_role(conn: Connection, role_id: int):
    deleted = await admin_repo.delete_role(conn, role_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Role not found")
    return True
