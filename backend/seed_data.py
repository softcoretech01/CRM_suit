import asyncio
from app.core.database import db
from app.core.security import get_password_hash

async def seed():
    await db.connect()
    
    # 1. Insert Company
    async with db.masters_pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute("INSERT INTO companies (name) VALUES ('Techspire')")
            company_id = cur.lastrowid
            
    # 2. Insert Role
    async with db.admin_pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute("INSERT INTO roles (name, description) VALUES ('CEO', 'Chief Executive Officer')")
            role_id = cur.lastrowid
            
            # 3. Insert User
            password_hash = get_password_hash('kabil@123')
            await cur.execute('''
                INSERT INTO users 
                (tenant_company_id, name, username, email, password_hash, role_id, designation)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            ''', (company_id, 'Kabilesh', 'kabilesh', 'kabilesh@techspire.in', password_hash, role_id, 'CEO'))
            
            print(f"Success! Company ID: {company_id}, Role ID: {role_id}, User 'kabilesh' created.")
            
    await db.disconnect()

asyncio.run(seed())
