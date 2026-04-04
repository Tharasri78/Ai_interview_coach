from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session
from app.services.resume_parser import extract_text_from_pdf, extract_skills
from app.db.database import SessionLocal
from app.db.models import User, UserProfile

router = APIRouter()


# DB dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/upload-resume/")
async def upload_resume(
    name: str,
    email: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    contents = await file.read()

    text = extract_text_from_pdf(file.file)
    skills = extract_skills(text)

    # check if user exists
    user = db.query(User).filter(User.email == email).first()

    if not user:
        user = User(name=name, email=email)
        db.add(user)
        db.commit()
        db.refresh(user)

    # store profile
    profile = UserProfile(
        user_id=user.id,
        skills=",".join(skills)
    )

    db.add(profile)
    db.commit()

    return {
        "message": "Resume processed",
        "skills": skills
    }