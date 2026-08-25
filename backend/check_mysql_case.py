import pymysql

conn = pymysql.connect(
    host='100.86.181.18',
    port=3325,
    user='root',
    password='Cr3#2026',
    autocommit=True
)

with conn.cursor() as cur:
    cur.execute("SHOW VARIABLES LIKE 'lower_case%';")
    for r in cur.fetchall():
        print(r)

    print("\n--- Testing SHOW PROCEDURE STATUS ---")
    cur.execute("SHOW PROCEDURE STATUS WHERE Db = 'Admin_crm';")
    print("Db='Admin_crm':", len(cur.fetchall()))
    cur.execute("SHOW PROCEDURE STATUS WHERE Db = 'admin_crm';")
    print("Db='admin_crm':", len(cur.fetchall()))
    cur.execute("SHOW PROCEDURE STATUS WHERE LOWER(Db) = 'admin_crm';")
    print("LOWER(Db)='admin_crm':", len(cur.fetchall()))

conn.close()
