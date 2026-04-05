from sqlalchemy import Column, Integer, String, Float, Text
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer)
    skills = Column(Text)


class Answer(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer)

    question = Column(Text)
    answer = Column(Text)

    technical = Column(Float)
    depth = Column(Float)
    clarity = Column(Float)
    overall = Column(Float)