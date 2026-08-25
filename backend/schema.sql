-- Disable foreign key checks for clean recreation
SET FOREIGN_KEY_CHECKS = 0;

-- =========================================================
-- DATABASE: Masters_crm
-- =========================================================
CREATE DATABASE IF NOT EXISTS Masters_crm;
USE Masters_crm;

-- Global Location Masters
CREATE TABLE countries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(10),
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE states (
    id INT AUTO_INCREMENT PRIMARY KEY,
    country_id INT NOT NULL,
    code VARCHAR(10),
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE
);

CREATE TABLE cities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    state_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE CASCADE
);

CREATE TABLE company_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Global Business Masters
CREATE TABLE industries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE product_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE lead_sources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50),
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE lead_statuses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    color_code VARCHAR(10),
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE campaigns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    type VARCHAR(50),
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE activity_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    color_code VARCHAR(10),
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE priorities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    color_code VARCHAR(10),
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE next_actions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    color_code VARCHAR(10),
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


-- =========================================================
-- DATABASE: Admin_crm
-- =========================================================
CREATE DATABASE IF NOT EXISTS Admin_crm;
USE Admin_crm;

-- Root Tenant Table
CREATE TABLE companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    industry_id INT,
    type_id INT,
    founder VARCHAR(100),
    address TEXT,
    city_id INT,
    state_id INT,
    country_id INT,
    remarks TEXT,
    contact_name VARCHAR(100),
    contact_email VARCHAR(100),
    contact_mobile VARCHAR(20),
    contact_designation VARCHAR(50),
    logo_url VARCHAR(255),
    status VARCHAR(20) DEFAULT 'Active',
    is_active BOOLEAN DEFAULT TRUE,
    max_users INT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    FOREIGN KEY (industry_id) REFERENCES Masters_crm.industries(id) ON DELETE SET NULL,
    FOREIGN KEY (type_id) REFERENCES Masters_crm.company_types(id) ON DELETE SET NULL,
    FOREIGN KEY (city_id) REFERENCES Masters_crm.cities(id) ON DELETE SET NULL,
    FOREIGN KEY (state_id) REFERENCES Masters_crm.states(id) ON DELETE SET NULL,
    FOREIGN KEY (country_id) REFERENCES Masters_crm.countries(id) ON DELETE SET NULL
);

CREATE TABLE permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    portal VARCHAR(50) NOT NULL,
    screen VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE role_permissions (
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_company_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    department VARCHAR(100),
    designation VARCHAR(100),
    joining_date DATE,
    username VARCHAR(100),
    email VARCHAR(150) UNIQUE,
    mobile VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role_id INT,
    status VARCHAR(20) DEFAULT 'Active',
    color VARCHAR(20),
    profile_pic VARCHAR(255),
    signature_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL,
    FOREIGN KEY (tenant_company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    tenant_company_id INT,
    token VARCHAR(500) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    revoked_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- =========================================================
-- DATABASE: CRM
-- =========================================================
CREATE DATABASE IF NOT EXISTS CRM;
USE CRM;

CREATE TABLE crm_companies (
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
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_company_id) REFERENCES Admin_crm.companies(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES Admin_crm.users(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to) REFERENCES Admin_crm.users(id) ON DELETE SET NULL
);

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_company_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    sku_code VARCHAR(50),
    description TEXT,
    category_id INT,
    unit VARCHAR(20),
    unit_price DECIMAL(15, 2),
    tax_rate DECIMAL(5, 2),
    created_by INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_company_id) REFERENCES Admin_crm.companies(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES Masters_crm.product_categories(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES Admin_crm.users(id) ON DELETE SET NULL
);

CREATE TABLE leads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_company_id INT NOT NULL,
    company_id INT, 
    lead_name VARCHAR(150),
    contact_name VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    source VARCHAR(50),
    status VARCHAR(50) DEFAULT 'New',
    priority VARCHAR(50),
    assigned_to INT,
    created_by INT,
    notes TEXT,
    value DECIMAL(15,2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_company_id) REFERENCES Admin_crm.companies(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES crm_companies(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to) REFERENCES Admin_crm.users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES Admin_crm.users(id) ON DELETE SET NULL
);

CREATE TABLE contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_company_id INT NOT NULL,
    company_id INT, 
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50),
    email VARCHAR(100),
    phone VARCHAR(20),
    designation VARCHAR(50),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    notes TEXT,
    created_by INT,
    assigned_to INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_company_id) REFERENCES Admin_crm.companies(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES crm_companies(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES Admin_crm.users(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to) REFERENCES Admin_crm.users(id) ON DELETE SET NULL
);

CREATE TABLE opportunities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_company_id INT NOT NULL,
    lead_id INT,
    company_id INT,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    value DECIMAL(15, 2),
    stage VARCHAR(50),
    probability INT,
    expected_close_date DATE,
    assigned_to INT,
    created_by INT,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_company_id) REFERENCES Admin_crm.companies(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES crm_companies(id) ON DELETE SET NULL,
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to) REFERENCES Admin_crm.users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES Admin_crm.users(id) ON DELETE SET NULL
);

CREATE TABLE activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_company_id INT NOT NULL,
    company_id INT,
    contact_id INT,
    lead_id INT,
    opportunity_id INT,
    activity_type VARCHAR(50),
    subject VARCHAR(200) NOT NULL,
    activity_datetime DATETIME,
    duration INT, -- in minutes
    outcome VARCHAR(50),
    next_action VARCHAR(50),
    assigned_to INT,
    created_by INT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_company_id) REFERENCES Admin_crm.companies(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES crm_companies(id) ON DELETE CASCADE,
    FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
    FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES Admin_crm.users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES Admin_crm.users(id) ON DELETE SET NULL
);

CREATE TABLE followups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_company_id INT NOT NULL,
    lead_id INT,
    contact_id INT,
    opportunity_id INT,
    followup_date DATETIME,
    followup_type VARCHAR(50),
    status VARCHAR(20) DEFAULT 'Pending',
    notes TEXT,
    assigned_to INT,
    created_by INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_company_id) REFERENCES Admin_crm.companies(id) ON DELETE CASCADE,
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
    FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
    FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES Admin_crm.users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES Admin_crm.users(id) ON DELETE SET NULL
);

SET FOREIGN_KEY_CHECKS = 1;
