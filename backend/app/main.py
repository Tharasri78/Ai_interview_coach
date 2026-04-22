from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import upload, question, answer, history, auth
from app.db.database import Base, engine
from app.api.routes import summary

#  IMPORT ALL ROUTES PROPERLY
from app.api.routes import upload, question, answer, history

app = FastAPI()

# CORS
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
app.include_router(auth.router)
app.include_router(upload.router)
app.include_router(question.router)
app.include_router(answer.router)
app.include_router(history.router)
app.include_router(summary.router)

@app.get("/")
def root():
    return {"message": "AI Interview Coach Running"}