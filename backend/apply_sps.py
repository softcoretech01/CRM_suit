import pymysql
import os

with open(r'd:\CRM\backend\admin_sps.sql', 'r', encoding='utf-8') as f:
    sql_script = f.read()

# We need to split the script by DELIMITER and execute parts.
# Or simpler: just use pymysql with client_flag = CLIENT_MULTI_STATEMENTS?
# pymysql supports multi-statements if we don't have DELIMITER commands!
# Since admin_sps.sql uses DELIMITER //, we have to parse it, OR we can remove the DELIMITER commands and just split by //?

# Let's clean the script to remove DELIMITER statements and split by //
parts = sql_script.split('DELIMITER //')
statements = []
for p in parts:
    if 'DELIMITER ;' in p:
        stmt, rest = p.split('DELIMITER ;', 1)
        statements.append(stmt.strip())
    elif p.strip():
        # Maybe the first part before the first DELIMITER // (like USE Admin_crm;)
        for s in p.split(';'):
            if s.strip() and not s.strip().startswith('DROP PROCEDURE'):
                statements.append(s.strip())

# actually, we can also extract DROP PROCEDURE manually
all_stmts = []
current_stmt = []
in_sp = False
for line in sql_script.split('\n'):
    raw_line = line.strip()
    if not raw_line or raw_line.startswith('--'):
        continue

    if raw_line.startswith('DELIMITER //'):
        if current_stmt and '\n'.join(current_stmt).strip():
            all_stmts.append('\n'.join(current_stmt).strip())
            current_stmt = []
        in_sp = True
        continue
    if raw_line.startswith('DELIMITER ;'):
        in_sp = False
        all_stmts.append('\n'.join(current_stmt).strip())
        current_stmt = []
        continue
    
    if not in_sp:
        if raw_line.endswith(';'):
            current_stmt.append(raw_line[:-1])
            all_stmts.append('\n'.join(current_stmt).strip())
            current_stmt = []
        else:
            current_stmt.append(raw_line)
    else:
        if raw_line.endswith('//'):
            current_stmt.append(raw_line[:-2])
            all_stmts.append('\n'.join(current_stmt).strip())
            current_stmt = []
        else:
            current_stmt.append(raw_line)

if current_stmt and '\n'.join(current_stmt).strip():
    all_stmts.append('\n'.join(current_stmt).strip())

conn = pymysql.connect(
    host='100.86.181.18',
    port=3325,
    user='root',
    password='Cr3#2026',
    database='Admin_crm',
)

with conn.cursor() as cur:
    for stmt in all_stmts:
        if not stmt or stmt.startswith('--'):
            continue
        try:
            print(f"Executing: {stmt[:60]}...")
            cur.execute(stmt)
        except Exception as e:
            print(f"FAILED executing [{stmt[:60]}...]: {e}")

conn.commit()
conn.close()
print("Done applying admin_sps.sql")
