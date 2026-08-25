import pymysql

conn = pymysql.connect(
    host='100.86.181.18',
    port=3325,
    user='root',
    password='Cr3#2026',
    autocommit=True
)

crm_tables_sql = """
USE `Admin_crm`;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS crm_companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_company_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    industry VARCHAR(100),
    type VARCHAR(50),
    city VARCHAR(50),
    state VARCHAR(50),
    country VARCHAR(50),
    address TEXT,
    remarks TEXT,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_by INT,
    assigned_to INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_company_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    sku_code VARCHAR(50),
    category VARCHAR(100),
    price DECIMAL(12, 2) DEFAULT 0.00,
    unit VARCHAR(20) DEFAULT 'Unit',
    tax_rate DECIMAL(5, 2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_company_id INT NOT NULL,
    number VARCHAR(50),
    date DATE,
    company_id INT,
    contact_id INT,
    assigned_to INT,
    status VARCHAR(50) DEFAULT 'New',
    score INT DEFAULT 0,
    priority VARCHAR(20) DEFAULT 'Medium',
    source VARCHAR(50),
    value DECIMAL(12, 2) DEFAULT 0.00,
    budget DECIMAL(12, 2) DEFAULT 0.00,
    requirement TEXT,
    created_by INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_company_id INT NOT NULL,
    crm_company_id INT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    email VARCHAR(150),
    phone VARCHAR(20),
    designation VARCHAR(100),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS opportunities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_company_id INT NOT NULL,
    lead_id INT,
    company_id INT,
    contact_id INT,
    title VARCHAR(150) NOT NULL,
    value DECIMAL(12, 2) DEFAULT 0.00,
    stage VARCHAR(50) DEFAULT 'Qualification',
    probability INT DEFAULT 20,
    expected_close_date DATE,
    assigned_to INT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_company_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    entity_type VARCHAR(50),
    entity_id INT,
    performed_by INT,
    activity_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS followups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_company_id INT NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    followup_date DATETIME NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending',
    assigned_to INT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

SET FOREIGN_KEY_CHECKS = 1;
"""

with conn.cursor() as cur:
    for stmt in crm_tables_sql.split(';'):
        if stmt.strip():
            try:
                cur.execute(stmt)
            except Exception as e:
                print("Error:", e)

    print("Tables in Admin_crm after ensuring CRM tables:")
    cur.execute("SHOW TABLES FROM `Admin_crm`;")
    tables = [r[0] for r in cur.fetchall()]
    print(tables)

conn.close()
