import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from app.database.session import get_db
from app.core.auth import get_current_user, create_access_token
from app.models.models import User, Workspace

router = APIRouter(prefix="/auth")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str = ""


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


@router.post("/signup")
async def signup(req: SignupRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        id=str(uuid.uuid4()),
        email=req.email,
        hashed_password=pwd_context.hash(req.password),
        full_name=req.full_name,
    )
    db.add(user)
    db.commit()
    token = create_access_token(user.id, user.email)
    return {"access_token": token, "user": {"id": user.id, "email": user.email, "name": user.full_name}}


@router.post("/login")
async def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not pwd_context.verify(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(user.id, user.email)
    return {"access_token": token, "user": {"id": user.id, "email": user.email, "name": user.full_name}}


@router.get("/me")
async def me(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == current_user["id"]).first()
    name = user.full_name if user else current_user["email"].split("@")[0]
    ws = db.query(Workspace).filter(Workspace.user_id == current_user["id"]).first()
    return {
        "user": {"id": current_user["id"], "email": current_user["email"], "name": name},
        "has_workspace": ws is not None,
    }


@router.patch("/profile")
async def update_profile(
    data: dict,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == current_user["id"]).first()
    if user and data.get("full_name"):
        user.full_name = data["full_name"]
        db.commit()
    return {"success": True, "message": "Profile updated"}
