import os
import shutil
import json
import re

from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.database import SessionLocal
from app.db.models import Answer

from app.services.rag_engine import (
    create_or_update_vector_store,
    load_vector_store,
    generate_question,
    evaluate_answer,
    retrieve_docs,
    compute_confidence
)
from app.services.adaptive import get_next_difficulty

router = APIRouter()


# ---------- DB ----------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_user_avg_score(db, user_id):
    return db.query(func.avg(Answer.overall)).filter(
        Answer.user_id == user_id
    ).scalar() or 0


# ---------- SAFE JSON ----------
def safe_parse_json(text):
    try:
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            return json.loads(match.group())
    except:
        pass

    return {
        "technical": 0,
        "depth": 0,
        "clarity": 0,
        "overall": 0,
        "feedback": "Parsing failed",
        "missing": ""
    }


# ---------- UPLOAD PDF ----------
@router.post("/upload-pdf/")
async def upload_pdf(user_id: int, file: UploadFile = File(...)):
    path = f"temp_{file.filename}"

    with open(path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    create_or_update_vector_store(user_id, path)
    os.remove(path)

    return {"message": "PDF added"}


# ---------- GENERATE QUESTION ----------
@router.get("/generate-question/")
async def generate_question_api(user_id: int, topic: str, db: Session = Depends(get_db)):
    vs = load_vector_store(user_id)

    if not vs:
        return {"error": "No knowledge base"}

    docs = retrieve_docs(vs, topic + " operating system scheduling")

    if not docs:
        return {"error": "No relevant content"}

    difficulty = get_next_difficulty(get_user_avg_score(db, user_id), "easy")

    q = generate_question(topic, docs, difficulty)

    return {
        "question": q,
        "difficulty": difficulty,
        "source": docs[0].page_content[:200],
        "confidence": compute_confidence(len(docs))
    }


# ---------- SUBMIT ANSWER ----------
@router.post("/submit-answer/")
async def submit_answer(user_id: int, question: str, answer: str, db: Session = Depends(get_db)):
    vs = load_vector_store(user_id)

    if not vs:
        return {"error": "No knowledge base"}

    docs = retrieve_docs(vs, question + " operating system scheduling")

    if not docs:
        return {"error": "No relevant content for evaluation"}

    raw = evaluate_answer(question, answer, docs)

    scores = safe_parse_json(raw)

    db.add(Answer(
        user_id=user_id,
        question=question,
        answer=answer,
        technical=scores["technical"],
        depth=scores["depth"],
        clarity=scores["clarity"],
        overall=scores["overall"]
    ))
    db.commit()

    return {
        "scores": scores,
        "feedback": scores.get("feedback", ""),
        "missing": scores.get("missing", ""),
        "source": docs[0].page_content[:200],
        "confidence": compute_confidence(len(docs))
    }

@router.get("/history/{user_id}")
async def get_history(user_id: int, db: Session = Depends(get_db)):
    answers = (
        db.query(Answer)
        .filter(Answer.user_id == user_id)
        .order_by(Answer.id.desc())
        .all()
    )

    return [
        {
            "question": a.question,
            "score": a.overall,
            "topic": "General"
        }
        for a in answers
    ]    