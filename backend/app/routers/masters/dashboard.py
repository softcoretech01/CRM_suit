"""
routers/masters/dashboard.py
----------------------------
Dashboard summary endpoints for Masters portal.
"""
from fastapi import APIRouter, Depends
from aiomysql.connection import Connection
from app.core.database import get_masters_db, get_crm_db, get_admin_db

router = APIRouter(tags=["Masters — Dashboard"])

@router.get("/dashboard/summary")
async def get_dashboard_summary(db: Connection = Depends(get_masters_db)):
    async with db.cursor() as cur:
        await cur.execute("SELECT COUNT(*) FROM activity_types")
        total_activity_types = (await cur.fetchone())[0]
        
        await cur.execute("SELECT COUNT(*) FROM campaigns")
        total_campaigns = (await cur.fetchone())[0]
        
        await cur.execute("SELECT COUNT(*) FROM lead_sources")
        total_lead_sources = (await cur.fetchone())[0]
        
        await cur.execute("SELECT COUNT(*) FROM industries")
        total_industries = (await cur.fetchone())[0]
        
        await cur.execute("SELECT COUNT(*) FROM product_categories")
        total_product_categories = (await cur.fetchone())[0]
        
        await cur.execute("SELECT COUNT(*) FROM company_types")
        total_company_types = (await cur.fetchone())[0]

    return {
        "success": True,
        "data": {
            "total_activity_types": total_activity_types,
            "total_campaigns": total_campaigns,
            "total_lead_sources": total_lead_sources,
            "total_industries": total_industries,
            "total_product_categories": total_product_categories,
            "total_company_types": total_company_types
        }
    }

@router.get("/dashboard/distributions")
async def get_dashboard_distributions(db: Connection = Depends(get_masters_db)):
    async with db.cursor() as cur:
        await cur.execute("SELECT COUNT(*) FROM lead_sources")
        ls = (await cur.fetchone())[0]
        await cur.execute("SELECT COUNT(*) FROM campaigns")
        camp = (await cur.fetchone())[0]
        await cur.execute("SELECT COUNT(*) FROM activity_types")
        act = (await cur.fetchone())[0]
        await cur.execute("SELECT COUNT(*) FROM priorities")
        prio = (await cur.fetchone())[0]
        await cur.execute("SELECT COUNT(*) FROM lead_statuses")
        stat = (await cur.fetchone())[0]
        await cur.execute("SELECT COUNT(*) FROM next_actions")
        nxt = (await cur.fetchone())[0]
        await cur.execute("SELECT COUNT(*) FROM product_categories")
        prod = (await cur.fetchone())[0]
        await cur.execute("SELECT COUNT(*) FROM company_types")
        comp = (await cur.fetchone())[0]
        await cur.execute("SELECT COUNT(*) FROM industries")
        ind = (await cur.fetchone())[0]
        
    return {
        "success": True,
        "data": {
            "master_records": [
                {"name": "Lead Sources", "value": ls},
                {"name": "Campaigns", "value": camp},
                {"name": "Activity Types", "value": act},
                {"name": "Priorities", "value": prio},
                {"name": "Lead Statuses", "value": stat},
                {"name": "Next Actions", "value": nxt},
                {"name": "Product Categories", "value": prod},
                {"name": "Company Types", "value": comp},
                {"name": "Industries", "value": ind}
            ]
        }
    }
