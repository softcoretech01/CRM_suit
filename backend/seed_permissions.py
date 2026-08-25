import asyncio
from app.core.database import db

PORTALS = {
    'crm': [
        'Dashboard', 'Companies', 'Contacts', 'Products', 'Leads', 'Opportunities', 
        'Activities', 'Follow-ups', 'Sales Reports'
    ],
    'masters': [
        'Dashboard', 'Company', 'Industry', 'Lead Source', 'Campaign', 'Activity Type', 
        'Lead Status', 'Next Action', 'Priority', 'Country', 'State', 'City'
    ],
    'admin': [
        'Dashboard', 'Users', 'Roles', 'Permissions'
    ]
}

async def seed_permissions():
    await db.connect()
    
    async with db.admin_pool.acquire() as conn:
        async with conn.cursor() as cur:
            role_id = 1 # CEO Role we just created
            
            # 1. Populate permissions table
            for portal, screens in PORTALS.items():
                for screen in screens:
                    # Check if exists
                    await cur.execute("SELECT id FROM permissions WHERE portal = %s AND screen = %s", (portal, screen))
                    p = await cur.fetchone()
                    
                    if not p:
                        await cur.execute("INSERT INTO permissions (portal, screen) VALUES (%s, %s)", (portal, screen))
                        p_id = cur.lastrowid
                    else:
                        p_id = p[0] if isinstance(p, tuple) else p['id'] if isinstance(p, dict) else p[0] # Handle dict cursor if set globally
                    
                    # 2. Assign to role_id=1
                    await cur.execute("SELECT * FROM role_permissions WHERE role_id = %s AND permission_id = %s", (role_id, p_id))
                    rp = await cur.fetchone()
                    if not rp:
                        await cur.execute("INSERT INTO role_permissions (role_id, permission_id) VALUES (%s, %s)", (role_id, p_id))
            
            print(f"Successfully seeded {sum(len(v) for v in PORTALS.values())} permissions for role_id 1.")
            
    await db.disconnect()

asyncio.run(seed_permissions())
