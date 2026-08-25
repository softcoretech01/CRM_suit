-- ============================================================
-- CRM database stored procedures
-- Lead -> Follow-up -> Closure -> Registration -> Feedback -> Reports
-- Multi-tenant: every proc takes p_tenant and filters by tenant_company_id.
-- ============================================================
USE crm;

-- ---------- CRM COMPANIES (fixes lead/contact save: they FK to crm_companies) ----------
DROP PROCEDURE IF EXISTS sp_crm_company_list;
DELIMITER //
CREATE PROCEDURE sp_crm_company_list(IN p_tenant INT)
BEGIN
  SELECT * FROM crm_companies WHERE tenant_company_id = p_tenant ORDER BY name;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_crm_company_get;
DELIMITER //
CREATE PROCEDURE sp_crm_company_get(IN p_tenant INT, IN p_id INT)
BEGIN
  SELECT * FROM crm_companies WHERE id = p_id AND tenant_company_id = p_tenant;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_crm_company_create;
DELIMITER //
CREATE PROCEDURE sp_crm_company_create(
  IN p_tenant INT, IN p_name VARCHAR(150), IN p_industry VARCHAR(100), IN p_type VARCHAR(50),
  IN p_city VARCHAR(50), IN p_state VARCHAR(50), IN p_country VARCHAR(50),
  IN p_address TEXT, IN p_remarks TEXT, IN p_status VARCHAR(20), IN p_created_by INT)
BEGIN
  INSERT INTO crm_companies (tenant_company_id, name, industry, type, city, state, country, address, remarks, status, created_by)
  VALUES (p_tenant, p_name, p_industry, p_type, p_city, p_state, p_country, p_address, p_remarks, COALESCE(p_status,'ACTIVE'), p_created_by);
  SELECT LAST_INSERT_ID() AS id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_crm_company_update;
DELIMITER //
CREATE PROCEDURE sp_crm_company_update(
  IN p_tenant INT, IN p_id INT, IN p_name VARCHAR(150), IN p_industry VARCHAR(100), IN p_type VARCHAR(50),
  IN p_city VARCHAR(50), IN p_state VARCHAR(50), IN p_country VARCHAR(50),
  IN p_address TEXT, IN p_remarks TEXT, IN p_status VARCHAR(20))
BEGIN
  UPDATE crm_companies SET
    name = COALESCE(p_name, name), industry = p_industry, type = p_type,
    city = p_city, state = p_state, country = p_country, address = p_address,
    remarks = p_remarks, status = COALESCE(p_status, status)
  WHERE id = p_id AND tenant_company_id = p_tenant;
  SELECT ROW_COUNT() AS affected;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_crm_company_delete;
DELIMITER //
CREATE PROCEDURE sp_crm_company_delete(IN p_tenant INT, IN p_id INT)
BEGIN
  DELETE FROM crm_companies WHERE id = p_id AND tenant_company_id = p_tenant;
  SELECT ROW_COUNT() AS affected;
END //
DELIMITER ;

-- ---------- LEADS ----------
DROP PROCEDURE IF EXISTS sp_crm_lead_list;
DELIMITER //
CREATE PROCEDURE sp_crm_lead_list(IN p_tenant INT)
BEGIN
  SELECT l.*, c.name AS company_name, p.name AS product_name,
         (SELECT COUNT(*) FROM followups f WHERE f.lead_id = l.id AND f.status <> 'Done' AND f.status <> 'Completed') AS followup_count,
         (SELECT MIN(f.next_followup_date) FROM followups f WHERE f.lead_id = l.id AND f.status <> 'Done' AND f.next_followup_date >= NOW()) AS next_followup_date,
         (SELECT ROUND(AVG(fb.rating),1) FROM lead_feedback fb WHERE fb.lead_id = l.id) AS feedback_rating
  FROM leads l
  LEFT JOIN crm_companies c ON l.company_id = c.id
  LEFT JOIN products p ON l.product_id = p.id
  WHERE l.tenant_company_id = p_tenant
  ORDER BY l.created_at DESC;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_crm_lead_get;
