from fastapi import APIRouter, UploadFile, File
import shutil, os, threading
from app.services.rag_service import create_or_update_vector_store
from app.utils.parser import extract_text, split_text

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def process_pdf_background(user_id, file_path):
    text = extract_text(file_path)
    chunks = split_text(text)
    create_or_update_vector_store(user_id, chunks)

@router.post("/upload-pdf/")
async def upload_pdf(user_id: int, file: UploadFile = File(...)):

    file_path = f"{UPLOAD_DIR}/{user_id}_{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 🔥 run in background
    threading.Thread(
        target=process_pdf_background,
        args=(user_id, file_path)
    ).start()

    return {
        "status": "success",
        "message": "Upload successful."
    }