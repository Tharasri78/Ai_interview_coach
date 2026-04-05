import os
import shutil
import json
import re

from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.models import User, Answer
from app.db.database import SessionLocal
from passlib.context import CryptContext


from app.services.rag_engine import (
    create_or_update_vector_store,
    load_vector_store,
    generate_question,
    evaluate_answer,
    retrieve_docs,
    compute_confidence
)
from app.services.adaptive import get_next_difficulty


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password):
    return pwd_context.hash(password)

def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)
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

# ---------- AUTH ----------
@router.post("/signup/")
async def signup(name: str, email: str, password: str, db: Session = Depends(get_db)):
    if "@" not in email or len(password) < 6:
        return {"error": "Invalid email or weak password"}
    user = db.query(User).filter(User.email == email).first()
    
    if user:
        return {"error": "User already exists"}

    new_user = User(
        name=name,
        email=email,
        password=hash_password(password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "user_id": new_user.id,
        "name": new_user.name,
        "email": new_user.email
    }

@router.post("/login/")
async def login(email: str, password: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()

    if not user or not verify_password(password, user.password):
       return {"error": "Invalid credentials"}

    return {
        "user_id": user.id,
        "name": user.name,
        "email": user.email
    }    
# ---------- UPLOAD PDF ----------

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload-pdf/")
async def upload_pdf(user_id: int, file: UploadFile = File(...)):
    print("UPLOAD HIT:", user_id)
    file_path = f"{UPLOAD_DIR}/{user_id}_{file.filename}"

    with open(file_path, "wb") as f:
        f.write(await file.read())

    from app.services.rag_engine import create_or_update_vector_store
    create_or_update_vector_store(user_id, file_path)

    return {
    "status": "success",
    "message": "PDF uploaded successfully"
}


# ---------- GENERATE QUESTION ----------
@router.get("/generate-question/")
async def generate_question_api(user_id: int, topic: str, db: Session = Depends(get_db)):
    vs = load_vector_store(user_id)

    if not vs:
        return {"error": "No knowledge base"}

    docs = retrieve_docs(vs, topic)

    if not docs:
        return {"error": "No relevant content"}

    difficulty = get_next_difficulty(get_user_avg_score(db, user_id))
    q = generate_question(topic, docs, difficulty)

    return {
        "question": q,
        "difficulty": difficulty,
        "source": docs[0].page_content[:200],
        "confidence": compute_confidence(len(docs))
    }


# ---------- SUBMIT ANSWER ----------
from pydantic import BaseModel

class AnswerRequest(BaseModel):
    user_id: int
    question: str
    answer: str


@router.post("/submit-answer/")
async def submit_answer(data: AnswerRequest, db: Session = Depends(get_db)):

    vs = load_vector_store(data.user_id)

    if not vs:
        return {"error": "No knowledge base"}

    docs = retrieve_docs(vs, data.question)

    if not docs:
        return {"error": "No relevant content for evaluation"}

    raw = evaluate_answer(data.question, data.answer, docs)

    scores = safe_parse_json(raw)

    db.add(Answer(
        user_id=data.user_id,
        question=data.question,
        answer=data.answer,
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

# ---------- HISTORY ----------
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