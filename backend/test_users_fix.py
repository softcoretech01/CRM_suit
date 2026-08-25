import asyncio
import aiomysql
from app.core.config import settings
from app.repositories import admin_repo

async def main():
    conn = await aiomysql.connect(
        host=settings.DB_HOST,
        port=settings.DB_PORT,
        user=settings.DB_USER,
        password=settings.DB_PASSWORD,
        db=settings.DB_NAME_ADMIN,
        autocommit=True
    )
    print("Testing get_users(conn, None)...")
    users = await admin_repo.get_users(conn, None)
    print(f"Total users returned: {len(users)}")
    for u in users:
        print(f"ID: {u.get('id')}, Name: {u.get('name')}, Tenant Company ID: {u.get('tenant_company_id')}, Company Name: {u.get('company_name')}, Role: {u.get('role')}")
    conn.close()

if __name__ == '__main__':
    asyncio.run(main())
