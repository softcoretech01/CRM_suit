import asyncio, os, sys
sys.path.append(os.path.dirname(__file__))
from app.utils.config import settings
import aiomysql

async def main():
    admin_pool = await aiomysql.create_pool(
        host=settings.DB_HOST, port=settings.DB_PORT, user=settings.DB_USER,
        password=settings.DB_PASSWORD, db=settings.DB_NAME_ADMIN, autocommit=True)
    async with admin_pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute("DELETE FROM user_sessions;")
            print("Cleared all stuck sessions.")
    admin_pool.close()
    await admin_pool.wait_closed()

if __name__ == "__main__":
    asyncio.run(main())
