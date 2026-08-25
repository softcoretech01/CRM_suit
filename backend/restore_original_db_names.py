import pymysql

conn = pymysql.connect(
    host='100.86.181.18',
    port=3325,
    user='root',
    password='Cr3#2026',
    autocommit=True
)

def restore_original_databases():
    with conn.cursor() as cur:
        print("1. Reading data from admin_crm...")
        cur.execute("USE `admin_crm`;")
        cur.execute("SHOW TABLES;")
        admin_tables = [r[0] for r in cur.fetchall()]
        
        admin_data = {}
        for t in admin_tables:
            cur.execute(f"SELECT * FROM `{t}`;")
            rows = cur.fetchall()
            cur.execute(f"SHOW CREATE TABLE `{t}`;")
            create_sql = cur.fetchone()[1]
            admin_data[t] = {'create': create_sql, 'rows': rows}

        print("2. Reading data from masters_crm...")
        cur.execute("USE `masters_crm`;")
        cur.execute("SHOW TABLES;")
        masters_tables = [r[0] for r in cur.fetchall()]
        
        masters_data = {}
        for t in masters_tables:
            cur.execute(f"SELECT * FROM `{t}`;")
            rows = cur.fetchall()
            cur.execute(f"SHOW CREATE TABLE `{t}`;")
            create_sql = cur.fetchone()[1]
            masters_data[t] = {'create': create_sql, 'rows': rows}

        print("3. Reading data from crm...")
        cur.execute("USE `crm`;")
        cur.execute("SHOW TABLES;")
        crm_tables = [r[0] for r in cur.fetchall()]
        
        crm_data = {}
        for t in crm_tables:
            cur.execute(f"SELECT * FROM `{t}`;")
            rows = cur.fetchall()
            cur.execute(f"SHOW CREATE TABLE `{t}`;")
            create_sql = cur.fetchone()[1]
            crm_data[t] = {'create': create_sql, 'rows': rows}

        print("4. Dropping current databases with FK checks off...")
        cur.execute("SET FOREIGN_KEY_CHECKS=0;")
        cur.execute("DROP DATABASE IF EXISTS `admin_crm`;")
        cur.execute("DROP DATABASE IF EXISTS `masters_crm`;")
        cur.execute("DROP DATABASE IF EXISTS `crm`;")
        cur.execute("DROP DATABASE IF EXISTS `Admin_crm`;")
        cur.execute("DROP DATABASE IF EXISTS `Masters_crm`;")
        cur.execute("DROP DATABASE IF EXISTS `CRM`;")

        print("5. Recreating original databases Admin_crm, Masters_crm, CRM...")
        cur.execute("CREATE DATABASE `Admin_crm`;")
        cur.execute("CREATE DATABASE `Masters_crm`;")
        cur.execute("CREATE DATABASE `CRM`;")

        print("6. Restoring Admin_crm tables and rows...")
        cur.execute("USE `Admin_crm`;")
        cur.execute("SET FOREIGN_KEY_CHECKS=0;")
        for t, val in admin_data.items():
            cur.execute(val['create'])
            if val['rows']:
                placeholders = ", ".join(["%s"] * len(val['rows'][0]))
                cur.executemany(f"INSERT INTO `{t}` VALUES ({placeholders})", val['rows'])
        cur.execute("SET FOREIGN_KEY_CHECKS=1;")

        print("7. Restoring Masters_crm tables and rows...")
        cur.execute("USE `Masters_crm`;")
        cur.execute("SET FOREIGN_KEY_CHECKS=0;")
        for t, val in masters_data.items():
            cur.execute(val['create'])
            if val['rows']:
                placeholders = ", ".join(["%s"] * len(val['rows'][0]))
                cur.executemany(f"INSERT INTO `{t}` VALUES ({placeholders})", val['rows'])
        cur.execute("SET FOREIGN_KEY_CHECKS=1;")

        print("8. Restoring CRM tables and rows...")
        cur.execute("USE `CRM`;")
        cur.execute("SET FOREIGN_KEY_CHECKS=0;")
        for t, val in crm_data.items():
            cur.execute(val['create'])
            if val['rows']:
                placeholders = ", ".join(["%s"] * len(val['rows'][0]))
                cur.executemany(f"INSERT INTO `{t}` VALUES ({placeholders})", val['rows'])
        cur.execute("SET FOREIGN_KEY_CHECKS=1;")

        print("Restoration of original database names complete!")

if __name__ == '__main__':
    restore_original_databases()
    conn.close()
