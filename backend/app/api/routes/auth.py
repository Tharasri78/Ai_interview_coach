from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import User

router = APIRouter()

@router.post("/signup/")
def signup(name: str, email: str, password: str, db: Session = Depends(get_db)):

    existing = db.query(User).filter(User.email == email).first()
    if existing:
        return {"error": "User already exists"}

    user = User(name=name, email=email, password=password)
    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "user_id": user.id,
        "name": user.name,
        "email": user.email
    }


@router.post("/login/")
def login(email: str, password: str, db: Session = Depends(get_db)):

    user = db.query(User).filter(
        User.email == email,
        User.password == password
    ).first()

    if not user:
        return {"error": "Invalid credentials"}

    return {
        "user_id": user.id,
        "name": user.name,
        "email": user.email
    }