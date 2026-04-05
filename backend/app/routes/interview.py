from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.database import SessionLocal
from app.db.models import User, UserProfile, Answer

from app.services.resume_parser import extract_text_from_pdf, extract_skills
from app.services.rag_engine import load_vector_store, generate_question_with_llm
from app.services.evaluation import evaluate_answer, parse_evaluation
from app.services.adaptive import get_next_difficulty

router = APIRouter()

# Load vector DB once
vectorstore = load_vector_store()


# ---------------- DB Dependency ----------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------- Utility ----------------
def get_user_avg_score(db, user_id):
    avg = db.query(func.avg(Answer.overall)).filter(Answer.user_id == user_id).scalar()
    return avg or 0


# ---------------- 1. Upload Resume ----------------
@router.post("/upload-resume/")
async def upload_resume(
    name: str,
    email: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    try:
        text = extract_text_from_pdf(file.file)
        skills = extract_skills(text)
    except Exception:
        return {"error": "Failed to process resume"}

    user = db.query(User).filter(User.email == email).first()

    if not user:
        user = User(name=name, email=email)
        db.add(user)
        db.commit()
        db.refresh(user)

    existing_profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()

    if existing_profile:
        existing_profile.skills = ",".join(skills)
    else:
        profile = UserProfile(user_id=user.id, skills=",".join(skills))
        db.add(profile)

    db.commit()

    return {
        "message": "Resume processed",
        "user_id": user.id,
        "skills": skills
    }


# ---------------- 2. Generate Question ----------------
@router.get("/generate-question/")
async def generate_question(
    topic: str,
    db: Session = Depends(get_db),
    user_id: int = 1
):
    avg_score = get_user_avg_score(db, user_id)

    # TEMP (no DB tracking yet)
    current_difficulty = "easy"

    difficulty = get_next_difficulty(avg_score, current_difficulty)

    docs = vectorstore.similarity_search(topic, k=3)
    questions = [doc.page_content for doc in docs]

    new_question = generate_question_with_llm(topic, questions, difficulty)

    return {
        "topic": topic,
        "difficulty": difficulty,
        "question": new_question
    }


# ---------------- 3. Submit Answer ----------------
@router.post("/submit-answer/")
async def submit_answer(
    user_id: int,
    question: str,
    answer: str,
    db: Session = Depends(get_db)
):
    raw_result = evaluate_answer(question, answer)
    scores = parse_evaluation(raw_result)

    new_answer = Answer(
        user_id=user_id,
        question=question,
        answer=answer,
        technical=scores["technical"],
        depth=scores["depth"],
        clarity=scores["clarity"],
        overall=scores["overall"]
    )

    db.add(new_answer)
    db.commit()

    return {
        "scores": scores
    }


# ---------------- 4. Next Question (Adaptive) ----------------
@router.get("/next-question/")
async def next_question(
    user_id: int,
    topic: str,
    db: Session = Depends(get_db)
):
    avg_score = get_user_avg_score(db, user_id)

    # TEMP again
    current_difficulty = "easy"

    difficulty = get_next_difficulty(avg_score, current_difficulty)

    docs = vectorstore.similarity_search(topic, k=3)
    questions = [doc.page_content for doc in docs]

    new_question = generate_question_with_llm(topic, questions, difficulty)

    return {
        "topic": topic,
        "difficulty": difficulty,
        "question": new_question
    }