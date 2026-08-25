USE Masters_crm;

-- ==========================================
-- COMPANY_TYPES
-- ==========================================

DROP PROCEDURE IF EXISTS sp_get_company_types;
DELIMITER //
CREATE PROCEDURE sp_get_company_types()
BEGIN
    SELECT * FROM company_types ORDER BY id ASC;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_get_company_types_by_id;
DELIMITER //
CREATE PROCEDURE sp_get_company_types_by_id(IN p_id INT)
BEGIN
    SELECT * FROM company_types WHERE id = p_id LIMIT 1;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_create_company_types;
DELIMITER //
CREATE PROCEDURE sp_create_company_types(
    IN p_name VARCHAR(100),
    IN p_is_active BOOLEAN
)
BEGIN
    INSERT INTO company_types (name, is_active) VALUES (p_name, COALESCE(p_is_active, 1));
    SELECT LAST_INSERT_ID() as id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_update_company_types;
DELIMITER //
CREATE PROCEDURE sp_update_company_types(
    IN p_id INT,
    IN p_name VARCHAR(100),
    IN p_is_active BOOLEAN
)
BEGIN
    UPDATE company_types 
    SET name = COALESCE(p_name, name),
        is_active = COALESCE(p_is_active, is_active) 
    WHERE id = p_id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_delete_company_types;
DELIMITER //
CREATE PROCEDURE sp_delete_company_types(IN p_id INT)
BEGIN
    DELETE FROM company_types WHERE id = p_id;
END //
DELIMITER ;

-- ==========================================
-- INDUSTRIES
-- ==========================================

DROP PROCEDURE IF EXISTS sp_get_industries;
DELIMITER //
CREATE PROCEDURE sp_get_industries()
BEGIN
    SELECT * FROM industries ORDER BY id ASC;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_get_industries_by_id;
DELIMITER //
CREATE PROCEDURE sp_get_industries_by_id(IN p_id INT)
BEGIN
    SELECT * FROM industries WHERE id = p_id LIMIT 1;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_create_industries;
DELIMITER //
CREATE PROCEDURE sp_create_industries(
    IN p_code VARCHAR(50),
    IN p_name VARCHAR(100),
    IN p_description TEXT,
    IN p_is_active BOOLEAN
)
BEGIN
    INSERT INTO industries (code, name, description, is_active) VALUES (p_code, p_name, p_description, COALESCE(p_is_active, 1));
    SELECT LAST_INSERT_ID() as id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_update_industries;
DELIMITER //
CREATE PROCEDURE sp_update_industries(
    IN p_id INT,
    IN p_code VARCHAR(50),
    IN p_name VARCHAR(100),
    IN p_description TEXT,
    IN p_is_active BOOLEAN
)
BEGIN
    UPDATE industries 
    SET code = COALESCE(p_code, code),
        name = COALESCE(p_name, name),
        description = COALESCE(p_description, description),
        is_active = COALESCE(p_is_active, is_active) 
    WHERE id = p_id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_delete_industries;
DELIMITER //
CREATE PROCEDURE sp_delete_industries(IN p_id INT)
BEGIN
    DELETE FROM industries WHERE id = p_id;
END //
DELIMITER ;

-- ==========================================
-- PRODUCT_CATEGORIES
-- ==========================================

DROP PROCEDURE IF EXISTS sp_get_product_categories;
DELIMITER //
CREATE PROCEDURE sp_get_product_categories()
BEGIN
    SELECT * FROM product_categories ORDER BY id ASC;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_get_product_categories_by_id;
DELIMITER //
CREATE PROCEDURE sp_get_product_categories_by_id(IN p_id INT)
BEGIN
    SELECT * FROM product_categories WHERE id = p_id LIMIT 1;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_create_product_categories;
DELIMITER //
CREATE PROCEDURE sp_create_product_categories(
    IN p_name VARCHAR(100),
    IN p_description TEXT,
    IN p_is_active BOOLEAN
)
BEGIN
    INSERT INTO product_categories (name, description, is_active) VALUES (p_name, p_description, COALESCE(p_is_active, 1));
    SELECT LAST_INSERT_ID() as id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_update_product_categories;
DELIMITER //
CREATE PROCEDURE sp_update_product_categories(
    IN p_id INT,
    IN p_name VARCHAR(100),
    IN p_description TEXT,
    IN p_is_active BOOLEAN
)
BEGIN
    UPDATE product_categories 
    SET name = COALESCE(p_name, name),
        description = COALESCE(p_description, description),
        is_active = COALESCE(p_is_active, is_active) 
    WHERE id = p_id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_delete_product_categories;
