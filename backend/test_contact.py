import httpx
import sys
response = httpx.put("http://127.0.0.1:8000/api/crm/contacts/1", json={"first_name": "Kabilesh", "assigned_to": "", "created_by": ""})
print(response.status_code)
print(response.text)
