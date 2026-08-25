import asyncio
import sys
import os
sys.path.append(os.path.dirname(__file__))

from app.database import Database
from app.utils.config import settings

async def audit_db():
    # Connect to each DB
    admin_db = Database(settings.DB_NAME_ADMIN)
    masters_db = Database(settings.DB_NAME_MASTERS)
    crm_db = Database(settings.DB_NAME_CRM)
    
    await admin_db.connect()
    await masters_db.connect()
    await crm_db.connect()
    
    print("=" * 60)
    print("DATABASE AUDIT REPORT")
    print("=" * 60)
    
    for name, db in [("Admin_crm", admin_db), ("Masters_crm", masters_db), ("CRM", crm_db)]:
        print(f"\n{'='*40}")
        print(f"DATABASE: {name}")
        print(f"{'='*40}")
        
        async with db.pool.acquire() as conn:
            async with conn.cursor() as cur:
                # Tables
                await cur.execute("SHOW TABLES")
                tables = [r[0] for r in await cur.fetchall()]
                print(f"\nTABLES ({len(tables)}):")
                for t in tables:
                    await cur.execute(f"SELECT COUNT(*) FROM `{t}`")
                    count = (await cur.fetchone())[0]
                    await cur.execute(f"SHOW COLUMNS FROM `{t}`")
                    cols = [r[0] for r in await cur.fetchall()]
                    print(f"  {t} ({count} rows) — cols: {', '.join(cols)}")
                
                # Stored Procedures
                await cur.execute(f"SHOW PROCEDURE STATUS WHERE Db LIKE '{db.db_name}'")
                procs = await cur.fetchall()
                print(f"\nSTORED PROCEDURES ({len(procs)}):")
                for p in procs:
                    print(f"  {p[1]}")
                
                # Foreign Keys
                await cur.execute("""
                    SELECT 
                        TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
                    FROM information_schema.KEY_COLUMN_USAGE
                    WHERE REFERENCED_TABLE_NAME IS NOT NULL
                    AND TABLE_SCHEMA = %s
                """, (db.db_name,))
                fks = await cur.fetchall()
                if fks:
                    print(f"\nFOREIGN KEYS:")
                    for fk in fks:
                        print(f"  {fk[0]}.{fk[1]} -> {fk[2]}.{fk[3]}")
    
    await admin_db.disconnect()
    await masters_db.disconnect()
    await crm_db.disconnect()

if __name__ == "__main__":
    asyncio.run(audit_db())
