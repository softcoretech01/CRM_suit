"""
routers/admin/dashboard.py
--------------------------
Admin dashboard summary and audit log endpoints under /api/admin/
"""
from fastapi import APIRouter, Depends
from aiomysql.connection import Connection
from app.core.database import get_admin_db
from app.core.dependencies import get_current_user

router = APIRouter(tags=["Admin — Dashboard"])


def _tenant_id(current_user: dict) -> int:
    return current_user.get("tenant_company_id", 1)


@router.get("/dashboard", summary="Admin dashboard summary")
async def get_admin_dashboard(
    db: Connection = Depends(get_admin_db),
    current_user: dict = Depends(get_current_user)
):
    tenant_id = _tenant_id(current_user)
    async with db.cursor() as cur:
        await cur.execute(
            "SELECT COUNT(*) FROM users WHERE tenant_company_id = %s AND is_active = 1",
            (tenant_id,)
        )
        total_users = (await cur.fetchone())[0]

        await cur.execute(
            "SELECT COUNT(*) FROM users WHERE tenant_company_id = %s AND status = 'Active' AND is_active = 1",
            (tenant_id,)
        )
        active_users = (await cur.fetchone())[0]

        await cur.execute("SELECT COUNT(*) FROM roles WHERE is_active = 1")
        total_roles = (await cur.fetchone())[0]

    return {
        "success": True,
        "data": {
            "total_users": total_users,
            "active_users": active_users,
            "active_roles": total_roles,
            "system_alerts": 0,
            "avg_uptime": 99.98
        }
    }


@router.get("/audit-logs", summary="Admin audit log entries")
async def get_audit_logs(
    page_size: int = 5,
    db: Connection = Depends(get_admin_db),
    current_user: dict = Depends(get_current_user)
):
    # Placeholder — audit_logs table not yet in schema
    return {
        "success": True,
        "data": {"items": []}
    }