DELIMITER //
CREATE PROCEDURE sp_crm_lead_get(IN p_tenant INT, IN p_id INT)
BEGIN
  SELECT l.*, c.name AS company_name, p.name AS product_name
  FROM leads l
  LEFT JOIN crm_companies c ON l.company_id = c.id
  LEFT JOIN products p ON l.product_id = p.id
  WHERE l.id = p_id AND l.tenant_company_id = p_tenant;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_crm_lead_create;
DELIMITER //
CREATE PROCEDURE sp_crm_lead_create(
  IN p_tenant INT, IN p_company_id INT, IN p_product_id INT, IN p_lead_name VARCHAR(150), IN p_contact_name VARCHAR(100),
  IN p_email VARCHAR(100), IN p_phone VARCHAR(20), IN p_address TEXT, IN p_business_details TEXT,
  IN p_requirement TEXT, IN p_source VARCHAR(50), IN p_temperature VARCHAR(10), IN p_priority VARCHAR(50),
  IN p_value DECIMAL(15,2), IN p_assigned_to INT, IN p_created_by INT, IN p_notes TEXT)
BEGIN
  INSERT INTO leads (tenant_company_id, company_id, product_id, lead_name, contact_name, email, phone, address,
                     business_details, requirement, source, temperature, status, closure_status,
                     priority, value, assigned_to, created_by, notes)
  VALUES (p_tenant, NULLIF(p_company_id,0), NULLIF(p_product_id,0), p_lead_name, p_contact_name, p_email, p_phone, p_address,
          p_business_details, p_requirement, p_source, p_temperature, 'Active', 'Open',
          p_priority, p_value, NULLIF(p_assigned_to,0), NULLIF(p_created_by,0), p_notes);
  SELECT LAST_INSERT_ID() AS id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_crm_lead_update;
DELIMITER //
CREATE PROCEDURE sp_crm_lead_update(
  IN p_tenant INT, IN p_id INT, IN p_company_id INT, IN p_product_id INT, IN p_lead_name VARCHAR(150), IN p_contact_name VARCHAR(100),
  IN p_email VARCHAR(100), IN p_phone VARCHAR(20), IN p_address TEXT, IN p_business_details TEXT,
  IN p_requirement TEXT, IN p_source VARCHAR(50), IN p_temperature VARCHAR(10), IN p_priority VARCHAR(50),
  IN p_value DECIMAL(15,2), IN p_assigned_to INT, IN p_notes TEXT)
BEGIN
  UPDATE leads SET
    company_id = NULLIF(p_company_id,0), product_id = NULLIF(p_product_id,0), lead_name = COALESCE(p_lead_name, lead_name),
    contact_name = p_contact_name, email = p_email, phone = p_phone, address = p_address,
    business_details = p_business_details, requirement = p_requirement, source = p_source,
    temperature = p_temperature, priority = p_priority, value = p_value,
    assigned_to = NULLIF(p_assigned_to,0), notes = p_notes
  WHERE id = p_id AND tenant_company_id = p_tenant;
  SELECT ROW_COUNT() AS affected;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_crm_lead_delete;
DELIMITER //
CREATE PROCEDURE sp_crm_lead_delete(IN p_tenant INT, IN p_id INT)
BEGIN
  DELETE FROM leads WHERE id = p_id AND tenant_company_id = p_tenant;
  SELECT ROW_COUNT() AS affected;
END //
DELIMITER ;

-- Closure: mark a lead Closed or Cancelled
DROP PROCEDURE IF EXISTS sp_crm_lead_close;
DELIMITER //
CREATE PROCEDURE sp_crm_lead_close(IN p_tenant INT, IN p_id INT, IN p_closure_status VARCHAR(20))
BEGIN
  UPDATE leads SET
    closure_status = p_closure_status,
    status = CASE WHEN p_closure_status = 'Closed' THEN 'Closed'
                  WHEN p_closure_status = 'Cancelled' THEN 'Cancelled' ELSE status END,
    closed_at = CASE WHEN p_closure_status IN ('Closed','Cancelled') THEN NOW() ELSE NULL END
  WHERE id = p_id AND tenant_company_id = p_tenant;
  SELECT ROW_COUNT() AS affected;
