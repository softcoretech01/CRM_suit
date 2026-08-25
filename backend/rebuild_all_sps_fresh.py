import pymysql

conn = pymysql.connect(
    host='100.86.181.18',
    port=3325,
    user='root',
    password='Cr3#2026',
    autocommit=True
)

def rebuild_stored_procedures():
    with conn.cursor() as cur:
        # 1. Find and drop ALL stored procedures in Admin_crm, Masters_crm, CRM
        print("1. Dropping ALL existing stored procedures...")
        for db_name in ['Admin_crm', 'admin_crm', 'Masters_crm', 'masters_crm', 'CRM', 'crm']:
            cur.execute("""
                SELECT ROUTINE_SCHEMA, ROUTINE_NAME 
                FROM INFORMATION_SCHEMA.ROUTINES 
                WHERE ROUTINE_TYPE = 'PROCEDURE' 
                  AND LOWER(ROUTINE_SCHEMA) = LOWER(%s);
            """, (db_name,))
            routines = cur.fetchall()
            for schema, proc_name in routines:
                try:
                    cur.execute(f"DROP PROCEDURE IF EXISTS `{schema}`.`{proc_name}`;")
                    print(f"  Dropped: {schema}.{proc_name}")
                except Exception as e:
                    print(f"  Error dropping {schema}.{proc_name}: {e}")

        # 2. Re-create Admin_crm stored procedures
        print("\n2. Re-writing Admin_crm stored procedures...")
        with open(r'd:\CRM\backend\admin_sps.sql', 'r', encoding='utf-8') as f:
            admin_sql = f.read()

        cur.execute("USE `Admin_crm`;")
        # Split by DELIMITER //
        parts = admin_sql.split('DELIMITER //')
        admin_count = 0
        for part in parts:
            if 'DELIMITER ;' in part:
                sp_code, _ = part.split('DELIMITER ;', 1)
                sp_code = sp_code.strip()
                if sp_code.endswith('//'):
                    sp_code = sp_code[:-2].strip()
                if sp_code and not sp_code.startswith('USE '):
                    try:
                        cur.execute(sp_code)
                        admin_count += 1
                    except Exception as e:
                        print(f"  Error creating Admin SP:\n  {sp_code[:80]}\n  Error: {e}")

        print(f"Created {admin_count} stored procedures in Admin_crm.")

        # 3. Re-create Masters_crm stored procedures
        print("\n3. Re-writing Masters_crm stored procedures...")
        with open(r'd:\CRM\backend\masters_sps.sql', 'r', encoding='utf-8') as f:
            masters_sql = f.read()

        cur.execute("USE `Masters_crm`;")
        parts = masters_sql.split('DELIMITER //')
        masters_count = 0
        for part in parts:
            if 'DELIMITER ;' in part:
                sp_code, _ = part.split('DELIMITER ;', 1)
                sp_code = sp_code.strip()
                if sp_code.endswith('//'):
                    sp_code = sp_code[:-2].strip()
                if sp_code and not sp_code.startswith('USE '):
                    try:
                        cur.execute(sp_code)
                        masters_count += 1
                    except Exception as e:
                        print(f"  Error creating Masters SP:\n  {sp_code[:80]}\n  Error: {e}")

        print(f"Created {masters_count} stored procedures in Masters_crm.")

        # 4. Final verification
        print("\n4. Final Verification of Stored Procedures in MySQL:")
        cur.execute("""
            SELECT ROUTINE_SCHEMA, ROUTINE_NAME 
            FROM INFORMATION_SCHEMA.ROUTINES 
            WHERE ROUTINE_TYPE = 'PROCEDURE' 
              AND ROUTINE_SCHEMA IN ('Admin_crm', 'Masters_crm', 'CRM', 'admin_crm', 'masters_crm', 'crm')
            ORDER BY ROUTINE_SCHEMA, ROUTINE_NAME;
        """)
        rows = cur.fetchall()
        print(f"Total SPs verified in database: {len(rows)}")
        for r in rows:
            print(f"  Database: `{r[0]}` | Procedure: `{r[1]}`")

if __name__ == '__main__':
    rebuild_stored_procedures()
    conn.close()
