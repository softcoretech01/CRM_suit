import aiomysql
import asyncio

DB_HOST = "100.86.181.18"
DB_PORT = 3325
DB_USER = "root"
DB_PASSWORD = "Cr3#2026"

async def init_db():
    print("Connecting to database...")
    # Connect without a specific db to allow cross-db queries easily
    pool = await aiomysql.create_pool(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        autocommit=True
    )
    
    with open("schema.sql", "r", encoding="utf-8") as f:
        sql_script = f.read()
        
    # Split by semicolon, but handle cases where semicolon is inside comments or strings
    # For a simple schema.sql, splitting by ';\n' or basic splitting works if we are careful.
    # A safer approach is to use pure PyMySQL if it supports multi=True, or split manually.
    import re
    # Remove comments
    sql_script = re.sub(r'--.*', '', sql_script)
    statements = [s.strip() for s in sql_script.split(';') if s.strip()]
    
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            for i, stmt in enumerate(statements):
                try:
                    await cur.execute(stmt)
                    print(f"Executed statement {i+1}/{len(statements)}")
                except Exception as e:
                    print(f"Failed to execute statement {i+1}: {e}")
                    print(f"Statement: {stmt[:100]}...")
                    break
                    
    pool.close()
    await pool.wait_closed()
    print("Database initialization complete.")

if __name__ == "__main__":
    asyncio.run(init_db())
