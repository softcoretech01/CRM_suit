USE Admin_crm;

-- ==========================================
-- ROLES
-- ==========================================

DROP PROCEDURE IF EXISTS sp_admin_get_roles;
DELIMITER //
CREATE PROCEDURE sp_admin_get_roles()
BEGIN
    SELECT r.*, COUNT(u.id) as users 
    FROM roles r
    LEFT JOIN users u ON u.role_id = r.id AND u.is_active = 1
    WHERE r.is_active = 1
    GROUP BY r.id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_admin_get_role;
DELIMITER //
CREATE PROCEDURE sp_admin_get_role(IN p_role_id INT)
BEGIN
    SELECT * FROM roles WHERE id = p_role_id AND is_active = 1;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_admin_create_role;
DELIMITER //
CREATE PROCEDURE sp_admin_create_role(
    IN p_name VARCHAR(100),
    IN p_description TEXT,
    IN p_color VARCHAR(20),
    IN p_is_active BOOLEAN
)
BEGIN
    INSERT INTO roles (name, description, color, is_active) 
    VALUES (p_name, p_description, p_color, COALESCE(p_is_active, 1));
    SELECT LAST_INSERT_ID() as id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_admin_update_role;
DELIMITER //
CREATE PROCEDURE sp_admin_update_role(
    IN p_role_id INT,
    IN p_name VARCHAR(100),
    IN p_description TEXT,
    IN p_color VARCHAR(20),
    IN p_is_active BOOLEAN
)
BEGIN
    UPDATE roles 
    SET name = COALESCE(p_name, name),
        description = COALESCE(p_description, description),
        color = COALESCE(p_color, color),
        is_active = COALESCE(p_is_active, is_active)
    WHERE id = p_role_id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_admin_delete_role;
DELIMITER //
CREATE PROCEDURE sp_admin_delete_role(IN p_role_id INT)
BEGIN
    UPDATE users SET role_id = NULL WHERE role_id = p_role_id;
    DELETE FROM role_permissions WHERE role_id = p_role_id;
    DELETE FROM roles WHERE id = p_role_id;
END //
DELIMITER ;

-- ==========================================
-- USERS
-- ==========================================

DROP PROCEDURE IF EXISTS sp_admin_get_users;
DELIMITER //
CREATE PROCEDURE sp_admin_get_users(IN p_tenant_id INT)
BEGIN
    SELECT u.id, u.tenant_company_id, u.name, u.department, u.designation,
           u.joining_date, u.username, u.email, u.mobile, u.role_id,
           u.status, u.color, u.profile_pic, u.signature_url, u.is_active,
           u.created_at, u.updated_at,
           r.name as role, c.name as company_name, c.logo_url as company_logo
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    LEFT JOIN companies c ON u.tenant_company_id = c.id
    WHERE (p_tenant_id IS NULL OR p_tenant_id = 0 OR u.tenant_company_id = p_tenant_id) AND u.is_active = 1;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_admin_get_user;
DELIMITER //
CREATE PROCEDURE sp_admin_get_user(IN p_tenant_id INT, IN p_user_id INT)
BEGIN
    SELECT u.id, u.tenant_company_id, u.name, u.department, u.designation,
           u.joining_date, u.username, u.email, u.mobile, u.role_id,
           u.status, u.color, u.profile_pic, u.signature_url, u.is_active,
           u.created_at, u.updated_at,
           r.name as role, c.name as company_name, c.logo_url as company_logo
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    LEFT JOIN companies c ON u.tenant_company_id = c.id
    WHERE u.id = p_user_id AND (p_tenant_id IS NULL OR p_tenant_id = 0 OR u.tenant_company_id = p_tenant_id) AND u.is_active = 1
    LIMIT 1;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_admin_get_user_by_email;
DELIMITER //
CREATE PROCEDURE sp_admin_get_user_by_email(IN p_email VARCHAR(150))
BEGIN
    SELECT * FROM users WHERE email = p_email AND is_active = 1 LIMIT 1;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_admin_get_user_by_username_or_email;
DELIMITER //
CREATE PROCEDURE sp_admin_get_user_by_username_or_email(IN p_identifier VARCHAR(150))
BEGIN
    SELECT u.*, r.name as role_name 
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    WHERE (u.username = p_identifier OR u.email = p_identifier) AND u.is_active = 1 
    LIMIT 1;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_admin_create_user;
