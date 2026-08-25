import pymysql

conn = pymysql.connect(
    host='100.86.181.18',
    port=3325,
    user='root',
    password='Cr3#2026',
    database='Admin_crm',
    autocommit=True
)

with conn.cursor() as cur:
    cur.execute("SHOW TABLES;")
    tables = [r[0] for r in cur.fetchall()]
    print("Tables currently in Admin_crm:", tables)
    for t in tables:
        cur.execute(f"SELECT COUNT(*) FROM `{t}`;")
        count = cur.fetchone()[0]
        print(f"  Table `{t}`: {count} rows")

conn.close()
