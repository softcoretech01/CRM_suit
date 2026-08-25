import pymysql

conn = pymysql.connect(
    host='100.86.181.18',
    port=3325,
    user='root',
    password='Cr3#2026',
    database='Admin_crm',
    autocommit=True
)

roles = [
    (1, 'Super Admin', 'Full system access', '#dc2626', 1),
    (2, 'Administrator', 'System Administrator', '#dc2626', 1),
    (3, 'CEO', 'Executive access', '#7c3aed', 1),
    (4, 'Sales Manager', 'Manage team', '#16a34a', 1),
    (5, 'Sales Executive', 'Manage own leads', '#2563eb', 1),
    (6, 'Marketing', 'Marketing data', '#0891b2', 1),
    (7, 'Support', 'Customer support', '#d97706', 1),
    (8, 'Accounts', 'Financial reports', '#be185d', 1),
    (9, 'Read Only', 'View-only access', '#64748b', 1)
]

portals = {
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

with conn.cursor() as cur:
    print("1. Seeding roles...")
    for r in roles:
        cur.execute("INSERT INTO roles (id, name, description, color, is_active) VALUES (%s, %s, %s, %s, %s) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), color=VALUES(color);", r)
    
    print("2. Seeding permissions...")
    for portal, screens in portals.items():
        for screen in screens:
            cur.execute("SELECT id FROM permissions WHERE portal = %s AND screen = %s", (portal, screen))
            p = cur.fetchone()
            if not p:
                cur.execute("INSERT INTO permissions (portal, screen, description) VALUES (%s, %s, %s)", (portal, screen, f"Access to {screen} in {portal}"))
                p_id = cur.lastrowid
            else:
                p_id = p[0]
            
            # Assign permissions to Super Admin (1) and Administrator (2)
            for role_id in [1, 2]:
                cur.execute("INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (%s, %s)", (role_id, p_id))

print("Roles and permissions seeded successfully!")
conn.close()
