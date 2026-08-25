from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from aiomysql.connection import Connection
from app.core.database import get_crm_db
from app.core.dependencies import get_current_user, get_current_tenant_id
from app.repositories import crm_repo
from app.schemas import crm_schemas

router = APIRouter()


# ─────────────────────────────────────────────
# LEADS
# ─────────────────────────────────────────────

def _num(v):
    """Coerce to int or None (treat '', None, 0-ish blanks as NULL for optional FKs)."""
    try:
        return int(v) if v not in (None, "", "null") else None
    except (TypeError, ValueError):
        return None

@router.get("/leads")
async def get_leads(
    db: Connection = Depends(get_crm_db),
    tenant_id: int = Depends(get_current_tenant_id)
):
    return {"success": True, "data": await crm_repo.call_sp(db, "sp_crm_lead_list", (tenant_id,))}

@router.get("/leads/{lead_id}")
async def get_lead(
    lead_id: int,
    db: Connection = Depends(get_crm_db),
    tenant_id: int = Depends(get_current_tenant_id)
):
    rows = await crm_repo.call_sp(db, "sp_crm_lead_get", (tenant_id, lead_id))
    if not rows:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"success": True, "data": rows[0]}

@router.post("/leads", status_code=201)
async def create_lead(
    payload: dict,
    db: Connection = Depends(get_crm_db),
    tenant_id: int = Depends(get_current_tenant_id),
    current_user: dict = Depends(get_current_user)
):
    p = payload
    lead_id = await crm_repo.call_sp_scalar(db, "sp_crm_lead_create", (
        tenant_id, _num(p.get("company_id")), _num(p.get("product_id")), p.get("lead_name"), p.get("contact_name"),
        p.get("email"), p.get("phone"), p.get("address"), p.get("business_details"),
        p.get("requirement"), p.get("source"), p.get("temperature"), p.get("priority"),
        p.get("value"), _num(p.get("assigned_to")), current_user.get("id"), p.get("notes"),
    ))
    return {"success": True, "message": "Lead created successfully", "data": {"id": lead_id}}

@router.put("/leads/{lead_id}")
async def update_lead(
    lead_id: int,
    payload: dict,
    db: Connection = Depends(get_crm_db),
    tenant_id: int = Depends(get_current_tenant_id)
):
    p = payload
    await crm_repo.call_sp(db, "sp_crm_lead_update", (
        tenant_id, lead_id, _num(p.get("company_id")), _num(p.get("product_id")), p.get("lead_name"), p.get("contact_name"),
        p.get("email"), p.get("phone"), p.get("address"), p.get("business_details"),
        p.get("requirement"), p.get("source"), p.get("temperature"), p.get("priority"),
        p.get("value"), _num(p.get("assigned_to")), p.get("notes"),
    ))
    return {"success": True, "message": "Lead updated successfully"}

@router.delete("/leads/{lead_id}")
async def delete_lead(
    lead_id: int,
    db: Connection = Depends(get_crm_db),
    tenant_id: int = Depends(get_current_tenant_id)
):
    await crm_repo.call_sp(db, "sp_crm_lead_delete", (tenant_id, lead_id))
    return {"success": True, "message": "Lead deleted successfully"}

@router.post("/leads/{lead_id}/log-touch")
async def log_touch(
    lead_id: int,
    payload: dict,
    db: Connection = Depends(get_crm_db),
    tenant_id: int = Depends(get_current_tenant_id),
    current_user: dict = Depends(get_current_user)
):
    # Logs the current interaction as a completed Activity, and (if a next date is
    # given) schedules a pending Follow-up.
    p = payload
    await crm_repo.call_sp(db, "sp_crm_lead_log_touch", (
        tenant_id, lead_id, p.get("followup_type"), p.get("activity"),
        p.get("followup_date"), p.get("outcome"), p.get("next_followup_date") or None,
        current_user.get("id"),
    ))
    return {"success": True, "message": "Logged to Activities" + (" and scheduled next follow-up" if p.get("next_followup_date") else "")}

