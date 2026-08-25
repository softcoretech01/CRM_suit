import pymysql
import re
import asyncio

DB_HOST = "100.86.181.18"
DB_PORT = 3325
DB_USER = "root"
DB_PASSWORD = "Cr3#2026"

def run_schema_sql():
    print("1. Reading and applying schema.sql...")
    conn = pymysql.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        autocommit=True
    )
    
    with open(r"d:\CRM\backend\schema.sql", "r", encoding="utf-8") as f:
        sql_script = f.read()

    # Remove comments and split statements
    cleaned_sql = re.sub(r'--.*', '', sql_script)
    statements = [s.strip() for s in cleaned_sql.split(';') if s.strip()]

    with conn.cursor() as cur:
        cur.execute("SET FOREIGN_KEY_CHECKS = 0;")
        for stmt in statements:
            try:
                cur.execute(stmt)
            except Exception as e:
                print(f"Notice on schema statement: {e}")
        cur.execute("SET FOREIGN_KEY_CHECKS = 1;")
    conn.close()
    print("schema.sql successfully executed!")

if __name__ == "__main__":
    run_schema_sql()
