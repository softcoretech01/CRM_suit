import asyncio
from app.core.database import db

async def main():
    await db.connect()
    async with db.crm_pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute('DESCRIBE crm_companies')
            res = await cur.fetchall()
            for r in res:
                print(r)
    await db.disconnect()

asyncio.run(main())
