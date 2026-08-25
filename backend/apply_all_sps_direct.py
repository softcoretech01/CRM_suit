import pymysql

conn = pymysql.connect(
    host='100.86.181.18',
    port=3325,
    user='root',
    password='Cr3#2026',
    autocommit=True
)

def apply_admin_sps():
    print("Applying admin_sps.sql...")
    with open(r'd:\CRM\backend\admin_sps.sql', 'r', encoding='utf-8') as f:
        sql = f.read()
    
    # Simple & direct execution: split by 'DELIMITER //' and 'DELIMITER ;'
    parts = sql.split('DELIMITER //')
    with conn.cursor() as cur:
        cur.execute("USE `Admin_crm`;")
        for part in parts:
            if 'DELIMITER ;' in part:
                sp_code, rest = part.split('DELIMITER ;', 1)
                # Clean up any trailing '//'
                sp_code = sp_code.strip()
                if sp_code.endswith('//'):
                    sp_code = sp_code[:-2].strip()
                if sp_code:
                    try:
                        cur.execute(sp_code)
                        print("  Created SP successfully.")
                    except Exception as e:
                        print("  SP Error:", e)

def apply_masters_sps():
    print("Applying masters_sps.sql...")
    with open(r'd:\CRM\backend\masters_sps.sql', 'r', encoding='utf-8') as f:
        sql = f.read()
    
    parts = sql.split('DELIMITER //')
    with conn.cursor() as cur:
        cur.execute("USE `Masters_crm`;")
        for part in parts:
            if 'DELIMITER ;' in part:
                sp_code, rest = part.split('DELIMITER ;', 1)
                sp_code = sp_code.strip()
                if sp_code.endswith('//'):
                    sp_code = sp_code[:-2].strip()
                if sp_code:
                    try:
                        cur.execute(sp_code)
                    except Exception as e:
                        print("  Masters SP Error:", e)

if __name__ == '__main__':
    apply_admin_sps()
    apply_masters_sps()
    
    with conn.cursor() as cur:
        cur.execute("SELECT ROUTINE_SCHEMA, COUNT(*) FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_TYPE='PROCEDURE' GROUP BY ROUTINE_SCHEMA;")
        print("\nStored Procedures Count in MySQL:")
        for r in cur.fetchall():
            print(" ", r)

    conn.close()
