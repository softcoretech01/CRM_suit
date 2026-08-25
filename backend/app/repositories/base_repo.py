from typing import List, Optional, Any, Tuple

def build_update_query(table: str, data: dict, conditions: dict) -> Tuple[str, List[Any]]:
    """Builds a parameterized UPDATE query."""
    set_clauses = []
    values = []
    
    for k, v in data.items():
        if v is not None:
            set_clauses.append(f"`{k}` = %s")
            values.append(v)
            
    if not set_clauses:
        return "", []
        
    query = f"UPDATE `{table}` SET " + ", ".join(set_clauses)
    
    where_clauses = []
    for k, v in conditions.items():
        where_clauses.append(f"`{k}` = %s")
        values.append(v)
        
    if where_clauses:
        query += " WHERE " + " AND ".join(where_clauses)
        
    return query, values

def build_insert_query(table: str, data: dict) -> Tuple[str, List[Any]]:
    """Builds a parameterized INSERT query."""
    keys = []
    values = []
    placeholders = []
    
    for k, v in data.items():
        if v is not None:
            keys.append(f"`{k}`")
            values.append(v)
            placeholders.append("%s")
            
    query = f"INSERT INTO `{table}` ({', '.join(keys)}) VALUES ({', '.join(placeholders)})"
    return query, values
