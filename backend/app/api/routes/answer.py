from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.db.models import Answer
from app.services.evaluation_service import evaluate_answer

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/submit-answer/")
async def submit_answer_api(data: dict, db: Session = Depends(get_db)):

    user_id = data.get("user_id")
    question = data.get("question")
    answer = data.get("answer")

    result = evaluate_answer(question, answer)
    scores = result.get("scores", {})

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

    return result