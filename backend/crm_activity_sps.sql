-- ============================================================
-- CRM activity stored procedures (tenant-scoped)
-- ============================================================
USE crm;

DROP PROCEDURE IF EXISTS sp_crm_activity_list;
DELIMITER //
CREATE PROCEDURE sp_crm_activity_list(IN p_tenant INT)
BEGIN
  SELECT a.*, l.lead_name, comp.name AS company_name,
         CONCAT_WS(' ', ctc.first_name, ctc.last_name) AS contact_full_name
  FROM activities a
  LEFT JOIN leads l ON a.lead_id = l.id
  LEFT JOIN crm_companies comp ON a.company_id = comp.id
  LEFT JOIN contacts ctc ON a.contact_id = ctc.id
  WHERE a.tenant_company_id = p_tenant
  ORDER BY a.activity_datetime DESC, a.id DESC;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_crm_activity_get;
DELIMITER //
CREATE PROCEDURE sp_crm_activity_get(IN p_tenant INT, IN p_id INT)
BEGIN
  SELECT a.*, l.lead_name, comp.name AS company_name,
         CONCAT_WS(' ', ctc.first_name, ctc.last_name) AS contact_full_name
  FROM activities a
  LEFT JOIN leads l ON a.lead_id = l.id
  LEFT JOIN crm_companies comp ON a.company_id = comp.id
  LEFT JOIN contacts ctc ON a.contact_id = ctc.id
  WHERE a.id = p_id AND a.tenant_company_id = p_tenant;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_crm_activity_create;
DELIMITER //
CREATE PROCEDURE sp_crm_activity_create(
  IN p_tenant INT, IN p_lead_id INT, IN p_company_id INT, IN p_contact_id INT,
  IN p_activity_type VARCHAR(50), IN p_subject VARCHAR(200), IN p_activity_datetime DATETIME,
  IN p_duration INT, IN p_outcome VARCHAR(50), IN p_next_action VARCHAR(50),
  IN p_status VARCHAR(20), IN p_notes TEXT, IN p_assigned_to INT, IN p_created_by INT)
BEGIN
  INSERT INTO activities (tenant_company_id, lead_id, company_id, contact_id, activity_type, subject,
                          activity_datetime, duration, outcome, next_action, status, notes, assigned_to, created_by)
  VALUES (p_tenant, NULLIF(p_lead_id,0), NULLIF(p_company_id,0), NULLIF(p_contact_id,0), p_activity_type,
          p_subject, p_activity_datetime, p_duration, p_outcome, p_next_action,
          COALESCE(p_status,'Completed'), p_notes, NULLIF(p_assigned_to,0), NULLIF(p_created_by,0));
  SELECT LAST_INSERT_ID() AS id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_crm_activity_update;
DELIMITER //
CREATE PROCEDURE sp_crm_activity_update(
  IN p_tenant INT, IN p_id INT, IN p_lead_id INT, IN p_company_id INT, IN p_contact_id INT,
  IN p_activity_type VARCHAR(50), IN p_subject VARCHAR(200), IN p_activity_datetime DATETIME,
  IN p_duration INT, IN p_outcome VARCHAR(50), IN p_next_action VARCHAR(50),
  IN p_status VARCHAR(20), IN p_notes TEXT)
BEGIN
  UPDATE activities SET
    lead_id = NULLIF(p_lead_id,0), company_id = NULLIF(p_company_id,0), contact_id = NULLIF(p_contact_id,0),
    activity_type = p_activity_type, subject = COALESCE(p_subject, subject), activity_datetime = p_activity_datetime,
    duration = p_duration, outcome = p_outcome, next_action = p_next_action,
    status = COALESCE(p_status, status), notes = p_notes
  WHERE id = p_id AND tenant_company_id = p_tenant;
  SELECT ROW_COUNT() AS affected;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_crm_activity_delete;
DELIMITER //
CREATE PROCEDURE sp_crm_activity_delete(IN p_tenant INT, IN p_id INT)
BEGIN
  DELETE FROM activities WHERE id = p_id AND tenant_company_id = p_tenant;
  SELECT ROW_COUNT() AS affected;
END //
DELIMITER ;
