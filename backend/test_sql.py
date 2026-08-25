import asyncio
from app.core.database import db
import aiomysql

async def test():
    await db.connect()
    async with db.admin_pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute("SELECT u.*, r.name as role_name FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.username = 'kabilesh'")
            print(await cur.fetchone())
    await db.disconnect()

asyncio.run(test())
