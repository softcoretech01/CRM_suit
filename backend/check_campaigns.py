import asyncio
import aiomysql

async def run():
    pool = await aiomysql.create_pool(host='100.86.181.18', port=3325, user='root', password='Cr3#2026', db='Masters_crm')
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute('DESCRIBE campaigns')
            print(await cur.fetchall())

if __name__ == "__main__":
    asyncio.run(run())
