import pymysql

conn = pymysql.connect(
    host='100.86.181.18',
    port=3325,
    user='root',
    password='Cr3#2026',
    autocommit=True
)

with conn.cursor() as cur:
    cur.execute("SELECT ROUTINE_SCHEMA, ROUTINE_NAME FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_TYPE='PROCEDURE';")
    rows = cur.fetchall()
    print(f"Total routines in MySQL server: {len(rows)}")
    for r in rows:
        print(r)

    cur.execute("SHOW DATABASES;")
    dbs = cur.fetchall()
    print("\nDatabases in MySQL server:")
    for db in dbs:
        print(db)

conn.close()
