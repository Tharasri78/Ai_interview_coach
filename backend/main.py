from fastapi import FastAPI
from app.db.database import Base, engine
from app.routes import interview

app = FastAPI()

Base.metadata.create_all(bind=engine)

app.include_router(interview.router)


@app.get("/")
def root():
    return {"message": "AI Interview Coach Running"}