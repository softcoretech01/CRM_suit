import asyncio
from app.core.database import db

async def main():
    await db.connect()
    async with db.masters_pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute('SELECT * FROM company_types')
            print("TYPES:", await cur.fetchall())
            await cur.execute('SELECT * FROM industries')
            print("INDUSTRIES:", await cur.fetchall())
    await db.disconnect()

asyncio.run(main())