END //
DELIMITER ;

-- ---------- FOLLOW-UPS ----------
DROP PROCEDURE IF EXISTS sp_crm_followup_list_by_lead;
DELIMITER //
CREATE PROCEDURE sp_crm_followup_list_by_lead(IN p_tenant INT, IN p_lead_id INT)
BEGIN
  SELECT * FROM followups
  WHERE tenant_company_id = p_tenant AND lead_id = p_lead_id
  ORDER BY followup_date DESC, id DESC;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_crm_followup_create;
DELIMITER //
CREATE PROCEDURE sp_crm_followup_create(
  IN p_tenant INT, IN p_lead_id INT, IN p_followup_date DATETIME, IN p_followup_type VARCHAR(50),
  IN p_activity VARCHAR(150), IN p_next_followup_date DATETIME, IN p_outcome VARCHAR(150),
  IN p_status VARCHAR(20), IN p_notes TEXT, IN p_assigned_to INT, IN p_created_by INT)
BEGIN
  INSERT INTO followups (tenant_company_id, lead_id, followup_date, followup_type, activity,
                         next_followup_date, outcome, status, notes, assigned_to, created_by)
  VALUES (p_tenant, p_lead_id, p_followup_date, p_followup_type, p_activity,
          p_next_followup_date, p_outcome, COALESCE(p_status,'Pending'), p_notes,
          NULLIF(p_assigned_to,0), NULLIF(p_created_by,0));
  SELECT LAST_INSERT_ID() AS id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_crm_followup_update;
DELIMITER //
CREATE PROCEDURE sp_crm_followup_update(
  IN p_tenant INT, IN p_id INT, IN p_followup_date DATETIME, IN p_followup_type VARCHAR(50),
  IN p_activity VARCHAR(150), IN p_next_followup_date DATETIME, IN p_outcome VARCHAR(150),
  IN p_status VARCHAR(20), IN p_notes TEXT)
BEGIN
  UPDATE followups SET
    followup_date = p_followup_date, followup_type = p_followup_type, activity = p_activity,
    next_followup_date = p_next_followup_date, outcome = p_outcome,
    status = COALESCE(p_status, status), notes = p_notes
  WHERE id = p_id AND tenant_company_id = p_tenant;
  SELECT ROW_COUNT() AS affected;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_crm_followup_delete;
DELIMITER //
CREATE PROCEDURE sp_crm_followup_delete(IN p_tenant INT, IN p_id INT)
BEGIN
  DELETE FROM followups WHERE id = p_id AND tenant_company_id = p_tenant;
  SELECT ROW_COUNT() AS affected;
END //
DELIMITER ;

-- ---------- REGISTRATION (on closure) ----------
DROP PROCEDURE IF EXISTS sp_crm_registration_upsert;
DELIMITER //
CREATE PROCEDURE sp_crm_registration_upsert(
  IN p_tenant INT, IN p_lead_id INT, IN p_registration_no VARCHAR(50), IN p_registration_date DATE,
  IN p_product_id INT, IN p_amount DECIMAL(15,2), IN p_payment_status VARCHAR(30),
  IN p_details TEXT, IN p_created_by INT)
BEGIN
  DECLARE v_id INT;
  SELECT id INTO v_id FROM lead_registrations WHERE lead_id = p_lead_id AND tenant_company_id = p_tenant LIMIT 1;
  IF v_id IS NULL THEN
    INSERT INTO lead_registrations (tenant_company_id, lead_id, registration_no, registration_date,
                                    product_id, amount, payment_status, details, created_by)
    VALUES (p_tenant, p_lead_id, p_registration_no, p_registration_date, NULLIF(p_product_id,0),
            p_amount, p_payment_status, p_details, NULLIF(p_created_by,0));
    SELECT LAST_INSERT_ID() AS id;
  ELSE
    UPDATE lead_registrations SET
      registration_no = p_registration_no, registration_date = p_registration_date,
      product_id = NULLIF(p_product_id,0), amount = p_amount, payment_status = p_payment_status, details = p_details
    WHERE id = v_id;
    SELECT v_id AS id;
  END IF;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_crm_registration_get;
