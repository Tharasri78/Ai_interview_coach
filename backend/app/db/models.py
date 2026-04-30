from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Boolean
from datetime import datetime
from .database import Base


# ---------------- USERS ----------------
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)


# ---------------- USER PROFILE ----------------
class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    skills = Column(Text, nullable=True)
    has_uploaded = Column(Boolean, default=False)  # NEW COLUMN
    uploaded_at = Column(DateTime, nullable=True)  # Add this line


# ---------------- ANSWERS ----------------

class Answer(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)

    question = Column(Text)
    answer = Column(Text)

    technical = Column(Float, default=0)
    depth = Column(Float, default=0)
    clarity = Column(Float, default=0)
    overall = Column(Float, default=0)

    created_at = Column(DateTime, default=datetime.now)


# ---------------- INTERVIEW SESSION ----------------
class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))

    current_round = Column(Integer, default=1)
    question_index = Column(Integer, default=0)

    created_at = Column(DateTime, default=datetime.utcnow)