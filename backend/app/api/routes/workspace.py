from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.auth import get_current_user
from app.models.models import Workspace, User
from app.schemas.schemas import WorkspaceSetup, WorkspaceOut, ProfileUpdate, SuccessResponse

router = APIRouter()


@router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == current_user["id"]).first()
    return {
        "id": current_user["id"],
        "email": current_user["email"],
        "full_name": user.full_name if user else "",
    }


@router.patch("/profile", response_model=SuccessResponse)
async def update_profile(data: ProfileUpdate, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == current_user["id"]).first()
    if user and data.full_name:
        user.full_name = data.full_name
        db.commit()
    return SuccessResponse(message="Profile updated")


@router.post("/workspace/setup")
async def setup_workspace(data: WorkspaceSetup, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    existing = db.query(Workspace).filter(Workspace.user_id == current_user["id"]).first()
    if existing:
        raise HTTPException(status_code=400, detail="Workspace already exists")
    ws = Workspace(user_id=current_user["id"], name=data.name, business_type=data.business_type, plan=data.plan)
    db.add(ws)
    db.commit()
    db.refresh(ws)
    return {"workspace": WorkspaceOut.model_validate(ws)}


@router.get("/workspace")
async def get_workspace(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    ws = db.query(Workspace).filter(Workspace.user_id == current_user["id"]).first()
    if not ws:
        raise HTTPException(status_code=404, detail="No workspace found")
    return {"workspace": WorkspaceOut.model_validate(ws)}
