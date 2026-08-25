from aiomysql.connection import Connection
from aiomysql.cursors import DictCursor
from app.repositories.base_repo import build_insert_query, build_update_query


async def call_sp(conn: Connection, name: str, args: tuple = ()) -> list:
    """CALL a stored procedure and return its result-set rows as dicts."""
    placeholders = ", ".join(["%s"] * len(args))
    async with conn.cursor(DictCursor) as cur:
        await cur.execute(f"CALL {name}({placeholders})", args)
        try:
            return await cur.fetchall()
        except Exception:
            return []


async def call_sp_scalar(conn: Connection, name: str, args: tuple = (), key: str = "id"):
    """CALL a stored procedure that returns a single value (e.g. new id / affected)."""
    rows = await call_sp(conn, name, args)
    if rows:
        row = rows[0]
        return row.get(key) if key in row else next(iter(row.values()), None)
    return None


async def get_crm_records(conn: Connection, table: str, tenant_id: int) -> list:
    async with conn.cursor(DictCursor) as cur:
        await cur.execute(
            f"SELECT * FROM `{table}` WHERE tenant_company_id = %s ORDER BY created_at DESC",
            (tenant_id,)
        )
        return await cur.fetchall()


async def get_crm_record_by_id(conn: Connection, table: str, tenant_id: int, record_id: int) -> dict:
    """Fetch a single record by ID, scoped to the tenant."""
    async with conn.cursor(DictCursor) as cur:
        await cur.execute(
            f"SELECT * FROM `{table}` WHERE id = %s AND tenant_company_id = %s LIMIT 1",
            (record_id, tenant_id)
        )
        return await cur.fetchone()


async def create_crm_record(conn: Connection, table: str, tenant_id: int, data: dict) -> int:
    data['tenant_company_id'] = tenant_id
    query, values = build_insert_query(table, data)
    async with conn.cursor() as cur:
        await cur.execute(query, values)
        return cur.lastrowid


async def update_crm_record(conn: Connection, table: str, tenant_id: int, record_id: int, data: dict) -> bool:
    """Update a record. Returns False only if the record does not exist — not when there are no columns to update."""
    # Check existence first
    async with conn.cursor() as cur:
        await cur.execute(
            f"SELECT id FROM `{table}` WHERE id = %s AND tenant_company_id = %s LIMIT 1",
            (record_id, tenant_id)
        )
        if not await cur.fetchone():
            return False  # Genuine 404

    query, values = build_update_query(table, data, {"id": record_id, "tenant_company_id": tenant_id})
    if not query:
        return True  # Nothing to update, but record exists — success

    async with conn.cursor() as cur:
        await cur.execute(query, values)
        return True


async def delete_crm_record(conn: Connection, table: str, tenant_id: int, record_id: int) -> bool:
    async with conn.cursor() as cur:
        await cur.execute(
            f"DELETE FROM `{table}` WHERE id = %s AND tenant_company_id = %s",
            (record_id, tenant_id)
        )
        return cur.rowcount > 0
