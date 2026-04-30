from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Answer

router = APIRouter()

@router.get("/{user_id}")
def get_history(user_id: int, db: Session = Depends(get_db)):
    """Get history for user from database"""
    answers = db.query(Answer).filter(Answer.user_id == user_id).order_by(Answer.created_at.desc()).all()
    
    return [
        {
            "question": a.question,
            "answer": a.answer,
            "score": a.overall,
            "technical": a.technical,
            "depth": a.depth,
            "clarity": a.clarity,
            "created_at": a.created_at,
            "feedback": None
        }
        for a in answers
    ]