from fastapi import APIRouter, Depends, Query
from app.dependencies import get_tenant, require_roles, DB
from app.schemas.lead import LeadCreate, LeadUpdate, LeadOut, ActivityCreate, ActivityOut
from app.services import lead as lead_service

router = APIRouter(prefix="/leads", tags=["Leads"])


@router.get("/")
async def list_leads(
    db: DB,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: str | None = Query(None),
    search: str | None = Query(None),
    batch_id: str | None = Query(None),          # ← NEW
    tenant=Depends(get_tenant),
    current_user=Depends(require_roles("owner", "counselor")),
):
    result = await lead_service.get_leads(
        db, str(tenant.id), page, limit, status, search,
        batch_id=batch_id,                        # ← NEW
    )
    return {"success": True, **result}


@router.post("/", status_code=201)
async def create_lead(
    body: LeadCreate,
    db: DB,
    tenant=Depends(get_tenant),
    current_user=Depends(require_roles("owner", "counselor")),
):
    data = body.model_dump()
    if data.get("assigned_to"):
        data["assigned_to"] = str(data["assigned_to"])
    if data.get("batch_id"):
        data["batch_id"] = str(data["batch_id"])
    lead = await lead_service.create_lead(db, str(tenant.id), data)
    return {"success": True, "data": LeadOut.model_validate(lead)}


@router.get("/{lead_id}")
async def get_lead(
    lead_id: str,
    db: DB,
    tenant=Depends(get_tenant),
    current_user=Depends(require_roles("owner", "counselor")),
):
    lead = await lead_service.get_lead(db, str(tenant.id), lead_id)
    return {"success": True, "data": LeadOut.model_validate(lead)}


@router.patch("/{lead_id}")
async def update_lead(
    lead_id: str,
    body: LeadUpdate,
    db: DB,
    tenant=Depends(get_tenant),
    current_user=Depends(require_roles("owner", "counselor")),
):
    data = {k: v for k, v in body.model_dump().items() if v is not None}
    if data.get("batch_id"):
        data["batch_id"] = str(data["batch_id"])
    lead = await lead_service.update_lead(db, str(tenant.id), lead_id, data)
    return {"success": True, "data": LeadOut.model_validate(lead)}


@router.delete("/{lead_id}")
async def delete_lead(
    lead_id: str,
    db: DB,
    tenant=Depends(get_tenant),
    current_user=Depends(require_roles("owner")),
):
    await lead_service.delete_lead(db, str(tenant.id), lead_id)
    return {"success": True, "message": "Lead deleted."}


@router.post("/{lead_id}/activities", status_code=201)
async def add_activity(
    lead_id: str,
    body: ActivityCreate,
    db: DB,
    tenant=Depends(get_tenant),
    current_user=Depends(require_roles("owner", "counselor")),
):
    activity = await lead_service.add_activity(
        db, str(tenant.id), lead_id, str(current_user.id), body.model_dump()
    )
    return {"success": True, "data": ActivityOut.model_validate(activity)}


@router.get("/{lead_id}/activities")
async def list_activities(
    lead_id: str,
    db: DB,
    tenant=Depends(get_tenant),
    current_user=Depends(require_roles("owner", "counselor")),
):
    activities = await lead_service.get_activities(db, str(tenant.id), lead_id)
    return {"success": True, "data": [ActivityOut.model_validate(a) for a in activities]}