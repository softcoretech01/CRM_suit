import pymysql

conn = pymysql.connect(
    host='100.86.181.18',
    port=3325,
    user='root',
    password='Cr3#2026',
    autocommit=True
)

with conn.cursor() as cur:
    print("Databases in MySQL server:")
    cur.execute("SHOW DATABASES;")
    for r in cur.fetchall():
        if not r[0].startswith('information') and not r[0].startswith('performance'):
            print("  DB:", r[0])

    cur.execute("SHOW PROCEDURE STATUS WHERE Db = 'admin_crm';")
    admin_sps = cur.fetchall()
    print(f"\nSHOW PROCEDURE STATUS WHERE Db = 'admin_crm' -> COUNT: {len(admin_sps)}")

    cur.execute("SHOW PROCEDURE STATUS WHERE Db = 'masters_crm';")
    masters_sps = cur.fetchall()
    print(f"SHOW PROCEDURE STATUS WHERE Db = 'masters_crm' -> COUNT: {len(masters_sps)}")

conn.close()
