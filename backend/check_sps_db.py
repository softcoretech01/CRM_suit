import pymysql

conn = pymysql.connect(
    host='100.86.181.18',
    port=3325,
    user='root',
    password='Cr3#2026',
)

with conn.cursor() as cur:
    cur.execute("SHOW PROCEDURE STATUS WHERE Db = 'Admin_crm';")
    admin_sps = cur.fetchall()
    print("--- Admin_crm Stored Procedures ---")
    for row in admin_sps:
        print(row[1])  # Name

    cur.execute("SHOW PROCEDURE STATUS WHERE Db = 'Masters_crm';")
    masters_sps = cur.fetchall()
    print("\n--- Masters_crm Stored Procedures ---")
    for row in masters_sps:
        print(row[1])

conn.close()
