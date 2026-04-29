from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import User
from pydantic import BaseModel
import bcrypt

router = APIRouter()


# ---------------- REQUEST SCHEMAS ----------------
class SignupRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


# ---------------- SIGNUP ----------------
@router.post("/signup/")
def signup(data: SignupRequest, db: Session = Depends(get_db)):

    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    hashed_password = bcrypt.hashpw(data.password.encode(), bcrypt.gensalt()).decode()

    user = User(
        name=data.name,
        email=data.email,
        password=hashed_password
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "user_id": user.id,
        "name": user.name,
        "email": user.email
    }


# ---------------- LOGIN ----------------
@router.post("/login/")
def login(data: LoginRequest, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not bcrypt.checkpw(data.password.encode(), user.password.encode()):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {
        "user_id": user.id,
        "name": user.name,
        "email": user.email
    }