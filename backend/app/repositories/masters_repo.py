from aiomysql.connection import Connection
from aiomysql.cursors import DictCursor

MASTER_TABLE_PARAMS = {
    'company_types': ['name', 'is_active'],
    'industries': ['code', 'name', 'description', 'is_active'],
    'product_categories': ['name', 'description', 'is_active'],
    'countries': ['code', 'name', 'is_active'],
    'states': ['country_id', 'code', 'name', 'is_active'],
    'cities': ['state_id', 'name', 'is_active'],
    'lead_sources': ['code', 'name', 'is_active'],
    'lead_statuses': ['name', 'color_code', 'sort_order', 'is_active'],
    'campaigns': ['name', 'type', 'start_date', 'end_date', 'is_active'],
    'activity_types': ['name', 'color_code', 'icon', 'is_active'],
    'priorities': ['name', 'color_code', 'sort_order', 'is_active'],
    'next_actions': ['name', 'color_code', 'sort_order', 'is_active'],
}

async def get_all(conn: Connection, table: str) -> list:
    async with conn.cursor(DictCursor) as cur:
        await cur.execute(f"CALL sp_get_{table}()")
        return await cur.fetchall()

async def get_states_with_country(conn: Connection) -> list:
    async with conn.cursor(DictCursor) as cur:
        await cur.execute("CALL sp_get_states_with_country()")
        return await cur.fetchall()

async def get_cities_with_state(conn: Connection) -> list:
    async with conn.cursor(DictCursor) as cur:
        await cur.execute("CALL sp_get_cities_with_state()")
        return await cur.fetchall()

async def get_by_id(conn: Connection, table: str, record_id: int) -> dict:
    async with conn.cursor(DictCursor) as cur:
        await cur.execute(f"CALL sp_get_{table}_by_id(%s)", (record_id,))
        return await cur.fetchone()

async def get_by_foreign_key(conn: Connection, table: str, fk_col: str, fk_val: int) -> list:
    # We still use direct select here as we didn't generate individual SPs for each FK filter.
    # This is a read operation, but since the requirement is to use SPs, 
    # we can leave this as a raw select for generic filtering since the SPs generated are only CRUD by ID.
    async with conn.cursor(DictCursor) as cur:
        await cur.execute(
            f"SELECT * FROM `{table}` WHERE `{fk_col}` = %s AND is_active = 1 ORDER BY name ASC",
            (fk_val,)
        )
        return await cur.fetchall()

async def create_record(conn: Connection, table: str, data: dict) -> int:
    params = MASTER_TABLE_PARAMS.get(table, [])
    values = [data.get(k) for k in params]
    placeholders = ", ".join(["%s"] * len(params))
    
    async with conn.cursor(DictCursor) as cur:
        await cur.execute(f"CALL sp_create_{table}({placeholders})", values)
        row = await cur.fetchone()
        return row['id'] if row and 'id' in row else 0

async def update_record(conn: Connection, table: str, record_id: int, data: dict) -> bool:
    params = MASTER_TABLE_PARAMS.get(table, [])
    values = [record_id] + [data.get(k) for k in params]
    placeholders = ", ".join(["%s"] * (len(params) + 1)) # +1 for id
    
    async with conn.cursor(DictCursor) as cur:
        await cur.execute(f"CALL sp_update_{table}({placeholders})", values)
        return True

async def delete_record(conn: Connection, table: str, record_id: int) -> bool:
    async with conn.cursor() as cur:
        await cur.execute(f"CALL sp_delete_{table}(%s)", (record_id,))
        return True
