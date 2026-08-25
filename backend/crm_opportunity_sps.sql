-- ============================================================
-- CRM opportunity stored procedures (tenant-scoped)
-- Stages: Qualification -> Requirement -> Demo -> Proposal -> Won / Lost
-- ============================================================
USE crm;

DROP PROCEDURE IF EXISTS sp_crm_opportunity_list;
DELIMITER //
CREATE PROCEDURE sp_crm_opportunity_list(IN p_tenant INT)
BEGIN
  SELECT o.*, c.name AS company_name, l.lead_name
  FROM opportunities o
  LEFT JOIN crm_companies c ON o.company_id = c.id
  LEFT JOIN leads l ON o.lead_id = l.id
  WHERE o.tenant_company_id = p_tenant
  ORDER BY o.created_at DESC;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_crm_opportunity_get;
DELIMITER //
CREATE PROCEDURE sp_crm_opportunity_get(IN p_tenant INT, IN p_id INT)
BEGIN
  SELECT o.*, c.name AS company_name, c.industry AS company_industry, c.city AS company_city,
         l.lead_name, l.contact_name, l.phone AS lead_phone, l.temperature AS lead_temperature
  FROM opportunities o
  LEFT JOIN crm_companies c ON o.company_id = c.id
  LEFT JOIN leads l ON o.lead_id = l.id
  WHERE o.id = p_id AND o.tenant_company_id = p_tenant;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_crm_opportunity_create;
DELIMITER //
CREATE PROCEDURE sp_crm_opportunity_create(
  IN p_tenant INT, IN p_lead_id INT, IN p_company_id INT, IN p_name VARCHAR(150),
  IN p_description TEXT, IN p_value DECIMAL(15,2), IN p_stage VARCHAR(50), IN p_probability INT,
  IN p_expected_close_date DATE, IN p_assigned_to INT, IN p_created_by INT, IN p_status VARCHAR(20))
BEGIN
  INSERT INTO opportunities (tenant_company_id, lead_id, company_id, name, description, value, stage,
                             probability, expected_close_date, assigned_to, created_by, status)
  VALUES (p_tenant, NULLIF(p_lead_id,0), NULLIF(p_company_id,0), p_name, p_description, p_value,
          COALESCE(NULLIF(p_stage,''),'Qualification'), p_probability, p_expected_close_date,
          NULLIF(p_assigned_to,0), NULLIF(p_created_by,0), COALESCE(NULLIF(p_status,''),'ACTIVE'));
  SELECT LAST_INSERT_ID() AS id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_crm_opportunity_update;
DELIMITER //
CREATE PROCEDURE sp_crm_opportunity_update(
  IN p_tenant INT, IN p_id INT, IN p_company_id INT, IN p_name VARCHAR(150),
  IN p_description TEXT, IN p_value DECIMAL(15,2), IN p_stage VARCHAR(50), IN p_probability INT,
  IN p_expected_close_date DATE, IN p_assigned_to INT, IN p_status VARCHAR(20))
BEGIN
  UPDATE opportunities SET
    company_id = NULLIF(p_company_id,0), name = COALESCE(p_name, name), description = p_description,
    value = p_value, stage = COALESCE(NULLIF(p_stage,''), stage), probability = p_probability,
    expected_close_date = p_expected_close_date, assigned_to = NULLIF(p_assigned_to,0),
    status = COALESCE(NULLIF(p_status,''), status)
  WHERE id = p_id AND tenant_company_id = p_tenant;
  SELECT ROW_COUNT() AS affected;
END //
DELIMITER ;

-- Advance/set stage; auto-set status + probability for Won/Lost
DROP PROCEDURE IF EXISTS sp_crm_opportunity_set_stage;
DELIMITER //
CREATE PROCEDURE sp_crm_opportunity_set_stage(IN p_tenant INT, IN p_id INT, IN p_stage VARCHAR(50), IN p_probability INT)
BEGIN
  UPDATE opportunities SET
    stage = p_stage,
    probability = CASE WHEN p_stage = 'Won' THEN 100 WHEN p_stage = 'Lost' THEN 0
                       WHEN p_probability IS NOT NULL THEN p_probability ELSE probability END,
    status = CASE WHEN p_stage = 'Won' THEN 'WON' WHEN p_stage = 'Lost' THEN 'LOST' ELSE 'ACTIVE' END
  WHERE id = p_id AND tenant_company_id = p_tenant;
  SELECT ROW_COUNT() AS affected;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_crm_opportunity_delete;
DELIMITER //
CREATE PROCEDURE sp_crm_opportunity_delete(IN p_tenant INT, IN p_id INT)
BEGIN
  DELETE FROM opportunities WHERE id = p_id AND tenant_company_id = p_tenant;
  SELECT ROW_COUNT() AS affected;
END //
DELIMITER ;