@router.get("/leads/{lead_id}/activities")
async def lead_activities(
    lead_id: int,
    db: Connection = Depends(get_crm_db),
    tenant_id: int = Depends(get_current_tenant_id)
):
    rows = await crm_repo.call_sp(db, "sp_crm_activity_list", (tenant_id,))
    return {"success": True, "data": [a for a in rows if a.get("lead_id") == lead_id]}

@router.post("/leads/{lead_id}/close")
async def close_lead(
    lead_id: int,
    payload: dict,
    db: Connection = Depends(get_crm_db),
    tenant_id: int = Depends(get_current_tenant_id)
):
    status = payload.get("closure_status", "Closed")
    await crm_repo.call_sp(db, "sp_crm_lead_close", (tenant_id, lead_id, status))
    return {"success": True, "message": f"Lead marked {status}"}

@router.post("/leads/{lead_id}/convert")
async def convert_lead(
    lead_id: int,
    payload: crm_schemas.LeadConvertPayload,
    db: Connection = Depends(get_crm_db),
    tenant_id: int = Depends(get_current_tenant_id),
    current_user: dict = Depends(get_current_user)
):
    """Convert a lead to an opportunity. Marks lead as Converted and creates an opportunity."""
    # 1. Verify lead exists and belongs to this tenant
    lead = await crm_repo.get_crm_record_by_id(db, "leads", tenant_id, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    # 2. Check not already converted
    if lead.get("status") == "Converted":
        raise HTTPException(status_code=409, detail="Lead is already converted to an opportunity")

    # 3. Create the opportunity
    opp_data = {
        "lead_id": lead_id,
        "company_id": lead.get("company_id"),
        "name": payload.opportunity_name or lead.get("lead_name") or "New Opportunity",
        "value": payload.value or lead.get("value"),
        "stage": payload.stage or "Qualification",
        "assigned_to": lead.get("assigned_to"),
        "created_by": current_user.get("id"),
        "status": "ACTIVE",
    }
    opp_id = await crm_repo.create_crm_record(db, "opportunities", tenant_id, opp_data)

    # 4. Mark lead as converted
    await crm_repo.update_crm_record(
        db, "leads", tenant_id, lead_id,
        {"status": "Converted"}
    )

    return {
        "success": True,
        "message": "Lead converted successfully",
        "data": {"opportunity_id": opp_id}
    }


# ─────────────────────────────────────────────
# CONTACTS
# ─────────────────────────────────────────────

@router.get("/contacts")
async def get_contacts(
    db: Connection = Depends(get_crm_db),
    tenant_id: int = Depends(get_current_tenant_id)
):
    return {"success": True, "data": await crm_repo.get_crm_records(db, "contacts", tenant_id)}

@router.get("/contacts/{contact_id}")
async def get_contact(
    contact_id: int,
    db: Connection = Depends(get_crm_db),
    tenant_id: int = Depends(get_current_tenant_id)
):
    contact = await crm_repo.get_crm_record_by_id(db, "contacts", tenant_id, contact_id)
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    return {"success": True, "data": contact}

@router.post("/contacts", status_code=201)
async def create_contact(
    payload: crm_schemas.ContactCreate,
    db: Connection = Depends(get_crm_db),
    tenant_id: int = Depends(get_current_tenant_id)
):
    contact_id = await crm_repo.create_crm_record(db, "contacts", tenant_id, payload.model_dump(exclude_none=True))
    return {"success": True, "message": "Contact created successfully", "data": {"id": contact_id}}

@router.put("/contacts/{contact_id}")
async def update_contact(
    contact_id: int,
    payload: crm_schemas.ContactUpdate,
    db: Connection = Depends(get_crm_db),
    tenant_id: int = Depends(get_current_tenant_id)
):
    success = await crm_repo.update_crm_record(db, "contacts", tenant_id, contact_id, payload.model_dump(exclude_unset=True))
    if not success:
        raise HTTPException(status_code=404, detail="Contact not found")
    return {"success": True, "message": "Contact updated successfully"}

@router.delete("/contacts/{contact_id}")
async def delete_contact(
    contact_id: int,
    db: Connection = Depends(get_crm_db),
    tenant_id: int = Depends(get_current_tenant_id)
):
    success = await crm_repo.delete_crm_record(db, "contacts", tenant_id, contact_id)
    if not success:
        raise HTTPException(status_code=404, detail="Contact not found")
    return {"success": True, "message": "Contact deleted successfully"}


# ─────────────────────────────────────────────
# OPPORTUNITIES
# ─────────────────────────────────────────────

@router.get("/opportunities")
async def get_opportunities(
    db: Connection = Depends(get_crm_db),
    tenant_id: int = Depends(get_current_tenant_id)
):
    return {"success": True, "data": await crm_repo.call_sp(db, "sp_crm_opportunity_list", (tenant_id,))}

@router.get("/opportunities/{opportunity_id}")
async def get_opportunity(
    opportunity_id: int,
    db: Connection = Depends(get_crm_db),
    tenant_id: int = Depends(get_current_tenant_id)
):
    rows = await crm_repo.call_sp(db, "sp_crm_opportunity_get", (tenant_id, opportunity_id))
    if not rows:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return {"success": True, "data": rows[0]}

@router.post("/opportunities", status_code=201)
async def create_opportunity(
    payload: dict,
    db: Connection = Depends(get_crm_db),
    tenant_id: int = Depends(get_current_tenant_id),
    current_user: dict = Depends(get_current_user)
):
    p = payload
    opportunity_id = await crm_repo.call_sp_scalar(db, "sp_crm_opportunity_create", (
        tenant_id, _num(p.get("lead_id")), _num(p.get("company_id")), p.get("name"), p.get("description"),
        p.get("value"), p.get("stage"), _num(p.get("probability")), p.get("expected_close_date") or None,
        _num(p.get("assigned_to")), current_user.get("id"), p.get("status"),
    ))
    return {"success": True, "message": "Opportunity created successfully", "data": {"id": opportunity_id}}

@router.put("/opportunities/{opportunity_id}")
async def update_opportunity(
    opportunity_id: int,
    payload: dict,
    db: Connection = Depends(get_crm_db),
    tenant_id: int = Depends(get_current_tenant_id)
):
    p = payload
    await crm_repo.call_sp(db, "sp_crm_opportunity_update", (
        tenant_id, opportunity_id, _num(p.get("company_id")), p.get("name"), p.get("description"),
        p.get("value"), p.get("stage"), _num(p.get("probability")), p.get("expected_close_date") or None,
        _num(p.get("assigned_to")), p.get("status"),
    ))
    return {"success": True, "message": "Opportunity updated successfully"}

@router.post("/opportunities/{opportunity_id}/stage")
async def set_opportunity_stage(
    opportunity_id: int,
    payload: dict,
    db: Connection = Depends(get_crm_db),
    tenant_id: int = Depends(get_current_tenant_id)
):
    await crm_repo.call_sp(db, "sp_crm_opportunity_set_stage", (
        tenant_id, opportunity_id, payload.get("stage"), _num(payload.get("probability")),
    ))
    return {"success": True, "message": f"Stage set to {payload.get('stage')}"}

@router.get("/opportunities/{opportunity_id}/followups")
async def opp_followups(
    opportunity_id: int,
    db: Connection = Depends(get_crm_db),
    tenant_id: int = Depends(get_current_tenant_id)
):
    return {"success": True, "data": await crm_repo.call_sp(db, "sp_crm_followup_list_by_opp", (tenant_id, opportunity_id))}

@router.get("/opportunities/{opportunity_id}/activities")
async def opp_activities(
    opportunity_id: int,
    db: Connection = Depends(get_crm_db),
    tenant_id: int = Depends(get_current_tenant_id)
):
    rows = await crm_repo.call_sp(db, "sp_crm_activity_list", (tenant_id,))
    return {"success": True, "data": [a for a in rows if a.get("opportunity_id") == opportunity_id]}

@router.post("/opportunities/{opportunity_id}/log-touch")
async def opp_log_touch(
    opportunity_id: int,
    payload: dict,
    db: Connection = Depends(get_crm_db),
    tenant_id: int = Depends(get_current_tenant_id),
    current_user: dict = Depends(get_current_user)
):
    p = payload
    await crm_repo.call_sp(db, "sp_crm_opp_log_touch", (
        tenant_id, opportunity_id, p.get("followup_type"), p.get("activity"),
        p.get("followup_date"), p.get("outcome"), p.get("next_followup_date") or None,
        current_user.get("id"),
    ))
    return {"success": True, "message": "Logged to Activities" + (" and scheduled next follow-up" if p.get("next_followup_date") else "")}

@router.delete("/opportunities/{opportunity_id}")
async def delete_opportunity(
    opportunity_id: int,
    db: Connection = Depends(get_crm_db),
    tenant_id: int = Depends(get_current_tenant_id)
):
    await crm_repo.call_sp(db, "sp_crm_opportunity_delete", (tenant_id, opportunity_id))
    return {"success": True, "message": "Opportunity deleted successfully"}


# ─────────────────────────────────────────────
# ACTIVITIES
# ─────────────────────────────────────────────

@router.get("/activities")
async def get_activities(
    db: Connection = Depends(get_crm_db),
    tenant_id: int = Depends(get_current_tenant_id)
):
    return {"success": True, "data": await crm_repo.call_sp(db, "sp_crm_activity_list", (tenant_id,))}

@router.get("/activities/{activity_id}")
async def get_activity(
    activity_id: int,
    db: Connection = Depends(get_crm_db),
    tenant_id: int = Depends(get_current_tenant_id)
):
    rows = await crm_repo.call_sp(db, "sp_crm_activity_get", (tenant_id, activity_id))
    if not rows:
        raise HTTPException(status_code=404, detail="Activity not found")
    return {"success": True, "data": rows[0]}

@router.post("/activities", status_code=201)
async def create_activity(
    payload: dict,
    db: Connection = Depends(get_crm_db),
    tenant_id: int = Depends(get_current_tenant_id),
    current_user: dict = Depends(get_current_user)
):
    p = payload
    activity_id = await crm_repo.call_sp_scalar(db, "sp_crm_activity_create", (
        tenant_id, _num(p.get("lead_id")), _num(p.get("company_id")), _num(p.get("contact_id")),
        p.get("activity_type"), p.get("subject"), p.get("activity_datetime"), _num(p.get("duration")),
        p.get("outcome"), p.get("next_action"), p.get("status"), p.get("notes"),
        _num(p.get("assigned_to")), current_user.get("id"),
    ))
    return {"success": True, "message": "Activity created successfully", "data": {"id": activity_id}}

@router.put("/activities/{activity_id}")
async def update_activity(
    activity_id: int,
    payload: dict,
    db: Connection = Depends(get_crm_db),
    tenant_id: int = Depends(get_current_tenant_id)
):
    p = payload
    await crm_repo.call_sp(db, "sp_crm_activity_update", (
        tenant_id, activity_id, _num(p.get("lead_id")), _num(p.get("company_id")), _num(p.get("contact_id")),
        p.get("activity_type"), p.get("subject"), p.get("activity_datetime"), _num(p.get("duration")),
        p.get("outcome"), p.get("next_action"), p.get("status"), p.get("notes"),
    ))
    return {"success": True, "message": "Activity updated successfully"}

@router.delete("/activities/{activity_id}")
async def delete_activity(
    activity_id: int,
    db: Connection = Depends(get_crm_db),
    tenant_id: int = Depends(get_current_tenant_id)
):
    await crm_repo.call_sp(db, "sp_crm_activity_delete", (tenant_id, activity_id))
    return {"success": True, "message": "Activity deleted successfully"}


# ─────────────────────────────────────────────
# FOLLOW-UPS
# ─────────────────────────────────────────────

@router.get("/followups")
async def get_followups(
    db: Connection = Depends(get_crm_db),
    tenant_id: int = Depends(get_current_tenant_id)
):
    # All follow-ups joined with their lead/company, ordered by next follow-up date.
    return {"success": True, "data": await crm_repo.call_sp(db, "sp_crm_followup_list_all", (tenant_id,))}

@router.get("/leads/{lead_id}/followups")
async def followups_by_lead(
    lead_id: int,
    db: Connection = Depends(get_crm_db),
    tenant_id: int = Depends(get_current_tenant_id)
):
    return {"success": True, "data": await crm_repo.call_sp(db, "sp_crm_followup_list_by_lead", (tenant_id, lead_id))}

@router.post("/followups", status_code=201)
async def create_followup(
    payload: dict,
    db: Connection = Depends(get_crm_db),
    tenant_id: int = Depends(get_current_tenant_id),
    current_user: dict = Depends(get_current_user)
):
    p = payload
    followup_id = await crm_repo.call_sp_scalar(db, "sp_crm_followup_create", (
        tenant_id, _num(p.get("lead_id")), _num(p.get("opportunity_id")), p.get("followup_date"), p.get("followup_type"),
        p.get("activity"), p.get("next_followup_date"), p.get("outcome"),
        p.get("status"), p.get("notes"), _num(p.get("assigned_to")), current_user.get("id"),
    ))
    return {"success": True, "message": "Follow-up created successfully", "data": {"id": followup_id}}

@router.put("/followups/{followup_id}")
async def update_followup(
    followup_id: int,
    payload: dict,
    db: Connection = Depends(get_crm_db),
    tenant_id: int = Depends(get_current_tenant_id)
):
    p = payload
    await crm_repo.call_sp(db, "sp_crm_followup_update", (
        tenant_id, followup_id, p.get("followup_date"), p.get("followup_type"),
        p.get("activity"), p.get("next_followup_date"), p.get("outcome"),
        p.get("status"), p.get("notes"),
    ))
    return {"success": True, "message": "Follow-up updated successfully"}

@router.delete("/followups/{followup_id}")
async def delete_followup(
    followup_id: int,
    db: Connection = Depends(get_crm_db),
    tenant_id: int = Depends(get_current_tenant_id)
):
    success = await crm_repo.delete_crm_record(db, "followups", tenant_id, followup_id)
    if not success:
        raise HTTPException(status_code=404, detail="Follow-up not found")
    return {"success": True, "message": "Follow-up deleted successfully"}

@router.post("/followups/{followup_id}/done")
async def complete_followup(
    followup_id: int,
    payload: dict = None,
    db: Connection = Depends(get_crm_db),
    tenant_id: int = Depends(get_current_tenant_id)
):
    # Marks the follow-up Done and creates a completed Activity from it.
    p = payload or {}
    await crm_repo.call_sp(db, "sp_crm_followup_complete", (tenant_id, followup_id, p.get("outcome", ""), p.get("subject", "")))
    return {"success": True, "message": "Follow-up completed and logged to Activities"}


# ─────────────────────────────────────────────
# CRM COMPANIES (crm_companies table in CRM DB)
# ─────────────────────────────────────────────

@router.get("/companies")
async def get_crm_companies(
    db: Connection = Depends(get_crm_db),
    tenant_id: int = Depends(get_current_tenant_id)
):
    return {"success": True, "data": await crm_repo.get_crm_records(db, "crm_companies", tenant_id)}

@router.get("/companies/{company_id}")
async def get_crm_company(
    company_id: int,
    db: Connection = Depends(get_crm_db),
    tenant_id: int = Depends(get_current_tenant_id)
):
    company = await crm_repo.get_crm_record_by_id(db, "crm_companies", tenant_id, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return {"success": True, "data": company}

@router.post("/companies", status_code=201)
async def create_crm_company(
    payload: crm_schemas.CrmCompanyCreate,
    db: Connection = Depends(get_crm_db),
    tenant_id: int = Depends(get_current_tenant_id)
):
    company_id = await crm_repo.create_crm_record(db, "crm_companies", tenant_id, payload.model_dump(exclude_none=True))
    return {"success": True, "message": "Company created successfully", "data": {"id": company_id}}

@router.put("/companies/{company_id}")
async def update_crm_company(
    company_id: int,
    payload: crm_schemas.CrmCompanyUpdate,
    db: Connection = Depends(get_crm_db),
    tenant_id: int = Depends(get_current_tenant_id)
):
    success = await crm_repo.update_crm_record(db, "crm_companies", tenant_id, company_id, payload.model_dump(exclude_unset=True))
    if not success:
        raise HTTPException(status_code=404, detail="Company not found")
    return {"success": True, "message": "Company updated successfully"}

@router.delete("/companies/{company_id}")
async def delete_crm_company(
    company_id: int,
    db: Connection = Depends(get_crm_db),
    tenant_id: int = Depends(get_current_tenant_id)
):
    success = await crm_repo.delete_crm_record(db, "crm_companies", tenant_id, company_id)
    if not success:
        raise HTTPException(status_code=404, detail="Company not found")
    return {"success": True, "message": "Company deleted successfully"}


# ─────────────────────────────────────────────
# PRODUCTS (tenant-owned, in CRM DB)
# ─────────────────────────────────────────────

@router.get("/products")
async def get_products(
    db: Connection = Depends(get_crm_db),
    tenant_id: int = Depends(get_current_tenant_id)
):
    return {"success": True, "data": await crm_repo.get_crm_records(db, "products", tenant_id)}

@router.get("/products/{product_id}")
async def get_product(
    product_id: int,
    db: Connection = Depends(get_crm_db),
    tenant_id: int = Depends(get_current_tenant_id)
):
    product = await crm_repo.get_crm_record_by_id(db, "products", tenant_id, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"success": True, "data": product}

@router.post("/products", status_code=201)
async def create_product(
    payload: crm_schemas.ProductCreate,
    db: Connection = Depends(get_crm_db),
    tenant_id: int = Depends(get_current_tenant_id)
):
    product_id = await crm_repo.create_crm_record(db, "products", tenant_id, payload.model_dump(exclude_none=True))
    return {"success": True, "message": "Product created successfully", "data": {"id": product_id}}

@router.put("/products/{product_id}")
async def update_product(
    product_id: int,
    payload: crm_schemas.ProductUpdate,
    db: Connection = Depends(get_crm_db),
    tenant_id: int = Depends(get_current_tenant_id)
):
    success = await crm_repo.update_crm_record(db, "products", tenant_id, product_id, payload.model_dump(exclude_unset=True))
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"success": True, "message": "Product updated successfully"}

@router.delete("/products/{product_id}")
async def delete_product(
    product_id: int,
    db: Connection = Depends(get_crm_db),
    tenant_id: int = Depends(get_current_tenant_id)
):
    success = await crm_repo.delete_crm_record(db, "products", tenant_id, product_id)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"success": True, "message": "Product deleted successfully"}