DELIMITER //
CREATE PROCEDURE sp_delete_product_categories(IN p_id INT)
BEGIN
    DELETE FROM product_categories WHERE id = p_id;
END //
DELIMITER ;

-- ==========================================
-- COUNTRIES
-- ==========================================

DROP PROCEDURE IF EXISTS sp_get_countries;
DELIMITER //
CREATE PROCEDURE sp_get_countries()
BEGIN
    SELECT * FROM countries ORDER BY id ASC;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_get_countries_by_id;
DELIMITER //
CREATE PROCEDURE sp_get_countries_by_id(IN p_id INT)
BEGIN
    SELECT * FROM countries WHERE id = p_id LIMIT 1;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_create_countries;
DELIMITER //
CREATE PROCEDURE sp_create_countries(
    IN p_code VARCHAR(10),
    IN p_name VARCHAR(100),
    IN p_is_active BOOLEAN
)
BEGIN
    INSERT INTO countries (code, name, is_active) VALUES (p_code, p_name, COALESCE(p_is_active, 1));
    SELECT LAST_INSERT_ID() as id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_update_countries;
DELIMITER //
CREATE PROCEDURE sp_update_countries(
    IN p_id INT,
    IN p_code VARCHAR(10),
    IN p_name VARCHAR(100),
    IN p_is_active BOOLEAN
)
BEGIN
    UPDATE countries 
    SET code = COALESCE(p_code, code),
        name = COALESCE(p_name, name),
        is_active = COALESCE(p_is_active, is_active) 
    WHERE id = p_id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_delete_countries;
DELIMITER //
CREATE PROCEDURE sp_delete_countries(IN p_id INT)
BEGIN
    DELETE FROM countries WHERE id = p_id;
END //
DELIMITER ;

-- ==========================================
-- STATES
-- ==========================================

DROP PROCEDURE IF EXISTS sp_get_states;
DELIMITER //
CREATE PROCEDURE sp_get_states()
BEGIN
    SELECT s.id, s.country_id, s.code, s.name, s.is_active, s.created_at, s.updated_at,
           c.name AS country_name, c.name AS country
    FROM states s
    LEFT JOIN countries c ON s.country_id = c.id
    ORDER BY s.id ASC;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_get_states_by_id;
DELIMITER //
CREATE PROCEDURE sp_get_states_by_id(IN p_id INT)
BEGIN
    SELECT s.id, s.country_id, s.code, s.name, s.is_active, s.created_at, s.updated_at,
           c.name AS country_name, c.name AS country
    FROM states s
    LEFT JOIN countries c ON s.country_id = c.id
    WHERE s.id = p_id LIMIT 1;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_create_states;
DELIMITER //
CREATE PROCEDURE sp_create_states(
    IN p_country_id INT,
    IN p_code VARCHAR(10),
    IN p_name VARCHAR(100),
    IN p_is_active BOOLEAN
)
BEGIN
    INSERT INTO states (country_id, code, name, is_active) VALUES (p_country_id, p_code, p_name, COALESCE(p_is_active, 1));
    SELECT LAST_INSERT_ID() as id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_update_states;
DELIMITER //
CREATE PROCEDURE sp_update_states(
    IN p_id INT,
    IN p_country_id INT,
    IN p_code VARCHAR(10),
    IN p_name VARCHAR(100),
    IN p_is_active BOOLEAN
)
BEGIN
    UPDATE states 
    SET country_id = COALESCE(p_country_id, country_id),
        code = COALESCE(p_code, code),
        name = COALESCE(p_name, name),
        is_active = COALESCE(p_is_active, is_active) 
    WHERE id = p_id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_delete_states;
DELIMITER //
CREATE PROCEDURE sp_delete_states(IN p_id INT)
BEGIN
    DELETE FROM states WHERE id = p_id;
END //
DELIMITER ;

-- ==========================================
-- CITIES
-- ==========================================

DROP PROCEDURE IF EXISTS sp_get_cities;
DELIMITER //
CREATE PROCEDURE sp_get_cities()
BEGIN
    SELECT ci.id, ci.state_id, ci.name, ci.is_active, ci.created_at, ci.updated_at,
           s.name AS state_name, s.name AS state
    FROM cities ci
    LEFT JOIN states s ON ci.state_id = s.id
    ORDER BY ci.id ASC;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_get_cities_by_id;
