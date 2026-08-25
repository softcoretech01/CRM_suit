import asyncio
import aiomysql

async def main():
    pool = await aiomysql.create_pool(
        host='100.86.181.18', port=3325, 
        user='root', password='Cr3#2026', db='Masters_crm',
        autocommit=True
    )
    
    tables = [
        "product_categories",
        "industries",
        "lead_sources",
        "campaigns",
        "activity_types",
        "lead_statuses",
        "next_actions",
        "priorities",
        "company_types"
    ]
    
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            # 1. Add description column if missing
            for table in tables:
                try:
                    await cur.execute(f"SHOW COLUMNS FROM `{table}` LIKE 'description'")
                    if not await cur.fetchone():
                        print(f"Adding description column to {table}...")
                        await cur.execute(f"ALTER TABLE `{table}` ADD COLUMN description TEXT NULL")
                except Exception as e:
                    print(f"Error checking/adding description to {table}: {e}")
            
            # 2. Seed data for rows where description is NULL or empty
            for table in tables:
                try:
                    await cur.execute(f"SELECT id, name FROM `{table}` WHERE description IS NULL OR description = ''")
                    rows = await cur.fetchall()
                    for row in rows:
                        id_val, name_val = row
                        # Generate a simple generic description based on the name
                        desc = f"Standard {name_val.lower()} used in the system."
                        await cur.execute(f"UPDATE `{table}` SET description = %s WHERE id = %s", (desc, id_val))
                        print(f"Updated {table} id {id_val} ({name_val}) with description.")
                except Exception as e:
                    print(f"Error seeding data for {table}: {e}")

    pool.close()
    await pool.wait_closed()
    print("Done!")

if __name__ == "__main__":
    asyncio.run(main())
