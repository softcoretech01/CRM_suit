import os

tables = {
    'company_types': [('name', 'VARCHAR(100)'), ('is_active', 'BOOLEAN')],
    'industries': [('code', 'VARCHAR(50)'), ('name', 'VARCHAR(100)'), ('description', 'TEXT'), ('is_active', 'BOOLEAN')],
    'product_categories': [('name', 'VARCHAR(100)'), ('description', 'TEXT'), ('is_active', 'BOOLEAN')],
    'countries': [('code', 'VARCHAR(10)'), ('name', 'VARCHAR(100)'), ('is_active', 'BOOLEAN')],
    'states': [('country_id', 'INT'), ('code', 'VARCHAR(10)'), ('name', 'VARCHAR(100)'), ('is_active', 'BOOLEAN')],
    'cities': [('state_id', 'INT'), ('name', 'VARCHAR(100)'), ('is_active', 'BOOLEAN')],
    'lead_sources': [('code', 'VARCHAR(50)'), ('name', 'VARCHAR(100)'), ('is_active', 'BOOLEAN')],
    'lead_statuses': [('name', 'VARCHAR(100)'), ('color_code', 'VARCHAR(10)'), ('sort_order', 'INT'), ('is_active', 'BOOLEAN')],
    'campaigns': [('name', 'VARCHAR(150)'), ('type', 'VARCHAR(50)'), ('start_date', 'DATE'), ('end_date', 'DATE'), ('is_active', 'BOOLEAN')],
    'activity_types': [('name', 'VARCHAR(100)'), ('color_code', 'VARCHAR(10)'), ('icon', 'VARCHAR(50)'), ('is_active', 'BOOLEAN')],
    'priorities': [('name', 'VARCHAR(100)'), ('color_code', 'VARCHAR(10)'), ('sort_order', 'INT'), ('is_active', 'BOOLEAN')],
    'next_actions': [('name', 'VARCHAR(100)'), ('color_code', 'VARCHAR(10)'), ('sort_order', 'INT'), ('is_active', 'BOOLEAN')],
}

sql = ["USE Masters_crm;\n"]

for table, cols in tables.items():
    sql.append(f"-- ==========================================")
    sql.append(f"-- {table.upper()}")
    sql.append(f"-- ==========================================\n")
    
    # GET ALL
    sql.append(f"DROP PROCEDURE IF EXISTS sp_get_{table};")
    sql.append("DELIMITER //")
    sql.append(f"CREATE PROCEDURE sp_get_{table}()")
    sql.append("BEGIN")
    sql.append(f"    SELECT * FROM {table} ORDER BY id ASC;")
    sql.append("END //")
    sql.append("DELIMITER ;\n")
    
    # GET BY ID
    sql.append(f"DROP PROCEDURE IF EXISTS sp_get_{table}_by_id;")
    sql.append("DELIMITER //")
    sql.append(f"CREATE PROCEDURE sp_get_{table}_by_id(IN p_id INT)")
    sql.append("BEGIN")
    sql.append(f"    SELECT * FROM {table} WHERE id = p_id LIMIT 1;")
    sql.append("END //")
    sql.append("DELIMITER ;\n")
    
    # CREATE
    params = ",\n    ".join([f"IN p_{col} {typ}" for col, typ in cols])
    col_names = ", ".join([col for col, typ in cols])
    col_vals = ", ".join([f"COALESCE(p_{col}, 1)" if col == 'is_active' else f"p_{col}" for col, typ in cols])
    
    sql.append(f"DROP PROCEDURE IF EXISTS sp_create_{table};")
    sql.append("DELIMITER //")
    sql.append(f"CREATE PROCEDURE sp_create_{table}(\n    {params}\n)")
    sql.append("BEGIN")
    sql.append(f"    INSERT INTO {table} ({col_names}) VALUES ({col_vals});")
    sql.append("    SELECT LAST_INSERT_ID() as id;")
    sql.append("END //")
    sql.append("DELIMITER ;\n")
    
    # UPDATE
    update_params = ",\n    ".join([f"IN p_id INT", params])
    update_sets = ",\n        ".join([f"{col} = COALESCE(p_{col}, {col})" for col, typ in cols])
    
    sql.append(f"DROP PROCEDURE IF EXISTS sp_update_{table};")
    sql.append("DELIMITER //")
    sql.append(f"CREATE PROCEDURE sp_update_{table}(\n    {update_params}\n)")
    sql.append("BEGIN")
    sql.append(f"    UPDATE {table} \n    SET {update_sets} \n    WHERE id = p_id;")
    sql.append("END //")
    sql.append("DELIMITER ;\n")
    
    # DELETE
    sql.append(f"DROP PROCEDURE IF EXISTS sp_delete_{table};")
    sql.append("DELIMITER //")
    sql.append(f"CREATE PROCEDURE sp_delete_{table}(IN p_id INT)")
    sql.append("BEGIN")
    sql.append(f"    DELETE FROM {table} WHERE id = p_id;")
    sql.append("END //")
    sql.append("DELIMITER ;\n")

# Custom SP for States with Country
sql.append(f"DROP PROCEDURE IF EXISTS sp_get_states_with_country;")
sql.append("DELIMITER //")
sql.append(f"CREATE PROCEDURE sp_get_states_with_country()")
sql.append("BEGIN")
sql.append("    SELECT s.*, c.name as country_name FROM states s LEFT JOIN countries c ON s.country_id = c.id ORDER BY s.id ASC;")
sql.append("END //")
sql.append("DELIMITER ;\n")

# Custom SP for Cities with State
sql.append(f"DROP PROCEDURE IF EXISTS sp_get_cities_with_state;")
sql.append("DELIMITER //")
sql.append(f"CREATE PROCEDURE sp_get_cities_with_state()")
sql.append("BEGIN")
sql.append("    SELECT c.*, s.name as state_name, cou.name as country_name FROM cities c LEFT JOIN states s ON c.state_id = s.id LEFT JOIN countries cou ON s.country_id = cou.id ORDER BY c.id ASC;")
sql.append("END //")
sql.append("DELIMITER ;\n")

with open(r'd:\CRM\backend\masters_sps.sql', 'w') as f:
    f.write("\n".join(sql))

print("Generated masters_sps.sql")
