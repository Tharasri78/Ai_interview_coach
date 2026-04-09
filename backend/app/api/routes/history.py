from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.db.models import Answer

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/history/")
def get_history(user_id: int, db: Session = Depends(get_db)):

    records = db.query(Answer)\
        .filter(Answer.user_id == user_id)\
        .order_by(Answer.created_at.desc())\
        .all()

    return records