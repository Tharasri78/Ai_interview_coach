from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Answer
from app.services.summary_service import generate_summary

router = APIRouter()


@router.get("/{user_id}")
def get_summary(user_id: int, db: Session = Depends(get_db)):

    answers = db.query(Answer).filter(Answer.user_id == user_id).all()

    history = [
        {
            "question": a.question,
            "answer": a.answer,
            "scores": {
                "overall": a.overall,
                "technical": a.technical,
                "depth": a.depth,
                "clarity": a.clarity
            }
        }
        for a in answers
    ]

    return generate_summary(history)