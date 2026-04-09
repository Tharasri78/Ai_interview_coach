import os
import shutil
import json
import re
import threading

from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from passlib.context import CryptContext
from pydantic import BaseModel

from app.db.models import User, Answer
from app.db.database import SessionLocal

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
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


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


# ---------- JSON PARSER ----------
def safe_parse_json(text):
    try:
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            parsed = json.loads(match.group())
            if all(k in parsed for k in ["technical", "depth", "clarity"]):
                return parsed
    except Exception as e:
        print("PARSE ERROR:", e)
    return None


# ---------- AUTH ----------
def hash_password(password):
    return pwd_context.hash(password)


def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)


@router.post("/signup/")
async def signup(name: str, email: str, password: str, db: Session = Depends(get_db)):
    if "@" not in email or len(password) < 6:
        return {"error": "Invalid email or weak password"}

    if db.query(User).filter(User.email == email).first():
        return {"error": "User already exists"}

    user = User(
        name=name,
        email=email,
        password=hash_password(password)
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "user_id": user.id,
        "name": user.name,
        "email": user.email
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


# ---------- UPLOAD ----------
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def process_pdf_async(user_id, file_path):
    try:
        from app.services.rag_engine import create_or_update_vector_store
        create_or_update_vector_store(user_id, file_path)
        print("VECTOR DB READY:", user_id)
    except Exception as e:
        print("BACKGROUND ERROR:", str(e))


@router.post("/upload-pdf/")
async def upload_pdf(user_id: int, file: UploadFile = File(...)):
    try:
        file_path = f"{UPLOAD_DIR}/{user_id}_{file.filename}"

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 🔥 async processing
        threading.Thread(
            target=process_pdf_async,
            args=(user_id, file_path),
            daemon=True
        ).start()

        return {
            "status": "success",
            "message": "File uploaded. Processing started."
        }

    except Exception as e:
        print("UPLOAD ERROR:", str(e))
        return {"error": "Upload failed"}


# ---------- GENERATE QUESTION ----------
@router.get("/generate-question/")
async def generate_question_api(user_id: int, topic: str, db: Session = Depends(get_db)):

    vs = load_vector_store(user_id)

    if not vs:
        return {"error": "Upload and process a PDF first"}

    topic = topic.lower().strip()

    # 🔥 FAST CHECK (instant response)
    docs, match_type = retrieve_docs(vs, topic)

    if match_type == "none":
        return {"error": "Try topics related to your uploaded PDF"}

    # 🔥 MULTI QUERY (only if relevant)
    queries = [
        topic,
        f"{topic} concepts",
        f"explain {topic}",
        f"{topic} definition"
    ]

    all_docs = []
    final_match = match_type

    for q in queries:
        docs_q, match_q = retrieve_docs(vs, q)

        if match_q == "strong":
            final_match = "strong"
        elif match_q == "weak" and final_match != "strong":
            final_match = "weak"

        if docs_q:
            all_docs.extend(docs_q)

    # 🔥 REMOVE DUPLICATES
    seen = set()
    unique_docs = []

    for d in all_docs:
        if d.page_content not in seen:
            unique_docs.append(d)
            seen.add(d.page_content)

    docs = unique_docs[:3]

    difficulty = get_next_difficulty(get_user_avg_score(db, user_id))

    q = generate_question(topic, docs, difficulty)

    if "OUT_OF_CONTEXT" in q:
        return {"error": "Try topics related to your uploaded PDF"}

    return {
        "question": q,
        "difficulty": difficulty,
        "confidence": compute_confidence(len(docs)),
        "fallback": final_match == "weak"
    }


# ---------- SUBMIT ANSWER ----------
class AnswerRequest(BaseModel):
    user_id: int
    question: str
    answer: str


@router.post("/submit-answer/")
async def submit_answer(data: AnswerRequest, db: Session = Depends(get_db)):

    vs = load_vector_store(data.user_id)

    if not vs:
        return {"error": "No knowledge base"}

    docs, match_type = retrieve_docs(vs, data.question)

    if match_type == "none":
        return {"error": "Try topics related to your uploaded PDF"}

    raw = evaluate_answer(data.question, data.answer, docs)
    scores = safe_parse_json(raw)

    if not scores:
        raw = evaluate_answer(data.question, data.answer, docs)
        scores = safe_parse_json(raw)

    if not scores:
        return {"error": "Evaluation failed. Try again."}

    scores["overall"] = round(
        (scores["technical"] + scores["depth"] + scores["clarity"]) / 3, 1
    )

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
        "feedback": scores.get("feedback", {}),
        "confidence": compute_confidence(len(docs)),
        "match_type": match_type
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
            "answer": a.answer,
            "technical": a.technical,
            "depth": a.depth,
            "clarity": a.clarity,
            "overall": a.overall
        }
        for a in answers
    ]