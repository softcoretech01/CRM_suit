import pymysql

hosts = [
    ('100.86.181.18', 3325),
    ('localhost', 3306),
    ('127.0.0.1', 3306),
    ('localhost', 3325),
    ('127.0.0.1', 3325),
]

for host, port in hosts:
    print(f"\n--- Testing MySQL connection to {host}:{port} ---")
    try:
        conn = pymysql.connect(
            host=host,
            port=port,
            user='root',
            password='Cr3#2026',
            connect_timeout=3
        )
        with conn.cursor() as cur:
            cur.execute("SHOW DATABASES;")
            dbs = [row[0] for row in cur.fetchall()]
            print(f"SUCCESS! Connected to {host}:{port}")
            print("Databases found:", dbs)
            
            cur.execute("SELECT ROUTINE_SCHEMA, ROUTINE_NAME FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_TYPE='PROCEDURE';")
            routines = cur.fetchall()
            print(f"Total Stored Procedures on {host}:{port} =", len(routines))
            for r in routines[:10]:
                print("  ", r)
        conn.close()
    except Exception as e:
        print(f"FAILED to connect to {host}:{port} -> {e}")
