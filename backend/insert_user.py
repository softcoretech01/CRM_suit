import asyncio
import pymysql.cursors

async def main():
    conn = pymysql.connect(
        host='100.86.181.18',
        port=3325,
        user='root',
        password='Cr3#2026',
        database='Admin_crm',
        cursorclass=pymysql.cursors.DictCursor
    )
    try:
        with conn.cursor() as cur:
            sql = "INSERT INTO users (tenant_company_id, name, username, email, password_hash, role_id, status, is_active) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)"
            val = (1, 'Techspire Admin', 'admin', 'admin@techspire.com', '$2b$12$k3ZUTBZILSTxpNI3ofCKp.wdd7QRJWTsPrvOzbNoisWIvXP.n7Kam', 3, 'Active', 1)
            cur.execute(sql, val)
        conn.commit()
        print("User created successfully!")
    finally:
        conn.close()

if __name__ == "__main__":
    asyncio.run(main())
