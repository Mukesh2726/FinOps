from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.auth import get_current_user
from app.models.models import Workspace
from app.schemas.schemas import WorkspaceSetup, WorkspaceOut, ProfileUpdate, SuccessResponse
from app.services.audit_service import log_action
from app.services.storage_service import get_supabase

router = APIRouter()


@router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    sb = get_supabase()
    user = sb.auth.admin.get_user_by_id(current_user["id"])
    return {
        "id": current_user["id"],
        "email": current_user["email"],
        "full_name": user.user.user_metadata.get("full_name", ""),
    }


@router.patch("/profile", response_model=SuccessResponse)
async def update_profile(
    data: ProfileUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sb = get_supabase()
    sb.auth.admin.update_user_by_id(current_user["id"], {"user_metadata": {"full_name": data.full_name}})
    log_action(db, current_user["id"], "profile_updated", new_value={"full_name": data.full_name})
    return SuccessResponse(message="Profile updated")


@router.post("/workspace/setup")
async def setup_workspace(
    data: WorkspaceSetup,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    existing = db.query(Workspace).filter(Workspace.user_id == current_user["id"]).first()
    if existing:
        raise HTTPException(status_code=400, detail="Workspace already exists")
    ws = Workspace(user_id=current_user["id"], name=data.name, business_type=data.business_type, plan=data.plan)
    db.add(ws)
    db.commit()
    db.refresh(ws)
    log_action(db, current_user["id"], "workspace_created", workspace_id=ws.id, new_value={"name": data.name})
    return {"workspace": WorkspaceOut.model_validate(ws)}


@router.get("/workspace")
async def get_workspace(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ws = db.query(Workspace).filter(Workspace.user_id == current_user["id"]).first()
    if not ws:
        raise HTTPException(status_code=404, detail="No workspace found")
    return {"workspace": WorkspaceOut.model_validate(ws)}
