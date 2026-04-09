from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.rag_service import load_vector_store, retrieve_docs
from app.services.question_service import generate_question
from app.services.difficulty_service import get_next_difficulty, get_user_avg_score

router = APIRouter()

@router.get("/generate-question/")
async def generate_question_api(user_id: int, topic: str, db: Session = Depends(get_db)):

    vs = load_vector_store(user_id)

    topic = topic.lower().strip()

    docs = []

    if vs:
        docs = retrieve_docs(vs, topic, k=2)

    difficulty = get_next_difficulty(get_user_avg_score(db, user_id))

    question = generate_question(topic, docs, difficulty)

    return {
        "question": question,
        "difficulty": difficulty,
        "fallback": len(docs) == 0,
        "confidence": len(docs)
    }