DELIMITER //
CREATE PROCEDURE sp_get_cities_by_id(IN p_id INT)
BEGIN
    SELECT ci.id, ci.state_id, ci.name, ci.is_active, ci.created_at, ci.updated_at,
           s.name AS state_name, s.name AS state
    FROM cities ci
    LEFT JOIN states s ON ci.state_id = s.id
    WHERE ci.id = p_id LIMIT 1;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_create_cities;
DELIMITER //
CREATE PROCEDURE sp_create_cities(
    IN p_state_id INT,
    IN p_name VARCHAR(100),
    IN p_is_active BOOLEAN
)
BEGIN
    INSERT INTO cities (state_id, name, is_active) VALUES (p_state_id, p_name, COALESCE(p_is_active, 1));
    SELECT LAST_INSERT_ID() as id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_update_cities;
DELIMITER //
CREATE PROCEDURE sp_update_cities(
    IN p_id INT,
    IN p_state_id INT,
    IN p_name VARCHAR(100),
    IN p_is_active BOOLEAN
)
BEGIN
    UPDATE cities 
    SET state_id = COALESCE(p_state_id, state_id),
        name = COALESCE(p_name, name),
        is_active = COALESCE(p_is_active, is_active) 
    WHERE id = p_id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_delete_cities;
DELIMITER //
CREATE PROCEDURE sp_delete_cities(IN p_id INT)
BEGIN
    DELETE FROM cities WHERE id = p_id;
END //
DELIMITER ;

-- ==========================================
-- LEAD_SOURCES
-- ==========================================

DROP PROCEDURE IF EXISTS sp_get_lead_sources;
DELIMITER //
CREATE PROCEDURE sp_get_lead_sources()
BEGIN
    SELECT * FROM lead_sources ORDER BY id ASC;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_get_lead_sources_by_id;
DELIMITER //
CREATE PROCEDURE sp_get_lead_sources_by_id(IN p_id INT)
BEGIN
    SELECT * FROM lead_sources WHERE id = p_id LIMIT 1;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_create_lead_sources;
DELIMITER //
CREATE PROCEDURE sp_create_lead_sources(
    IN p_code VARCHAR(50),
    IN p_name VARCHAR(100),
    IN p_is_active BOOLEAN
)
BEGIN
    INSERT INTO lead_sources (code, name, is_active) VALUES (p_code, p_name, COALESCE(p_is_active, 1));
    SELECT LAST_INSERT_ID() as id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_update_lead_sources;
DELIMITER //
CREATE PROCEDURE sp_update_lead_sources(
    IN p_id INT,
    IN p_code VARCHAR(50),
    IN p_name VARCHAR(100),
    IN p_is_active BOOLEAN
)
BEGIN
    UPDATE lead_sources 
    SET code = COALESCE(p_code, code),
        name = COALESCE(p_name, name),
        is_active = COALESCE(p_is_active, is_active) 
    WHERE id = p_id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_delete_lead_sources;
DELIMITER //
CREATE PROCEDURE sp_delete_lead_sources(IN p_id INT)
BEGIN
    DELETE FROM lead_sources WHERE id = p_id;
END //
DELIMITER ;

-- ==========================================
-- LEAD_STATUSES
-- ==========================================

DROP PROCEDURE IF EXISTS sp_get_lead_statuses;
DELIMITER //
CREATE PROCEDURE sp_get_lead_statuses()
BEGIN
    SELECT * FROM lead_statuses ORDER BY id ASC;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_get_lead_statuses_by_id;
DELIMITER //
CREATE PROCEDURE sp_get_lead_statuses_by_id(IN p_id INT)
BEGIN
    SELECT * FROM lead_statuses WHERE id = p_id LIMIT 1;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_create_lead_statuses;
DELIMITER //
CREATE PROCEDURE sp_create_lead_statuses(
    IN p_name VARCHAR(100),
    IN p_color_code VARCHAR(10),
    IN p_sort_order INT,
    IN p_is_active BOOLEAN
)
BEGIN
    INSERT INTO lead_statuses (name, color_code, sort_order, is_active) VALUES (p_name, p_color_code, p_sort_order, COALESCE(p_is_active, 1));
    SELECT LAST_INSERT_ID() as id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_update_lead_statuses;
