from aiomysql.connection import Connection
from aiomysql.cursors import DictCursor

# ─────────────────────────────────────────────
# ROLES & PERMISSIONS
# ─────────────────────────────────────────────

async def _build_matrix(conn: Connection, role_id: int) -> dict:
    async with conn.cursor(DictCursor) as cur:
        await cur.execute('''
            SELECT p.portal, p.screen 
            FROM role_permissions rp
            JOIN permissions p ON rp.permission_id = p.id
            WHERE rp.role_id = %s
        ''', (role_id,))
        rows = await cur.fetchall()
        
    matrix = {}
    for r in rows:
        portal = r['portal']
        screen = r['screen']
        if portal not in matrix:
            matrix[portal] = {}
        matrix[portal][screen] = True
    return matrix

async def _save_matrix(conn: Connection, role_id: int, matrix: dict):
    if not matrix:
        return
    
    async with conn.cursor(DictCursor) as cur:
        await cur.execute("DELETE FROM role_permissions WHERE role_id = %s", (role_id,))
        for portal, screens in matrix.items():
            for screen, is_enabled in screens.items():
                if is_enabled:
                    await cur.execute(
                        "SELECT id FROM permissions WHERE portal = %s AND screen = %s",
                        (portal, screen)
                    )
                    p = await cur.fetchone()
                    if not p:
                        await cur.execute(
                            "INSERT INTO permissions (portal, screen, description) VALUES (%s, %s, %s)",
                            (portal, screen, f"Access to {screen} in {portal}")
                        )
                        perm_id = cur.lastrowid
                    else:
                        perm_id = p['id']
                    await cur.execute(
                        "INSERT INTO role_permissions (role_id, permission_id) VALUES (%s, %s)",
                        (role_id, perm_id)
                    )

async def get_roles(conn: Connection) -> list:
    async with conn.cursor(DictCursor) as cur:
        await cur.execute("CALL sp_admin_get_roles()")
        roles = await cur.fetchall()
    for r in roles:
        r['matrix'] = await _build_matrix(conn, r['id'])
    return roles

async def get_role(conn: Connection, role_id: int) -> dict:
    async with conn.cursor(DictCursor) as cur:
        await cur.execute("CALL sp_admin_get_role(%s)", (role_id,))
        role = await cur.fetchone()
    if role:
        role['matrix'] = await _build_matrix(conn, role['id'])
    return role

async def create_role(conn: Connection, data: dict) -> int:
    matrix = data.pop('matrix', None)
    async with conn.cursor(DictCursor) as cur:
        await cur.execute(
            "CALL sp_admin_create_role(%s, %s, %s, %s)",
            (data.get('name'), data.get('description'), data.get('color'), data.get('is_active', 1))
        )
        row = await cur.fetchone()
        role_id = row['id']
    if matrix:
        await _save_matrix(conn, role_id, matrix)
    return role_id

async def update_role(conn: Connection, role_id: int, data: dict) -> bool:
    matrix = data.pop('matrix', None)
    if matrix is not None:
        await _save_matrix(conn, role_id, matrix)
    async with conn.cursor(DictCursor) as cur:
        await cur.execute(
            "CALL sp_admin_update_role(%s, %s, %s, %s, %s)",
            (role_id, data.get('name'), data.get('description'), data.get('color'), data.get('is_active'))
        )
    return True

async def delete_role(conn: Connection, role_id: int) -> bool:
    async with conn.cursor() as cur:
        await cur.execute("CALL sp_admin_delete_role(%s)", (role_id,))
        return True


# ─────────────────────────────────────────────
# USERS (Tenant Isolated)
# ─────────────────────────────────────────────

async def get_users(conn: Connection, tenant_id: int) -> list:
    async with conn.cursor(DictCursor) as cur:
        await cur.execute("CALL sp_admin_get_users(%s)", (tenant_id,))
        return await cur.fetchall()

async def get_user(conn: Connection, tenant_id: int, user_id: int) -> dict:
    async with conn.cursor(DictCursor) as cur:
        await cur.execute("CALL sp_admin_get_user(%s, %s)", (tenant_id, user_id))
        return await cur.fetchone()

async def get_user_by_email(conn: Connection, email: str) -> dict:
    async with conn.cursor(DictCursor) as cur:
        await cur.execute("CALL sp_admin_get_user_by_email(%s)", (email,))
        return await cur.fetchone()