DELIMITER //
CREATE PROCEDURE sp_crm_registration_get(IN p_tenant INT, IN p_lead_id INT)
BEGIN
  SELECT * FROM lead_registrations WHERE lead_id = p_lead_id AND tenant_company_id = p_tenant;
END //
DELIMITER ;

-- ---------- FEEDBACK (5-star on closed deals) ----------
DROP PROCEDURE IF EXISTS sp_crm_feedback_create;
DELIMITER //
CREATE PROCEDURE sp_crm_feedback_create(
  IN p_tenant INT, IN p_lead_id INT, IN p_rating TINYINT, IN p_feedback_text TEXT, IN p_created_by INT)
BEGIN
  INSERT INTO lead_feedback (tenant_company_id, lead_id, rating, feedback_text, created_by)
  VALUES (p_tenant, p_lead_id, p_rating, p_feedback_text, NULLIF(p_created_by,0));
  SELECT LAST_INSERT_ID() AS id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_crm_feedback_list;
DELIMITER //
CREATE PROCEDURE sp_crm_feedback_list(IN p_tenant INT, IN p_lead_id INT)
BEGIN
  SELECT * FROM lead_feedback WHERE lead_id = p_lead_id AND tenant_company_id = p_tenant ORDER BY created_at DESC;
END //
DELIMITER ;

-- ---------- REPORT (From/To date, Customer, Status, Closure status) ----------
DROP PROCEDURE IF EXISTS sp_crm_lead_report;
DELIMITER //
CREATE PROCEDURE sp_crm_lead_report(
  IN p_tenant INT, IN p_from DATE, IN p_to DATE, IN p_company_id INT,
  IN p_temperature VARCHAR(10), IN p_closure_status VARCHAR(20))
BEGIN
  SELECT l.id, l.lead_name, l.contact_name, l.phone, l.email, l.address, l.requirement,
         c.name AS company_name, l.temperature, l.status, l.closure_status, l.value,
         l.created_at, l.closed_at,
         (SELECT COUNT(*) FROM followups f WHERE f.lead_id = l.id) AS followup_count,
         (SELECT MAX(f.followup_date) FROM followups f WHERE f.lead_id = l.id) AS last_followup,
         r.registration_no, r.registration_date, r.amount AS registration_amount,
         (SELECT ROUND(AVG(fb.rating),1) FROM lead_feedback fb WHERE fb.lead_id = l.id) AS feedback_rating
  FROM leads l
  LEFT JOIN crm_companies c ON l.company_id = c.id
  LEFT JOIN lead_registrations r ON r.lead_id = l.id
  WHERE l.tenant_company_id = p_tenant
    AND (p_from IS NULL OR DATE(l.created_at) >= p_from)
    AND (p_to IS NULL OR DATE(l.created_at) <= p_to)
    AND (p_company_id IS NULL OR p_company_id = 0 OR l.company_id = p_company_id)
    AND (p_temperature IS NULL OR p_temperature = '' OR l.temperature = p_temperature)
    AND (p_closure_status IS NULL OR p_closure_status = '' OR l.closure_status = p_closure_status)
  ORDER BY l.created_at DESC;
END //
DELIMITER ;

-- ---------- ALL FOLLOW-UPS (global list joined with lead) ----------
DROP PROCEDURE IF EXISTS sp_crm_followup_list_all;
DELIMITER //
CREATE PROCEDURE sp_crm_followup_list_all(IN p_tenant INT)
BEGIN
  SELECT f.id, f.lead_id, f.followup_date, f.followup_type, f.activity, f.next_followup_date,
         f.outcome, f.status, f.notes, f.created_at,
         l.lead_name, l.contact_name, l.phone, l.temperature, l.closure_status,
         c.name AS company_name
  FROM followups f
  LEFT JOIN leads l ON f.lead_id = l.id
  LEFT JOIN crm_companies c ON l.company_id = c.id
  WHERE f.tenant_company_id = p_tenant
  ORDER BY (f.next_followup_date IS NULL), f.next_followup_date ASC, f.followup_date DESC;
END //
DELIMITER ;