DELIMITER //
CREATE PROCEDURE sp_update_lead_statuses(
    IN p_id INT,
    IN p_name VARCHAR(100),
    IN p_color_code VARCHAR(10),
    IN p_sort_order INT,
    IN p_is_active BOOLEAN
)
BEGIN
    UPDATE lead_statuses 
    SET name = COALESCE(p_name, name),
        color_code = COALESCE(p_color_code, color_code),
        sort_order = COALESCE(p_sort_order, sort_order),
        is_active = COALESCE(p_is_active, is_active) 
    WHERE id = p_id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_delete_lead_statuses;
DELIMITER //
CREATE PROCEDURE sp_delete_lead_statuses(IN p_id INT)
BEGIN
    DELETE FROM lead_statuses WHERE id = p_id;
END //
DELIMITER ;

-- ==========================================
-- CAMPAIGNS
-- ==========================================

DROP PROCEDURE IF EXISTS sp_get_campaigns;
DELIMITER //
CREATE PROCEDURE sp_get_campaigns()
BEGIN
    SELECT * FROM campaigns ORDER BY id ASC;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_get_campaigns_by_id;
DELIMITER //
CREATE PROCEDURE sp_get_campaigns_by_id(IN p_id INT)
BEGIN
    SELECT * FROM campaigns WHERE id = p_id LIMIT 1;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_create_campaigns;
DELIMITER //
CREATE PROCEDURE sp_create_campaigns(
    IN p_name VARCHAR(150),
    IN p_type VARCHAR(50),
    IN p_start_date DATE,
    IN p_end_date DATE,
    IN p_is_active BOOLEAN
)
BEGIN
    INSERT INTO campaigns (name, type, start_date, end_date, is_active) VALUES (p_name, p_type, p_start_date, p_end_date, COALESCE(p_is_active, 1));
    SELECT LAST_INSERT_ID() as id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_update_campaigns;
DELIMITER //
CREATE PROCEDURE sp_update_campaigns(
    IN p_id INT,
    IN p_name VARCHAR(150),
    IN p_type VARCHAR(50),
    IN p_start_date DATE,
    IN p_end_date DATE,
    IN p_is_active BOOLEAN
)
BEGIN
    UPDATE campaigns 
    SET name = COALESCE(p_name, name),
        type = COALESCE(p_type, type),
        start_date = COALESCE(p_start_date, start_date),
        end_date = COALESCE(p_end_date, end_date),
        is_active = COALESCE(p_is_active, is_active) 
    WHERE id = p_id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_delete_campaigns;
DELIMITER //
CREATE PROCEDURE sp_delete_campaigns(IN p_id INT)
BEGIN
    DELETE FROM campaigns WHERE id = p_id;
END //
DELIMITER ;

-- ==========================================
-- ACTIVITY_TYPES
-- ==========================================

DROP PROCEDURE IF EXISTS sp_get_activity_types;
DELIMITER //
CREATE PROCEDURE sp_get_activity_types()
BEGIN
    SELECT * FROM activity_types ORDER BY id ASC;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_get_activity_types_by_id;
DELIMITER //
CREATE PROCEDURE sp_get_activity_types_by_id(IN p_id INT)
BEGIN
    SELECT * FROM activity_types WHERE id = p_id LIMIT 1;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_create_activity_types;
DELIMITER //
CREATE PROCEDURE sp_create_activity_types(
    IN p_name VARCHAR(100),
    IN p_color_code VARCHAR(10),
    IN p_icon VARCHAR(50),
    IN p_is_active BOOLEAN
)
BEGIN
    INSERT INTO activity_types (name, color_code, icon, is_active) VALUES (p_name, p_color_code, p_icon, COALESCE(p_is_active, 1));
    SELECT LAST_INSERT_ID() as id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_update_activity_types;
DELIMITER //
CREATE PROCEDURE sp_update_activity_types(
    IN p_id INT,
    IN p_name VARCHAR(100),
    IN p_color_code VARCHAR(10),
    IN p_icon VARCHAR(50),
    IN p_is_active BOOLEAN
)
BEGIN
    UPDATE activity_types 
    SET name = COALESCE(p_name, name),
        color_code = COALESCE(p_color_code, color_code),
        icon = COALESCE(p_icon, icon),
        is_active = COALESCE(p_is_active, is_active) 
    WHERE id = p_id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_delete_activity_types;