async def get_user_by_username_or_email(conn: Connection, identifier: str) -> dict:
    async with conn.cursor(DictCursor) as cur:
        await cur.execute("CALL sp_admin_get_user_by_username_or_email(%s)", (identifier,))
        return await cur.fetchone()

async def create_user(conn: Connection, tenant_id: int, data: dict) -> int:
    async with conn.cursor(DictCursor) as cur:
        await cur.execute(
            "CALL sp_admin_create_user(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
            (
                tenant_id,
                data.get('name'),
                data.get('department'),
                data.get('designation'),
                data.get('joining_date'),
                data.get('username'),
                data.get('email'),
                data.get('mobile'),
                data.get('password_hash'),
                data.get('role_id'),
                data.get('status', 'Active'),
                data.get('color'),
                data.get('profile_pic'),
                data.get('signature_url'),
                data.get('is_active', 1)
            )
        )
        row = await cur.fetchone()
        return row['id']

async def update_user(conn: Connection, tenant_id: int, user_id: int, data: dict) -> bool:
    async with conn.cursor(DictCursor) as cur:
        await cur.execute(
            "CALL sp_admin_update_user(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
            (
                user_id,
                tenant_id,
                data.get('name'),
                data.get('department'),
                data.get('designation'),
                data.get('joining_date'),
                data.get('username'),
                data.get('email'),
                data.get('mobile'),
                data.get('password_hash'),
                data.get('role_id'),
                data.get('status'),
                data.get('color'),
                data.get('profile_pic'),
                data.get('signature_url'),
                data.get('is_active')
            )
        )
        row = await cur.fetchone()
        return bool(row and row.get('updated'))

async def delete_user(conn: Connection, tenant_id: int, user_id: int) -> bool:
    async with conn.cursor() as cur:
        await cur.execute("CALL sp_admin_delete_user(%s, %s)", (tenant_id, user_id))
        return True


# ─────────────────────────────────────────────
# TENANT COMPANIES (Admin_crm.companies)
# ─────────────────────────────────────────────

async def get_companies(conn: Connection) -> list:
    async with conn.cursor(DictCursor) as cur:
        await cur.execute("CALL sp_admin_get_companies()")
        return await cur.fetchall()

async def get_user_count_for_company(conn: Connection, tenant_id: int) -> int:
    async with conn.cursor(DictCursor) as cur:
        await cur.execute("CALL sp_admin_get_user_count_for_company(%s)", (tenant_id,))
        row = await cur.fetchone()
        return row['count'] if row else 0

async def get_company(conn: Connection, company_id: int) -> dict:
    async with conn.cursor(DictCursor) as cur:
        await cur.execute("CALL sp_admin_get_company(%s)", (company_id,))
        return await cur.fetchone()

async def create_company(conn: Connection, data: dict) -> int:
    async with conn.cursor(DictCursor) as cur:
        await cur.execute(
            "CALL sp_admin_create_company(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
            (
                data.get('name'),
                data.get('industry_id'),
                data.get('type_id'),
                data.get('founder'),
                data.get('address'),
                data.get('city_id'),
                data.get('state_id'),
                data.get('country_id'),
                data.get('remarks'),
                data.get('contact_name'),
                data.get('contact_email'),
                data.get('contact_mobile'),
                data.get('contact_designation'),
                data.get('logo_url'),
                data.get('status', 'Active'),
                data.get('is_active', 1),
                data.get('max_users', 1)
            )
        )
        row = await cur.fetchone()
        return row['id']

async def update_company(conn: Connection, company_id: int, data: dict) -> bool:
    async with conn.cursor(DictCursor) as cur:
        await cur.execute(
            "CALL sp_admin_update_company(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
            (
                company_id,
                data.get('name'),
                data.get('industry_id'),
                data.get('type_id'),
                data.get('founder'),
                data.get('address'),
                data.get('city_id'),
                data.get('state_id'),
                data.get('country_id'),
                data.get('remarks'),
                data.get('contact_name'),
                data.get('contact_email'),
                data.get('contact_mobile'),
                data.get('contact_designation'),
                data.get('logo_url'),
                data.get('status'),
                data.get('is_active'),
                data.get('max_users')
            )
        )
        row = await cur.fetchone()
        return bool(row and row.get('updated'))

async def delete_company(conn: Connection, company_id: int) -> bool:
    async with conn.cursor() as cur:
        await cur.execute("CALL sp_admin_delete_company(%s)", (company_id,))
        return True