DELIMITER //
CREATE PROCEDURE sp_admin_create_user(
    IN p_tenant_company_id INT,
    IN p_name VARCHAR(150),
    IN p_department VARCHAR(100),
    IN p_designation VARCHAR(100),
    IN p_joining_date DATE,
    IN p_username VARCHAR(100),
    IN p_email VARCHAR(150),
    IN p_mobile VARCHAR(20),
    IN p_password_hash VARCHAR(255),
    IN p_role_id INT,
    IN p_status VARCHAR(20),
    IN p_color VARCHAR(20),
    IN p_profile_pic VARCHAR(255),
    IN p_signature_url VARCHAR(255),
    IN p_is_active BOOLEAN
)
BEGIN
    INSERT INTO users (
        tenant_company_id, name, department, designation, joining_date,
        username, email, mobile, password_hash, role_id, status, color,
        profile_pic, signature_url, is_active
    ) VALUES (
        p_tenant_company_id, p_name, p_department, p_designation, p_joining_date,
        p_username, p_email, p_mobile, p_password_hash, p_role_id, COALESCE(p_status, 'Active'), p_color,
        p_profile_pic, p_signature_url, COALESCE(p_is_active, 1)
    );
    SELECT LAST_INSERT_ID() as id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_admin_update_user;
DELIMITER //
CREATE PROCEDURE sp_admin_update_user(
    IN p_user_id INT,
    IN p_tenant_company_id INT,
    IN p_name VARCHAR(150),
    IN p_department VARCHAR(100),
    IN p_designation VARCHAR(100),
    IN p_joining_date DATE,
    IN p_username VARCHAR(100),
    IN p_email VARCHAR(150),
    IN p_mobile VARCHAR(20),
    IN p_password_hash VARCHAR(255),
    IN p_role_id INT,
    IN p_status VARCHAR(20),
    IN p_color VARCHAR(20),
    IN p_profile_pic VARCHAR(255),
    IN p_signature_url VARCHAR(255),
    IN p_is_active BOOLEAN
)
BEGIN
    IF EXISTS (SELECT 1 FROM users WHERE id = p_user_id AND (p_tenant_company_id IS NULL OR p_tenant_company_id = 0 OR tenant_company_id = p_tenant_company_id) AND is_active = 1) THEN
        UPDATE users 
        SET name = COALESCE(p_name, name),
            department = COALESCE(p_department, department),
            designation = COALESCE(p_designation, designation),
            joining_date = COALESCE(p_joining_date, joining_date),
            username = COALESCE(p_username, username),
            email = COALESCE(p_email, email),
            mobile = COALESCE(p_mobile, mobile),
            password_hash = COALESCE(p_password_hash, password_hash),
            role_id = COALESCE(p_role_id, role_id),
            status = COALESCE(p_status, status),
            color = COALESCE(p_color, color),
            profile_pic = COALESCE(p_profile_pic, profile_pic),
            signature_url = COALESCE(p_signature_url, signature_url),
            is_active = COALESCE(p_is_active, is_active)
        WHERE id = p_user_id AND (p_tenant_company_id IS NULL OR p_tenant_company_id = 0 OR tenant_company_id = p_tenant_company_id);
        SELECT 1 as updated;
    ELSE
        SELECT 0 as updated;
    END IF;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_admin_delete_user;
DELIMITER //
CREATE PROCEDURE sp_admin_delete_user(IN p_tenant_id INT, IN p_user_id INT)
BEGIN
    DELETE FROM users WHERE id = p_user_id AND (p_tenant_id IS NULL OR p_tenant_id = 0 OR tenant_company_id = p_tenant_id);
END //
DELIMITER ;

-- ==========================================
-- COMPANIES (TENANTS)
-- ==========================================

DROP PROCEDURE IF EXISTS sp_admin_get_companies;
DELIMITER //
CREATE PROCEDURE sp_admin_get_companies()
BEGIN
    SELECT c.*, 
           ind.name as industry, 
           typ.name as type,
           cit.name as city,
           sta.name as state,
           cou.name as country
    FROM companies c
    LEFT JOIN Masters_crm.industries ind ON c.industry_id = ind.id
    LEFT JOIN Masters_crm.company_types typ ON c.type_id = typ.id
    LEFT JOIN Masters_crm.cities cit ON c.city_id = cit.id
    LEFT JOIN Masters_crm.states sta ON c.state_id = sta.id
    LEFT JOIN Masters_crm.countries cou ON c.country_id = cou.id
    ORDER BY c.id ASC;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_admin_get_company;
