import asyncio
import aiomysql

DB_HOST = "100.86.181.18"
DB_PORT = 3325
DB_USER = "root"
DB_PASSWORD = "Cr3#2026"

async def main():
    try:
        conn = await aiomysql.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            db="Admin_crm"
        )
        async with conn.cursor() as cur:
            await cur.execute("ALTER TABLE companies ADD COLUMN max_users INT DEFAULT 1;")
            await conn.commit()
            print("Successfully added max_users column to companies table!")
        conn.close()
    except aiomysql.Error as e:
        if "Duplicate column name" in str(e):
            print("Column max_users already exists!")
        else:
            print("MySQL Error:", e)

if __name__ == "__main__":
    asyncio.run(main())