DELIMITER //
CREATE PROCEDURE sp_delete_activity_types(IN p_id INT)
BEGIN
    DELETE FROM activity_types WHERE id = p_id;
END //
DELIMITER ;

-- ==========================================
-- PRIORITIES
-- ==========================================

DROP PROCEDURE IF EXISTS sp_get_priorities;
DELIMITER //
CREATE PROCEDURE sp_get_priorities()
BEGIN
    SELECT * FROM priorities ORDER BY id ASC;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_get_priorities_by_id;
DELIMITER //
CREATE PROCEDURE sp_get_priorities_by_id(IN p_id INT)
BEGIN
    SELECT * FROM priorities WHERE id = p_id LIMIT 1;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_create_priorities;
DELIMITER //
CREATE PROCEDURE sp_create_priorities(
    IN p_name VARCHAR(100),
    IN p_color_code VARCHAR(10),
    IN p_sort_order INT,
    IN p_is_active BOOLEAN
)
BEGIN
    INSERT INTO priorities (name, color_code, sort_order, is_active) VALUES (p_name, p_color_code, p_sort_order, COALESCE(p_is_active, 1));
    SELECT LAST_INSERT_ID() as id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_update_priorities;
DELIMITER //
CREATE PROCEDURE sp_update_priorities(
    IN p_id INT,
    IN p_name VARCHAR(100),
    IN p_color_code VARCHAR(10),
    IN p_sort_order INT,
    IN p_is_active BOOLEAN
)
BEGIN
    UPDATE priorities 
    SET name = COALESCE(p_name, name),
        color_code = COALESCE(p_color_code, color_code),
        sort_order = COALESCE(p_sort_order, sort_order),
        is_active = COALESCE(p_is_active, is_active) 
    WHERE id = p_id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_delete_priorities;
DELIMITER //
CREATE PROCEDURE sp_delete_priorities(IN p_id INT)
BEGIN
    DELETE FROM priorities WHERE id = p_id;
END //
DELIMITER ;

-- ==========================================
-- NEXT_ACTIONS
-- ==========================================

DROP PROCEDURE IF EXISTS sp_get_next_actions;
DELIMITER //
CREATE PROCEDURE sp_get_next_actions()
BEGIN
    SELECT * FROM next_actions ORDER BY id ASC;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_get_next_actions_by_id;
DELIMITER //
CREATE PROCEDURE sp_get_next_actions_by_id(IN p_id INT)
BEGIN
    SELECT * FROM next_actions WHERE id = p_id LIMIT 1;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_create_next_actions;
DELIMITER //
CREATE PROCEDURE sp_create_next_actions(
    IN p_name VARCHAR(100),
    IN p_color_code VARCHAR(10),
    IN p_sort_order INT,
    IN p_is_active BOOLEAN
)
BEGIN
    INSERT INTO next_actions (name, color_code, sort_order, is_active) VALUES (p_name, p_color_code, p_sort_order, COALESCE(p_is_active, 1));
    SELECT LAST_INSERT_ID() as id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_update_next_actions;
DELIMITER //
CREATE PROCEDURE sp_update_next_actions(
    IN p_id INT,
    IN p_name VARCHAR(100),
    IN p_color_code VARCHAR(10),
    IN p_sort_order INT,
    IN p_is_active BOOLEAN
)
BEGIN
    UPDATE next_actions 
    SET name = COALESCE(p_name, name),
        color_code = COALESCE(p_color_code, color_code),
        sort_order = COALESCE(p_sort_order, sort_order),
        is_active = COALESCE(p_is_active, is_active) 
    WHERE id = p_id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_delete_next_actions;
DELIMITER //
CREATE PROCEDURE sp_delete_next_actions(IN p_id INT)
BEGIN
    DELETE FROM next_actions WHERE id = p_id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_get_states_with_country;
DELIMITER //
CREATE PROCEDURE sp_get_states_with_country()
BEGIN
    SELECT s.*, c.name as country_name FROM states s LEFT JOIN countries c ON s.country_id = c.id ORDER BY s.id ASC;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_get_cities_with_state;
DELIMITER //
CREATE PROCEDURE sp_get_cities_with_state()
BEGIN
    SELECT c.*, s.name as state_name, cou.name as country_name FROM cities c LEFT JOIN states s ON c.state_id = s.id LEFT JOIN countries cou ON s.country_id = cou.id ORDER BY c.id ASC;
END //
DELIMITER ;