DELIMITER //
CREATE PROCEDURE sp_admin_get_company(IN p_company_id INT)
BEGIN
    SELECT c.*, 
           ind.name as industry, 
           typ.name as type,
           cit.name as city,
           sta.name as state,
           cou.name as country
    FROM companies c
    LEFT JOIN Masters_crm.industries ind ON c.industry_id = ind.id
    LEFT JOIN Masters_crm.company_types typ ON c.type_id = typ.id
    LEFT JOIN Masters_crm.cities cit ON c.city_id = cit.id
    LEFT JOIN Masters_crm.states sta ON c.state_id = sta.id
    LEFT JOIN Masters_crm.countries cou ON c.country_id = cou.id
    WHERE c.id = p_company_id LIMIT 1;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_admin_get_user_count_for_company;
DELIMITER //
CREATE PROCEDURE sp_admin_get_user_count_for_company(IN p_tenant_id INT)
BEGIN
    SELECT COUNT(id) as count FROM users WHERE tenant_company_id = p_tenant_id AND is_active = 1;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_admin_create_company;
DELIMITER //
CREATE PROCEDURE sp_admin_create_company(
    IN p_name VARCHAR(150),
    IN p_industry_id INT,
    IN p_type_id INT,
    IN p_founder VARCHAR(100),
    IN p_address TEXT,
    IN p_city_id INT,
    IN p_state_id INT,
    IN p_country_id INT,
    IN p_remarks TEXT,
    IN p_contact_name VARCHAR(100),
    IN p_contact_email VARCHAR(100),
    IN p_contact_mobile VARCHAR(20),
    IN p_contact_designation VARCHAR(50),
    IN p_logo_url VARCHAR(255),
    IN p_status VARCHAR(20),
    IN p_is_active BOOLEAN,
    IN p_max_users INT
)
BEGIN
    INSERT INTO companies (
        name, industry_id, type_id, founder, address, city_id, state_id, country_id,
        remarks, contact_name, contact_email, contact_mobile, contact_designation,
        logo_url, status, is_active, max_users
    ) VALUES (
        p_name, p_industry_id, p_type_id, p_founder, p_address, p_city_id, p_state_id, p_country_id,
        p_remarks, p_contact_name, p_contact_email, p_contact_mobile, p_contact_designation,
        p_logo_url, COALESCE(p_status, 'Active'), COALESCE(p_is_active, 1), COALESCE(p_max_users, 1)
    );
    SELECT LAST_INSERT_ID() as id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_admin_update_company;
DELIMITER //
CREATE PROCEDURE sp_admin_update_company(
    IN p_company_id INT,
    IN p_name VARCHAR(150),
    IN p_industry_id INT,
    IN p_type_id INT,
    IN p_founder VARCHAR(100),
    IN p_address TEXT,
    IN p_city_id INT,
    IN p_state_id INT,
    IN p_country_id INT,
    IN p_remarks TEXT,
    IN p_contact_name VARCHAR(100),
    IN p_contact_email VARCHAR(100),
    IN p_contact_mobile VARCHAR(20),
    IN p_contact_designation VARCHAR(50),
    IN p_logo_url VARCHAR(255),
    IN p_status VARCHAR(20),
    IN p_is_active BOOLEAN,
    IN p_max_users INT
)
BEGIN
    IF EXISTS (SELECT 1 FROM companies WHERE id = p_company_id) THEN
        UPDATE companies 
        SET name = COALESCE(p_name, name),
            industry_id = COALESCE(p_industry_id, industry_id),
            type_id = COALESCE(p_type_id, type_id),
            founder = COALESCE(p_founder, founder),
            address = COALESCE(p_address, address),
            city_id = COALESCE(p_city_id, city_id),
            state_id = COALESCE(p_state_id, state_id),
            country_id = COALESCE(p_country_id, country_id),
            remarks = COALESCE(p_remarks, remarks),
            contact_name = COALESCE(p_contact_name, contact_name),
            contact_email = COALESCE(p_contact_email, contact_email),
            contact_mobile = COALESCE(p_contact_mobile, contact_mobile),
            contact_designation = COALESCE(p_contact_designation, contact_designation),
            logo_url = COALESCE(p_logo_url, logo_url),
            status = COALESCE(p_status, status),
            is_active = COALESCE(p_is_active, is_active),
            max_users = COALESCE(p_max_users, max_users)
        WHERE id = p_company_id;
        SELECT 1 as updated;
    ELSE
        SELECT 0 as updated;
    END IF;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_admin_delete_company;
DELIMITER //
CREATE PROCEDURE sp_admin_delete_company(IN p_company_id INT)
BEGIN
    DELETE FROM companies WHERE id = p_company_id;
END //
DELIMITER ;
