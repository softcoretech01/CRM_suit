import pymysql
import os

with open(r'd:\CRM\backend\masters_sps.sql', 'r', encoding='utf-8') as f:
    sql_script = f.read()

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
    database='Masters_crm',
)

with conn.cursor() as cur:
    for stmt in all_stmts:
        if not stmt or stmt.startswith('--'):
            continue
        try:
            cur.execute(stmt)
        except Exception as e:
            print(f"FAILED executing [{stmt[:60]}...]: {e}")

conn.commit()
conn.close()
print("Done applying masters_sps.sql")
