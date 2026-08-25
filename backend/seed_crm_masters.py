import asyncio
from app.core.database import db
import aiomysql
from datetime import date

async def seed_masters():
    await db.connect()
    
    industries = [
        ("IT-SW", "IT & Software", "Information Technology and Software Services"),
        ("MFG", "Manufacturing", "Manufacturing and Production"),
        ("AUTO", "Automotive", "Automotive Industry"),
        ("HLTH", "Healthcare", "Healthcare and Medical"),
        ("PHARMA", "Pharmaceuticals", "Pharmaceutical Industry"),
        ("HOSP", "Hospitality", "Hospitality and Hotels"),
        ("TRVL", "Travel & Tourism", "Travel and Tourism"),
        ("EDU", "Education", "Education and Training"),
        ("CONST", "Construction", "Construction and Real Estate Development"),
        ("REAL", "Real Estate", "Real Estate Sales and Management"),
        ("BFSI", "Banking & Finance", "Banking, Financial Services and Insurance"),
        ("RETL", "Retail", "Retail and E-commerce"),
        ("WHSL", "Wholesale", "Wholesale and Distribution"),
        ("LOGI", "Logistics & Transportation", "Logistics, Shipping and Transportation"),
        ("TELE", "Telecommunications", "Telecommunications"),
        ("MEDIA", "Media & Entertainment", "Media, News and Entertainment"),
        ("FNB", "Food & Beverage", "Food and Beverage"),
        ("AGRI", "Agriculture", "Agriculture and Farming"),
        ("ENRG", "Energy & Utilities", "Energy, Power and Utilities"),
        ("OIL", "Oil & Gas", "Oil and Gas"),
        ("CHEM", "Chemicals", "Chemicals and Petrochemicals"),
        ("TEXT", "Textiles & Apparel", "Textiles, Apparel and Fashion"),
        ("ENG", "Engineering", "Engineering Services"),
        ("ELEC", "Electronics", "Electronics and Components"),
        ("FMCG", "Consumer Goods", "Fast Moving Consumer Goods"),
        ("PROF", "Professional Services", "Professional Services"),
        ("CONS", "Consulting", "Management and Business Consulting"),
        ("GOV", "Government", "Government and Public Sector"),
        ("NGO", "Non-Profit", "Non-Governmental Organizations")
    ]

    lead_sources = [
        ("WEB", "Website"),
        ("ORG-SEARCH", "Google Search"),
        ("G-ADS", "Google Ads"),
        ("SOCIAL", "Social Media"),
        ("FB", "Facebook"),
        ("IG", "Instagram"),
        ("LNKD", "LinkedIn"),
        ("EMAIL-CMP", "Email Campaign"),
        ("PHONE", "Phone Call"),
        ("WA", "WhatsApp"),
        ("REF", "Referral"),
        ("CUST-REF", "Customer Referral"),
        ("PTR", "Partner"),
        ("TRD-SHOW", "Trade Show"),
        ("EXHB", "Exhibition"),
        ("CONF", "Conference"),
        ("WEBINAR", "Webinar"),
        ("MKT-PLC", "Online Marketplace"),
        ("COLD", "Cold Outreach"),
        ("SALES", "Sales Team"),
        ("INB", "Inbound Enquiry"),
        ("EXIST", "Existing Customer"),
        ("ADS", "Advertisement"),
        ("DIR", "Direct Enquiry"),
        ("OTH", "Other")
    ]

    campaigns = [
        ("Website Enquiry Campaign", "WEB-001", "Active"),
        ("Google Ads Campaign", "ADS-001", "Active"),
        ("LinkedIn Lead Generation", "LNKD-001", "Active"),
        ("Email Marketing Campaign", "EML-001", "Active"),
        ("Social Media Campaign", "SOC-001", "Active"),
        ("Product Promotion Campaign", "PROMO-001", "Active"),
        ("Trade Show Campaign", "SHOW-001", "Active"),
        ("Customer Referral Campaign", "REF-001", "Active")
    ]

    product_categories = [
        ("Software Subscriptions", "SaaS and cloud software licenses"),
        ("Hardware Setup", "Physical servers, laptops, and networking gear"),
        ("Consulting Services", "Strategic advising and management consulting"),
        ("Support & Maintenance", "Annual Maintenance Contracts (AMC) and SLA support"),
        ("Training & Onboarding", "Employee and client training packages"),
        ("Implementation Fees", "One-time setup and implementation charges"),
        ("Custom Development", "Bespoke software or hardware engineering"),
        ("Managed Services", "Outsourced IT or business operations"),
        ("Advertising Credits", "Ad-spend allocations for digital campaigns"),
        ("Event Sponsorships", "Booth space, speaking slots, or event branding")
    ]

    activity_types = [
        ("Call", "blue", "bi-telephone"),
        ("Email", "gray", "bi-envelope"),
        ("Meeting", "purple", "bi-people"),
        ("Demo", "orange", "bi-display"),
        ("Site Visit", "green", "bi-geo-alt"),
        ("Follow-up", "teal", "bi-arrow-repeat"),
        ("WhatsApp", "success", "bi-whatsapp"),
        ("Video Call", "info", "bi-camera-video"),
        ("Task", "warning", "bi-check2-square"),
        ("Note", "secondary", "bi-file-text"),
        ("Proposal Sent", "primary", "bi-file-earmark-text"),
        ("Quotation Sent", "primary", "bi-receipt"),
        ("Presentation", "indigo", "bi-easel"),
        ("Product Discussion", "pink", "bi-chat-dots"),
        ("Requirement Discussion", "red", "bi-chat-square-text"),
        ("Negotiation", "yellow", "bi-briefcase")
    ]

    lead_statuses = [
        ("New", "primary", 1),
        ("Contacted", "info", 2),
        ("Qualified", "success", 3),
        ("Follow-up Required", "warning", 4),
        ("Interested", "teal", 5),
        ("Converted", "green", 6),
        ("Not Interested", "secondary", 7),
        ("Unqualified", "gray", 8),
        ("Lost", "danger", 9)
    ]

    next_actions = [
        ("Call Customer", "primary", 1),
        ("Send Email", "info", 2),
        ("Schedule Meeting", "purple", 3),
        ("Schedule Demo", "orange", 4),
        ("Send Brochure", "teal", 5),
        ("Send Product Details", "teal", 6),
        ("Send Quotation", "success", 7),
        ("Send Proposal", "success", 8),
        ("Follow Up", "warning", 9),
        ("Arrange Site Visit", "green", 10),
        ("Arrange Product Demo", "orange", 11),
        ("Discuss Requirements", "indigo", 12),
        ("Negotiate Pricing", "yellow", 13),
        ("Send Contract", "success", 14),
        ("Collect Documents", "gray", 15),
        ("Await Customer Response", "secondary", 16),
        ("Internal Discussion", "pink", 17),
        ("Management Approval", "danger", 18),
        ("Close Lead", "dark", 19)
    ]

    priorities = [
        ("Low", "secondary", 1),
        ("Medium", "info", 2),
        ("High", "warning", 3),
        ("Urgent", "danger", 4)
    ]

    countries = [
        ("IN", "India"), ("US", "United States"), ("GB", "United Kingdom"), 
        ("AE", "United Arab Emirates"), ("SA", "Saudi Arabia"), ("QA", "Qatar"),
        ("OM", "Oman"), ("KW", "Kuwait"), ("BH", "Bahrain"), ("SG", "Singapore"),
        ("MY", "Malaysia"), ("AU", "Australia"), ("NZ", "New Zealand"), ("CA", "Canada"),
        ("DE", "Germany"), ("FR", "France"), ("IT", "Italy"), ("ES", "Spain"),
        ("NL", "Netherlands"), ("CH", "Switzerland"), ("ZA", "South Africa"), ("JP", "Japan"),
        ("CN", "China"), ("KR", "South Korea"), ("ID", "Indonesia"), ("TH", "Thailand"),
        ("VN", "Vietnam"), ("PH", "Philippines"), ("BD", "Bangladesh"), ("LK", "Sri Lanka"),
        ("NP", "Nepal"), ("PK", "Pakistan"), ("BR", "Brazil"), ("MX", "Mexico")
    ]
    
    # State and City structure for India and US as examples
    states_cities = {
        "IN": {
            "TN": ("Tamil Nadu", ["Chennai", "Coimbatore", "Madurai"]),
            "MH": ("Maharashtra", ["Mumbai", "Pune", "Nagpur"]),
            "KA": ("Karnataka", ["Bengaluru", "Mysuru", "Mangaluru"]),
            "DL": ("Delhi", ["New Delhi"])
        },
        "US": {
            "CA": ("California", ["Los Angeles", "San Francisco", "San Diego"]),
            "NY": ("New York", ["New York City", "Buffalo"]),
            "TX": ("Texas", ["Houston", "Austin", "Dallas"])
        }
    }

    async with db.masters_pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            
            # Helper for idempotent inserts
            async def seed_table(table, key_col, key_val, insert_query, insert_args):
                await cur.execute(f"SELECT id FROM `{table}` WHERE `{key_col}` = %s", (key_val,))
                if not await cur.fetchone():
                    await cur.execute(insert_query, insert_args)
                    return True
                return False

            # Industries
            for code, name, desc in industries:
                await seed_table("industries", "code", code,
                    "INSERT INTO industries (code, name, description) VALUES (%s, %s, %s)",
                    (code, name, desc))

            # Lead Sources
            for code, name in lead_sources:
                await seed_table("lead_sources", "code", code,
                    "INSERT INTO lead_sources (code, name) VALUES (%s, %s)",
                    (code, name))
                    
            # Campaigns
            for name, code, status in campaigns:
                await seed_table("campaigns", "name", name,
                    "INSERT INTO campaigns (name, type) VALUES (%s, %s)",
                    (name, code))

            # Product Categories
            for name, desc in product_categories:
                await seed_table("product_categories", "name", name,
                    "INSERT INTO product_categories (name, description) VALUES (%s, %s)",
                    (name, desc))

            # Activity Types
            for name, color, icon in activity_types:
                await seed_table("activity_types", "name", name,
                    "INSERT INTO activity_types (name, color_code, icon) VALUES (%s, %s, %s)",
                    (name, color, icon))
                    
            # Lead Statuses
            for name, color, order in lead_statuses:
                await seed_table("lead_statuses", "name", name,
                    "INSERT INTO lead_statuses (name, color_code, sort_order) VALUES (%s, %s, %s)",
                    (name, color, order))
                    
            # Next Actions
            for name, color, order in next_actions:
                await seed_table("next_actions", "name", name,
                    "INSERT INTO next_actions (name, color_code, sort_order) VALUES (%s, %s, %s)",
                    (name, color, order))
                    
            # Priorities
            for name, color, order in priorities:
                await seed_table("priorities", "name", name,
                    "INSERT INTO priorities (name, color_code, sort_order) VALUES (%s, %s, %s)",
                    (name, color, order))

            # Countries, States, Cities
            for code, name in countries:
                await cur.execute("SELECT id FROM countries WHERE code = %s", (code,))
                country_row = await cur.fetchone()
                if not country_row:
                    await cur.execute("INSERT INTO countries (code, name) VALUES (%s, %s)", (code, name))
                    country_id = cur.lastrowid
                else:
                    country_id = country_row['id']
                    
                if code in states_cities:
                    for scode, (sname, cities) in states_cities[code].items():
                        await cur.execute("SELECT id FROM states WHERE code = %s AND country_id = %s", (scode, country_id))
                        state_row = await cur.fetchone()
                        if not state_row:
                            await cur.execute("INSERT INTO states (country_id, code, name) VALUES (%s, %s, %s)", (country_id, scode, sname))
                            state_id = cur.lastrowid
                        else:
                            state_id = state_row['id']
                            
                        for cname in cities:
                            await cur.execute("SELECT id FROM cities WHERE name = %s AND state_id = %s", (cname, state_id))
                            if not await cur.fetchone():
                                await cur.execute("INSERT INTO cities (state_id, name) VALUES (%s, %s)", (state_id, cname))
                                
            await conn.commit()
            print("Master data seeded successfully.")
            
    await db.disconnect()

if __name__ == "__main__":
    asyncio.run(seed_masters())
