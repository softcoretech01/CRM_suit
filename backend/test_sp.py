import asyncio
from app.core.database import db
import aiomysql

async def main():
    await db.connect()
    async with db.masters_pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute('CALL sp_get_cities_with_state()')
            res = await cur.fetchall()
            print("Cities:")
            for c in res:
                print(c)
    await db.disconnect()

if __name__ == '__main__':
    asyncio.run(main())
