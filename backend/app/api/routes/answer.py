from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.db.models import Answer
from app.services.evaluation_service import evaluate_answer
from app.services.followup_service import generate_followup

router = APIRouter()


# ─────────────────────────────
# DB DEPENDENCY
# ─────────────────────────────
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ─────────────────────────────
# SUBMIT ANSWER API
# ─────────────────────────────
@router.post("/submit-answer/")
async def submit_answer_api(data: dict, db: Session = Depends(get_db)):

    user_id = data.get("user_id")
    question = data.get("question")
    answer = data.get("answer")

    # 🔴 BASIC VALIDATION (you skipped this earlier)
    if not user_id or not question or not answer:
        return {"error": "Missing required fields"}

    # ─────────────────────────────
    # 1. EVALUATE ANSWER
    # ─────────────────────────────
    result = evaluate_answer(question, answer)

    if not result or not result.get("scores"):
        return {
            "error": "Evaluation failed. Try again."
        }

    scores = result.get("scores", {})
    feedback = result.get("feedback", {})

    # ─────────────────────────────
    # 2. SAVE TO DATABASE
    # ─────────────────────────────
    new_entry = Answer(
        user_id=user_id,
        question=question,
        answer=answer,
        technical=scores.get("technical", 0),
        depth=scores.get("depth", 0),
        clarity=scores.get("clarity", 0),
        overall=scores.get("overall", 0)
    )

    db.add(new_entry)
    db.commit()

    # ─────────────────────────────
    # 3. GENERATE FOLLOW-UP QUESTION
    # ─────────────────────────────
    followup = generate_followup(question, answer)

    # ─────────────────────────────
    # 4. FINAL RESPONSE (CLEAN STRUCTURE)
    # ─────────────────────────────
    return {
        "scores": {
            "technical": scores.get("technical", 0),
            "depth": scores.get("depth", 0),
            "clarity": scores.get("clarity", 0),
            "overall": scores.get("overall", 0)
        },
        "feedback": {
            "issues": feedback.get("issues", ""),
            "missing": feedback.get("missing", ""),
            "ideal": feedback.get("ideal", ""),
            "improved_answer": feedback.get("improved_answer", "")
        },
        "followup": followup
    }