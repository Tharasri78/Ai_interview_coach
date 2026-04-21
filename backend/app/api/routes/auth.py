from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import User
import bcrypt

router = APIRouter()


# ---------------- SIGNUP ----------------
@router.post("/signup/")
def signup(name: str, email: str, password: str, db: Session = Depends(get_db)):

    # check if user exists
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    # hash password
    hashed_password = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    # create user
    user = User(
        name=name,
        email=email,
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
def login(email: str, password: str, db: Session = Depends(get_db)):

    # find user by email
    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # check password
    if not bcrypt.checkpw(password.encode(), user.password.encode()):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {
        "user_id": user.id,
        "name": user.name,
        "email": user.email
    }