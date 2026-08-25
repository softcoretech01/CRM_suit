import pymysql

conn = pymysql.connect(
    host='100.86.181.18',
    port=3325,
    user='root',
    password='Cr3#2026',
    autocommit=True
)

with conn.cursor() as cur:
    print("Databases in server:")
    cur.execute("SHOW DATABASES;")
    for db in cur.fetchall():
        print(" ", db[0])

    print("\nRoutine schemas in INFORMATION_SCHEMA.ROUTINES:")
    cur.execute("SELECT DISTINCT ROUTINE_SCHEMA FROM INFORMATION_SCHEMA.ROUTINES;")
    for r in cur.fetchall():
        print(" ", r[0])

conn.close()
