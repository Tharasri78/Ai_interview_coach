from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import Base, engine
from app.routes import interview

app = FastAPI()

# ✅ CORS MUST BE FIRST
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB
Base.metadata.create_all(bind=engine)

# ROUTES
app.include_router(interview.router)


@app.get("/")
def root():
    return {"message": "AI Interview Coach Running"}