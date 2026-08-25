from fastapi import APIRouter, Depends, HTTPException, status as http_status
from typing import List, Optional
from aiomysql.connection import Connection
from app.core.database import get_admin_db
from app.core.dependencies import get_current_user
from app.repositories import admin_repo
from app.schemas import admin_schema
from app.core.security import get_password_hash

router = APIRouter()


# ─────────────────────────────────────────────
# HELPER
# ─────────────────────────────────────────────

def _tenant_id(current_user: dict) -> int:
    """Extract tenant_id from the JWT payload."""
    return current_user.get("tenant_company_id", 1)


# ─────────────────────────────────────────────
# ROLES
# ─────────────────────────────────────────────

@router.get("/roles")
async def get_roles(
    db: Connection = Depends(get_admin_db),
    current_user: dict = Depends(get_current_user)
):
    roles = await admin_repo.get_roles(db)
    return {"success": True, "data": roles}

@router.get("/roles/{role_id}")
async def get_role(
    role_id: int,
    db: Connection = Depends(get_admin_db),
    current_user: dict = Depends(get_current_user)
):
    role = await admin_repo.get_role(db, role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return {"success": True, "data": role}

@router.post("/roles", status_code=201)
async def create_role(
    payload: admin_schema.RoleCreate,
    db: Connection = Depends(get_admin_db),
    current_user: dict = Depends(get_current_user)
):
    role_id = await admin_repo.create_role(db, payload.dict())
    return {"success": True, "message": "Role created successfully", "data": {"id": role_id}}

@router.put("/roles/{role_id}")
async def update_role(
    role_id: int,
    payload: admin_schema.RoleUpdate,
    db: Connection = Depends(get_admin_db),
    current_user: dict = Depends(get_current_user)
):
    existing = await admin_repo.get_role(db, role_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Role not found")
    await admin_repo.update_role(db, role_id, payload.dict(exclude_unset=True))
    return {"success": True, "message": "Role updated successfully"}

@router.delete("/roles/{role_id}")
async def delete_role(
    role_id: int,
    db: Connection = Depends(get_admin_db),
    current_user: dict = Depends(get_current_user)
):
    existing = await admin_repo.get_role(db, role_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Role not found")
    await admin_repo.delete_role(db, role_id)
    return {"success": True, "message": "Role deleted successfully"}


# ─────────────────────────────────────────────
# USERS (Tenant Isolated)
# ─────────────────────────────────────────────

@router.get("/users")
async def get_users(
    db: Connection = Depends(get_admin_db),
    current_user: dict = Depends(get_current_user)
):
    tenant_id = _tenant_id(current_user)
    users = await admin_repo.get_users(db, tenant_id)
    return {"success": True, "data": users}

@router.get("/users/{user_id}")
async def get_user(
    user_id: int,
    db: Connection = Depends(get_admin_db),
    current_user: dict = Depends(get_current_user)
):
    tenant_id = _tenant_id(current_user)
    user = await admin_repo.get_user(db, tenant_id, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"success": True, "data": user}

@router.post("/users", status_code=201)
async def create_user(
    payload: admin_schema.UserCreate,
    db: Connection = Depends(get_admin_db),
    current_user: dict = Depends(get_current_user)
):
    tenant_id = _tenant_id(current_user)

    # Prevent duplicate email
    existing = await admin_repo.get_user_by_email(db, payload.email)
    if existing:
        raise HTTPException(status_code=409, detail="A user with this email already exists")

    data = payload.dict()
    password = data.pop("password")
    data["password_hash"] = get_password_hash(password)

    user_id = await admin_repo.create_user(db, tenant_id, data)
    return {"success": True, "message": "User created successfully", "data": {"id": user_id}}

@router.put("/users/{user_id}")
async def update_user(
    user_id: int,
    payload: admin_schema.UserUpdate,
    db: Connection = Depends(get_admin_db),
    current_user: dict = Depends(get_current_user)
):
    tenant_id = _tenant_id(current_user)
    data = payload.dict(exclude_unset=True)

    if "password" in data and data["password"]:
        data["password_hash"] = get_password_hash(data.pop("password"))
    elif "password" in data:
        data.pop("password")

    success = await admin_repo.update_user(db, tenant_id, user_id, data)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"success": True, "message": "User updated successfully"}

@router.patch("/users/{user_id}/status")
async def update_user_status(
    user_id: int,
    payload: dict,
    db: Connection = Depends(get_admin_db),
    current_user: dict = Depends(get_current_user)
):
    tenant_id = _tenant_id(current_user)
    new_status = payload.get("status")
    if not new_status:
        raise HTTPException(status_code=400, detail="status field is required")
    success = await admin_repo.update_user(db, tenant_id, user_id, {"status": new_status})
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"success": True, "message": "Status updated successfully"}

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    db: Connection = Depends(get_admin_db),
    current_user: dict = Depends(get_current_user)
):
    tenant_id = _tenant_id(current_user)
    success = await admin_repo.delete_user(db, tenant_id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"success": True, "message": "User deleted successfully"}


# ─────────────────────────────────────────────
# DASHBOARD & AUDIT LOGS
# ─────────────────────────────────────────────

@router.get("/dashboard")
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

@router.get("/audit-logs")
async def get_audit_logs(
    page_size: int = 5,
    db: Connection = Depends(get_admin_db),
    current_user: dict = Depends(get_current_user)
):
    # Placeholder — audit_logs table not yet in schema
    return {
        "success": True,
        "data": {
            "items": []
        }
    }


# ─────────────────────────────────────────────
# TENANT COMPANIES
# ─────────────────────────────────────────────

@router.get("/companies")
async def get_companies(
    db: Connection = Depends(get_admin_db)
):
    """Returns all tenant companies. Wrapped in standard {success, data} format."""
    companies = await admin_repo.get_companies(db)
    return {"success": True, "data": companies}

@router.get("/companies/{company_id}")
async def get_company(
    company_id: int,
    db: Connection = Depends(get_admin_db)
):
    company = await admin_repo.get_company(db, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return {"success": True, "data": company}

@router.post("/companies", status_code=201)
async def create_company(
    data: admin_schema.CompanyCreate,
    db: Connection = Depends(get_admin_db)
):
    record_id = await admin_repo.create_company(db, data.dict(exclude_none=True))
    return {"success": True, "message": "Company created successfully", "data": {"id": record_id}}

@router.put("/companies/{company_id}")
async def update_company(
    company_id: int,
    data: admin_schema.CompanyUpdate,
    db: Connection = Depends(get_admin_db)
):
    success = await admin_repo.update_company(db, company_id, data.dict(exclude_unset=True))
    if not success:
        raise HTTPException(status_code=404, detail="Company not found")
    return {"success": True, "message": "Company updated successfully"}

@router.delete("/companies/{company_id}")
async def delete_company(
    company_id: int,
    db: Connection = Depends(get_admin_db)
):
    success = await admin_repo.delete_company(db, company_id)
    if not success:
        raise HTTPException(status_code=404, detail="Company not found")
    return {"success": True, "message": "Company deleted successfully"}
