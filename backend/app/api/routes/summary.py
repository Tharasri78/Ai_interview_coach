from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Answer
from app.services.summary_service import get_summary_from_db

router = APIRouter()

@router.get("/{user_id}")
def get_summary(user_id: int, db: Session = Depends(get_db)):
    """Get summary for user from database"""
    return get_summary_from_db(user_id)