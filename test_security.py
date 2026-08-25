import asyncio
import aiohttp

async def run_tests():
    async with aiohttp.ClientSession() as session:
        # 1. Login as admin (no tenant) -> Should have CRM token but might fail CRM endpoints
        print("--- Testing Admin ---")
        async with session.post('http://localhost:8000/api/admin/auth/login', json={"username": "admin", "password": "password"}) as resp:
            data = await resp.json()
            admin_token = data.get("access_token")
            print(f"Admin login status: {resp.status}")
        
        if admin_token:
            async with session.get('http://localhost:8000/api/crm/companies', headers={"Authorization": f"Bearer {admin_token}"}) as resp:
                print(f"Admin -> /crm/companies: {resp.status} (Expected 403 or 401 because admin has no tenant_company_id)")

        # 2. Login as CRM user (Company A)
        print("\n--- Testing Tenant A ---")
        async with session.post('http://localhost:8000/api/admin/auth/login', json={"username": "m.scott", "password": "password123"}) as resp:
            data = await resp.json()
            tenant_a_token = data.get("access_token")
            print(f"Tenant A login status: {resp.status}")
        
        if tenant_a_token:
            async with session.get('http://localhost:8000/api/crm/companies', headers={"Authorization": f"Bearer {tenant_a_token}"}) as resp:
                data = await resp.json()
                print(f"Tenant A -> /crm/companies: {resp.status}")
                if data.get("data"):
                    print(f"Tenant A saw {len(data['data'])} companies")
                
asyncio.run(run_tests())