# ─────────────────────────────────────────────
# APPROVALS (placeholder)
# ─────────────────────────────────────────────

@router.get("/approvals")
async def get_approvals(
    db: Connection = Depends(get_crm_db),
    tenant_id: int = Depends(get_current_tenant_id)
):
    return {"success": True, "data": []}

# ─────────────────────────────────────────────
# REGISTRATION (captured when a lead is Closed)
# ─────────────────────────────────────────────

@router.get("/leads/{lead_id}/registration")
async def get_registration(
    lead_id: int,
    db: Connection = Depends(get_crm_db),
    tenant_id: int = Depends(get_current_tenant_id)
):
    rows = await crm_repo.call_sp(db, "sp_crm_registration_get", (tenant_id, lead_id))
    return {"success": True, "data": rows[0] if rows else None}

@router.post("/leads/{lead_id}/registration")
async def save_registration(
    lead_id: int,
    payload: dict,
    db: Connection = Depends(get_crm_db),
    tenant_id: int = Depends(get_current_tenant_id),
    current_user: dict = Depends(get_current_user)
):
    p = payload
    reg_id = await crm_repo.call_sp_scalar(db, "sp_crm_registration_upsert", (
        tenant_id, lead_id, p.get("registration_no"), p.get("registration_date"),
        _num(p.get("product_id")), p.get("amount"), p.get("payment_status"),
        p.get("details"), current_user.get("id"),
    ))
    return {"success": True, "message": "Registration saved", "data": {"id": reg_id}}


