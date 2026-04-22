from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.database import get_db
from app.db.models import Answer

router = APIRouter()


@router.get("/summary/{user_id}")
def get_summary(user_id: int, db: Session = Depends(get_db)):

    answers = db.query(Answer).filter(Answer.user_id == user_id).all()

    if not answers:
        return {
            "message": "No data yet",
            "avg_score": 0,
            "total": 0,
            "strong": None,
            "weak": None
        }

    # ─────────────────────────────
    # BASIC STATS
    # ─────────────────────────────
    total = len(answers)

    avg_score = db.query(func.avg(Answer.overall))\
        .filter(Answer.user_id == user_id)\
        .scalar() or 0

    # ─────────────────────────────
    # CATEGORY AVERAGES
    # ─────────────────────────────
    avg_tech = db.query(func.avg(Answer.technical))\
        .filter(Answer.user_id == user_id).scalar() or 0

    avg_depth = db.query(func.avg(Answer.depth))\
        .filter(Answer.user_id == user_id).scalar() or 0

    avg_clarity = db.query(func.avg(Answer.clarity))\
        .filter(Answer.user_id == user_id).scalar() or 0

    # ─────────────────────────────
    # STRONG / WEAK AREA
    # ─────────────────────────────
    scores = {
        "technical": avg_tech,
        "depth": avg_depth,
        "clarity": avg_clarity
    }

    strong_area = max(scores, key=scores.get)
    weak_area = min(scores, key=scores.get)

    return {
        "avg_score": round(avg_score, 2),
        "total": total,
        "strong": strong_area,
        "weak": weak_area,
        "breakdown": {
            "technical": round(avg_tech, 2),
            "depth": round(avg_depth, 2),
            "clarity": round(avg_clarity, 2)
        }
    }