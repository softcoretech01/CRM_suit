from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.database import db

# Auth
from app.routers import auth

# Admin sub-routers (one per resource)
from app.routers.admin import roles as admin_roles
from app.routers.admin import users as admin_users
from app.routers.admin import companies as admin_companies
from app.routers.admin import dashboard as admin_dashboard

# CRM router
from app.routers import crm_router

# Masters sub-routers
from app.routers.masters import dashboard as masters_dashboard
from app.routers.masters import geography as masters_geography
from app.routers.masters import general as masters_general
from app.routers.masters import sales as masters_sales


@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.connect()
    
    # Seed fallback roles if none exist (other than Super Admin)
    try:
        async with db.admin_pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("SELECT count(*) FROM roles")
                count = await cur.fetchone()
                if count and count[0] <= 1:
                    from app.repositories import admin_repo
                    fallback_roles = [
                        {"name": "Administrator", "description": "Full system access", "color": "#dc2626", "is_active": 1},
                        {"name": "CEO", "description": "Executive access", "color": "#7c3aed", "is_active": 1},
                        {"name": "Sales Manager", "description": "Manage team", "color": "#16a34a", "is_active": 1},
                        {"name": "Sales Executive", "description": "Manage own leads", "color": "#2563eb", "is_active": 1},
                        {"name": "Marketing", "description": "Marketing data", "color": "#0891b2", "is_active": 1},
                        {"name": "Support", "description": "Customer support", "color": "#d97706", "is_active": 1},
                        {"name": "Accounts", "description": "Financial reports", "color": "#be185d", "is_active": 1},
                        {"name": "Read Only", "description": "View-only access", "color": "#64748b", "is_active": 1}
                    ]
                    for role in fallback_roles:
                        await cur.execute("SELECT id FROM roles WHERE name=%s", (role["name"],))
                        if not await cur.fetchone():
                            await admin_repo.create_role(conn, role)
    except Exception as e:
        print("Failed to seed fallback roles:", e)

    yield
    await db.disconnect()


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Multi-tenant CRM API",
    version="2.0.0",
    lifespan=lifespan,
)

import os
from pathlib import Path
# Fall back to sensible defaults so a stale/mismatched Settings can't crash startup.
media_root = Path(getattr(settings, "MEDIA_ROOT", "uploads"))
media_url = getattr(settings, "MEDIA_URL", "/uploads")
media_root.mkdir(parents=True, exist_ok=True)
app.mount(media_url, StaticFiles(directory=str(media_root)), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Auth ─────────────────────────────────────────────────────────────────────
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])

# ─── Admin ────────────────────────────────────────────────────────────────────
# Each admin resource is its own file under routers/admin/
app.include_router(admin_roles.router,     prefix="/api/admin")
app.include_router(admin_users.router,     prefix="/api/admin")
app.include_router(admin_companies.router, prefix="/api/admin")
app.include_router(admin_dashboard.router, prefix="/api/admin")

# ─── Masters ──────────────────────────────────────────────────────────────────
app.include_router(masters_dashboard.router, prefix="/api/masters")
app.include_router(masters_geography.router, prefix="/api/masters")
app.include_router(masters_general.router,   prefix="/api/masters")
app.include_router(masters_sales.router,     prefix="/api/masters")

# ─── CRM ──────────────────────────────────────────────────────────────────────
app.include_router(crm_router.router, prefix="/api/crm", tags=["CRM"])


@app.get("/api/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "database": "connected"}