# ─────────────────────────────────────────────
# FEEDBACK (5-star, on closed deals)
# ─────────────────────────────────────────────

@router.get("/leads/{lead_id}/feedback")
async def list_feedback(
    lead_id: int,
    db: Connection = Depends(get_crm_db),
    tenant_id: int = Depends(get_current_tenant_id)
):
    return {"success": True, "data": await crm_repo.call_sp(db, "sp_crm_feedback_list", (tenant_id, lead_id))}

@router.post("/leads/{lead_id}/feedback", status_code=201)
async def create_feedback(
    lead_id: int,
    payload: dict,
    db: Connection = Depends(get_crm_db),
    tenant_id: int = Depends(get_current_tenant_id),
    current_user: dict = Depends(get_current_user)
):
    p = payload
    fb_id = await crm_repo.call_sp_scalar(db, "sp_crm_feedback_create", (
        tenant_id, lead_id, _num(p.get("rating")), p.get("feedback_text"), current_user.get("id"),
    ))
    return {"success": True, "message": "Feedback saved", "data": {"id": fb_id}}


# ─────────────────────────────────────────────
# LEAD REPORT (From/To date, Customer, Status, Closure status)
# ─────────────────────────────────────────────

@router.get("/reports/leads")
async def lead_report(
    from_date: str | None = None,
    to_date: str | None = None,
    company_id: int | None = None,
    temperature: str | None = None,
    closure_status: str | None = None,
    db: Connection = Depends(get_crm_db),
    tenant_id: int = Depends(get_current_tenant_id)
):
    rows = await crm_repo.call_sp(db, "sp_crm_lead_report", (
        tenant_id, from_date or None, to_date or None,
        company_id or 0, temperature or "", closure_status or "",
    ))
    return {"success": True, "data": rows}

