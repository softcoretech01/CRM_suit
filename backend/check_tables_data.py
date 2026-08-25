import pymysql

conn = pymysql.connect(
    host='100.86.181.18',
    port=3325,
    user='root',
    password='Cr3#2026',
    autocommit=True
)

with conn.cursor() as cur:
    for db in ['Admin_crm', 'Masters_crm', 'CRM']:
        print(f"\n--- Tables in {db} ---")
        cur.execute(f"SHOW TABLES FROM `{db}`;")
        tables = [r[0] for r in cur.fetchall()]
        for t in tables:
            cur.execute(f"SELECT COUNT(*) FROM `{db}`.`{t}`;")
            count = cur.fetchone()[0]
            print(f"  {t}: {count} rows")

conn.close()
