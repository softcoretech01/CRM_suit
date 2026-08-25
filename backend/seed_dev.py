import asyncio
from app.core.database import db
from app.repositories import admin_repo, masters_repo
from app.repositories import admin_repo
from app.core.security import get_password_hash

async def seed():
    await db.connect()
    
    # 1. Create a Master Tenant Company
    print("Creating Master Tenant Company...")
    async with db.admin_pool.acquire() as conn:
        tenant_id = await admin_repo.create_company(conn, {
            "name": "Techspire Solutions",
            "contact_name": "Admin",
            "contact_email": "admin@techspire.com",
            "status": "ACTIVE"
        })
    print(f"Created Tenant ID: {tenant_id}")
    
    # 2. Create Roles
    print("Creating Roles...")
    async with db.admin_pool.acquire() as conn:
        role_id = await admin_repo.create_role(conn, {
            "name": "Super Admin",
            "description": "Full access to all modules"
        })
    print(f"Created Role ID: {role_id}")
    
    # 3. Create Super Admin User
    print("Creating Super Admin User...")
    async with db.admin_pool.acquire() as conn:
        user_id = await admin_repo.create_user(conn, tenant_id, {
            "username": "admin",
            "email": "admin@techspire.com",
            "name": "System Administrator",
            "password_hash": get_password_hash("Password@123"),
            "role_id": role_id,
            "tenant_company_id": tenant_id,
            "status": "ACTIVE"
        })
    print(f"Created Admin User ID: {user_id}")
    
    await db.disconnect()
    print("Seed complete! You can now login with admin / Password@123")

if __name__ == "__main__":
    asyncio.run(seed())
