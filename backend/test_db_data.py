import asyncio
from app.core.database import db
import aiomysql

async def test():
    await db.connect()
    async with db.admin_pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute("SELECT u.*, r.name as role, c.name as company_name FROM users u LEFT JOIN roles r ON u.role_id = r.id LEFT JOIN Masters_crm.companies c ON u.tenant_company_id = c.id WHERE u.tenant_company_id = 1 AND u.is_active = 1")
            print("Users:", await cur.fetchall())
    
    async with db.masters_pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute("SELECT * FROM companies WHERE is_active = 1")
            print("Companies:", await cur.fetchall())
            
    await db.disconnect()

asyncio.run(test())
