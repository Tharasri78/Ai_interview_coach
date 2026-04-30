from fastapi import APIRouter
from pydantic import BaseModel
from app.services.interview_service import start_interview, next_step

router = APIRouter()

class StartRequest(BaseModel):
    user_id: int

class NextRequest(BaseModel):
    user_id: int
    answer: str

@router.post("/start-interview/")
def start(req: StartRequest):
    return start_interview(req.user_id)

@router.post("/next-step/")
def next(req: NextRequest):
    return next_step(req.user_id, req.answer)