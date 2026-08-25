import pymysql

conn = pymysql.connect(
    host='100.86.181.18',
    port=3325,
    user='root',
    password='Cr3#2026',
    autocommit=True
)

sp_test = """
CREATE PROCEDURE `Admin_crm`.`sp_test_case_sensitivity`()
BEGIN
    SELECT 1;
END
"""

with conn.cursor() as cur:
    cur.execute("DROP PROCEDURE IF EXISTS `Admin_crm`.`sp_test_case_sensitivity`;")
    cur.execute(sp_test)
    
    cur.execute("SHOW PROCEDURE STATUS WHERE Db = 'Admin_crm';")
    exact = cur.fetchall()
    print("SHOW PROCEDURE STATUS WHERE Db = 'Admin_crm' -> count =", len(exact))
    for r in exact:
        print(r)

    cur.execute("SHOW PROCEDURE STATUS WHERE Db = 'admin_crm';")
    lower = cur.fetchall()
    print("SHOW PROCEDURE STATUS WHERE Db = 'admin_crm' -> count =", len(lower))

    # Clean up test SP
    cur.execute("DROP PROCEDURE IF EXISTS `Admin_crm`.`sp_test_case_sensitivity`;")

conn.close()