# ─────────────────────────────────────────────
# COMMUNICATION (Mock SMS & WhatsApp)
# ─────────────────────────────────────────────

@router.post("/whatsapp")
async def send_whatsapp(
    payload: dict,
    db: Connection = Depends(get_crm_db),
    tenant_id: int = Depends(get_current_tenant_id),
    current_user: dict = Depends(get_current_user)
):
    # Mocking the send action and logging an activity
    recipient_id = _num(payload.get("recipient_id"))
    recipient_type = payload.get("recipient_type", "contact")
    message = payload.get("message", "")
    
    # Log to activities
    await crm_repo.call_sp_scalar(db, "sp_crm_activity_create", (
        tenant_id, 
        recipient_id if recipient_type == "lead" else None, 
        None, 
        recipient_id if recipient_type == "contact" else None,
        "WhatsApp", f"Sent WhatsApp: {message[:30]}...", datetime.now().strftime("%Y-%m-%d %H:%M:%S"), 0,
        "Completed", None, "Completed", message,
        current_user.get("id"), current_user.get("id"),
    ))
    return {"success": True, "message": "WhatsApp message sent"}

@router.post("/sms")
async def send_sms(
    payload: dict,
    db: Connection = Depends(get_crm_db),
    tenant_id: int = Depends(get_current_tenant_id),
    current_user: dict = Depends(get_current_user)
):
    # Mocking the send action and logging an activity
    recipient_id = _num(payload.get("recipient_id"))
    recipient_type = payload.get("recipient_type", "contact")
    message = payload.get("message", "")
    
    # Log to activities
    await crm_repo.call_sp_scalar(db, "sp_crm_activity_create", (
        tenant_id, 
        recipient_id if recipient_type == "lead" else None, 
        None, 
        recipient_id if recipient_type == "contact" else None,
        "SMS", f"Sent SMS: {message[:30]}...", datetime.now().strftime("%Y-%m-%d %H:%M:%S"), 0,
        "Completed", None, "Completed", message,
        current_user.get("id"), current_user.get("id"),
    ))
    return {"success": True, "message": "SMS message sent"}
