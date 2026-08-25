import asyncio
import sys
import os
import aiomysql

# Add the backend directory to sys.path so we can import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import db

PREFIXES = {
    'industries': 'IND',
    'lead_sources': 'LDS',
    'campaigns': 'CMP',
    'activity_types': 'ACT',
    'lead_statuses': 'LST',
    'next_actions': 'NXT',
    'priorities': 'PRI',
    'countries': 'COU',
    'states': 'STA',
    'cities': 'CIT',
    'company_types': 'COM'
}

async def main():
    await db.connect()
    try:
        async with db.masters_pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                # Also insert some default company types since we just created the table
                await cur.execute("SELECT count(*) as count FROM company_types")
                res = await cur.fetchone()
                if res['count'] == 0:
                    types = ['Private Limited', 'Public Limited', 'LLP', 'Partnership', 'Proprietorship']
                    for i, t in enumerate(types):
                        await cur.execute("INSERT INTO company_types (name, code) VALUES (%s, %s)", (t, f'COM-{i+1:03d}'))
                    print("Seeded company types")

                for table, prefix in PREFIXES.items():
                    try:
                        # Ensure code column exists
                        try:
                            await cur.execute(f"ALTER TABLE `{table}` ADD COLUMN code VARCHAR(50) AFTER id")
                            print(f"Added code column to {table}")
                        except Exception:
                            pass

                        await cur.execute(f"SELECT id, code FROM `{table}` ORDER BY id ASC")
                        rows = await cur.fetchall()
                        count = 1
                        for row in rows:
                            code = f"{prefix}-{count:03d}"
                            await cur.execute(f"UPDATE `{table}` SET code = %s WHERE id = %s", (code, row['id']))
                            print(f"Updated {table} id {row['id']} with code {code}")
                            count += 1
                        await conn.commit()
                    except Exception as e:
                        print(f"Error updating {table}: {e}")
    finally:
        await db.disconnect()
    print("Done")

if __name__ == '__main__':
    asyncio.run(main())
