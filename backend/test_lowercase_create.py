import pymysql

conn = pymysql.connect(
    host='100.86.181.18',
    port=3325,
    user='root',
    password='Cr3#2026',
    autocommit=True
)

with conn.cursor() as cur:
    print("Testing creating lowercase databases...")
    cur.execute("CREATE DATABASE IF NOT EXISTS `admin_crm`;")
    cur.execute("CREATE DATABASE IF NOT EXISTS `masters_crm`;")
    cur.execute("CREATE DATABASE IF NOT EXISTS `crm`;")
    
    cur.execute("SHOW DATABASES;")
    dbs = [r[0] for r in cur.fetchall()]
    print("Databases in server:", dbs)

conn.close()
