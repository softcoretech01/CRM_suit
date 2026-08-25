import pymysql

conn = pymysql.connect(
    host='100.86.181.18',
    port=3325,
    user='root',
    password='Cr3#2026',
    autocommit=True
)

def backup_and_recreate():
    with conn.cursor() as cur:
        print("1. Fetching all data from Admin_crm...")
        cur.execute("USE `Admin_crm`;")
        cur.execute("SHOW TABLES;")
        admin_tables = [r[0] for r in cur.fetchall()]
        
        # Read admin_crm data
        admin_data = {}
        for t in admin_tables:
            cur.execute(f"SELECT * FROM `{t}`;")
            rows = cur.fetchall()
            cur.execute(f"SHOW CREATE TABLE `{t}`;")
            create_sql = cur.fetchone()[1]
            admin_data[t] = {'create': create_sql, 'rows': rows}

        print("2. Fetching all data from Masters_crm...")
        cur.execute("USE `Masters_crm`;")
        cur.execute("SHOW TABLES;")
        masters_tables = [r[0] for r in cur.fetchall()]
        
        masters_data = {}
        for t in masters_tables:
            cur.execute(f"SELECT * FROM `{t}`;")
            rows = cur.fetchall()
            cur.execute(f"SHOW CREATE TABLE `{t}`;")
            create_sql = cur.fetchone()[1]
            masters_data[t] = {'create': create_sql, 'rows': rows}

        print("3. Fetching all data from CRM...")
        cur.execute("USE `CRM`;")
        cur.execute("SHOW TABLES;")
        crm_tables = [r[0] for r in cur.fetchall()]
        
        crm_data = {}
        for t in crm_tables:
            cur.execute(f"SELECT * FROM `{t}`;")
            rows = cur.fetchall()
            cur.execute(f"SHOW CREATE TABLE `{t}`;")
            create_sql = cur.fetchone()[1]
            crm_data[t] = {'create': create_sql, 'rows': rows}

        print("4. Dropping uppercase databases Admin_crm, Masters_crm, CRM...")
        cur.execute("SET FOREIGN_KEY_CHECKS=0;")
        cur.execute("DROP DATABASE IF EXISTS `Admin_crm`;")
        cur.execute("DROP DATABASE IF EXISTS `Masters_crm`;")
        cur.execute("DROP DATABASE IF EXISTS `CRM`;")

        print("5. Creating lowercase databases admin_crm, masters_crm, crm...")
        cur.execute("CREATE DATABASE `admin_crm`;")
        cur.execute("CREATE DATABASE `masters_crm`;")
        cur.execute("CREATE DATABASE `crm`;")

        # Restore admin_crm
        print("6. Restoring admin_crm tables and rows...")
        cur.execute("USE `admin_crm`;")
        cur.execute("SET FOREIGN_KEY_CHECKS=0;")
        for t, val in admin_data.items():
            cur.execute(val['create'])
            if val['rows']:
                placeholders = ", ".join(["%s"] * len(val['rows'][0]))
                cur.executemany(f"INSERT INTO `{t}` VALUES ({placeholders})", val['rows'])
        cur.execute("SET FOREIGN_KEY_CHECKS=1;")

        # Restore masters_crm
        print("7. Restoring masters_crm tables and rows...")
        cur.execute("USE `masters_crm`;")
        cur.execute("SET FOREIGN_KEY_CHECKS=0;")
        for t, val in masters_data.items():
            cur.execute(val['create'])
            if val['rows']:
                placeholders = ", ".join(["%s"] * len(val['rows'][0]))
                cur.executemany(f"INSERT INTO `{t}` VALUES ({placeholders})", val['rows'])
        cur.execute("SET FOREIGN_KEY_CHECKS=1;")

        # Restore crm
        print("8. Restoring crm tables and rows...")
        cur.execute("USE `crm`;")
        cur.execute("SET FOREIGN_KEY_CHECKS=0;")
        for t, val in crm_data.items():
            cur.execute(val['create'])
            if val['rows']:
                placeholders = ", ".join(["%s"] * len(val['rows'][0]))
                cur.executemany(f"INSERT INTO `{t}` VALUES ({placeholders})", val['rows'])
        cur.execute("SET FOREIGN_KEY_CHECKS=1;")

        print("Migration of database names to lowercase complete!")

if __name__ == '__main__':
    backup_and_recreate()
    conn.close()
