from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Answer

router = APIRouter()


@router.get("/{user_id}")
def get_history(user_id: int, db: Session = Depends(get_db)):

    records = (
        db.query(Answer)
        .filter(Answer.user_id == user_id)
        .order_by(Answer.created_at.desc())
        .all()
    )

    return [
        {
            "question": r.question,
            "answer": r.answer,
            "score": r.overall,
            "created_at": r.created_at
        }
        for r in records
    ]