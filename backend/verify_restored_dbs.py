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

    for db in ['Admin_crm', 'Masters_crm', 'CRM']:
        print(f"\n--- {db} Tables & Rows ---")
        cur.execute(f"SHOW TABLES FROM `{db}`;")
        tables = [row[0] for row in cur.fetchall()]
        for t in tables:
            cur.execute(f"SELECT COUNT(*) FROM `{db}`.`{t}`;")
            print(f"  {t}: {cur.fetchone()[0]} rows")

    cur.execute("SELECT ROUTINE_SCHEMA, COUNT(*) FROM INFORMATION_SCHEMA.ROUTINES GROUP BY ROUTINE_SCHEMA;")
    print("\n--- Stored Procedures Count by Schema ---")
    for r in cur.fetchall():
        print(" ", r)

conn.close()
