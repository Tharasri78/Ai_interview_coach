from sqlalchemy import Column, Integer, String, Float, Text
from .database import Base

# User table
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)


# Answers table (core of your system)
class Answer(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    question = Column(Text)
    answer = Column(Text)

    # scoring system
    technical = Column(Float)
    depth = Column(Float)
    clarity = Column(Float)
    overall = Column(Float)
    
class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    skills = Column(Text)   # store as comma-separated for now    