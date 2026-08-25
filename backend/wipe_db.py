import aiomysql
import asyncio

DB_HOST = "100.86.181.18"
DB_PORT = 3325
DB_USER = "root"
DB_PASSWORD = "Cr3#2026"
DATABASES = ["Admin_crm", "Masters_crm", "CRM"]

async def wipe_database(db_name):
    print(f"\n[{db_name}] Connecting...")
    pool = await aiomysql.create_pool(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        db=db_name,
        autocommit=True
    )
    
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            # 1. Disable FK checks
            await cur.execute("SET FOREIGN_KEY_CHECKS = 0;")
            
            # 2. Drop all tables
            await cur.execute("SHOW TABLES")
            tables = [r[0] for r in await cur.fetchall()]
            if tables:
                print(f"[{db_name}] Dropping {len(tables)} tables...")
                for t in tables:
                    await cur.execute(f"DROP TABLE IF EXISTS `{t}`")
                    print(f"  - Dropped table {t}")
            else:
                print(f"[{db_name}] No tables found.")
                
            # 3. Drop all stored procedures
            await cur.execute(f"SHOW PROCEDURE STATUS WHERE Db = '{db_name}'")
            procedures = [r[1] for r in await cur.fetchall()]
            if procedures:
                print(f"[{db_name}] Dropping {len(procedures)} stored procedures...")
                for p in procedures:
                    await cur.execute(f"DROP PROCEDURE IF EXISTS `{p}`")
                    print(f"  - Dropped procedure {p}")
            else:
                print(f"[{db_name}] No stored procedures found.")
                
            # 4. Re-enable FK checks
            await cur.execute("SET FOREIGN_KEY_CHECKS = 1;")
            
    pool.close()
    await pool.wait_closed()
    print(f"[{db_name}] Wipe complete.")

async def main():
    print("WARNING: THIS WILL WIPE ALL TABLES AND PROCEDURES!")
    for db in DATABASES:
        await wipe_database(db)

if __name__ == "__main__":
    asyncio.run(main())
