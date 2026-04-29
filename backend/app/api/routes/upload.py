from fastapi import APIRouter, UploadFile, File, BackgroundTasks, Depends
import shutil
import os
from datetime import datetime

from app.services.rag_service import process_and_store_resume, get_resume_summary
from app.db.database import get_db
from app.db.models import UserProfile
from sqlalchemy.orm import Session

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def process_pdf_background(user_id: int, file_path: str, original_filename: str):
    """Background task to process PDF and store resume"""
    try:
        print(f"📄 Processing resume for user {user_id}: {original_filename}")
        
        # Process and store resume
        success = process_and_store_resume(user_id, file_path)
        
        if success:
            print(f"✅ Resume processed successfully for user {user_id}")
        else:
            print(f"❌ Failed to process resume for user {user_id}")
            
    except Exception as e:
        print(f"❌ Error processing PDF for user {user_id}: {e}")
    finally:
        # Clean up temp file
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
        except:
            pass


@router.post("/upload-pdf/")
async def upload_pdf(
    user_id: int,
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = None,
    db: Session = Depends(get_db)
):
    """
    Upload PDF resume for a user
    - Validates file type
    - Saves temporarily
    - Processes in background
    - Updates user profile
    """
    
    # Validate file type
    if not file.filename.endswith('.pdf'):
        return {
            "status": "error",
            "message": "Only PDF files are allowed"
        }
    
    # Create temp file path
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    file_path = f"{UPLOAD_DIR}/temp_{user_id}_{timestamp}_{file.filename}"
    
    # Save uploaded file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        return {
            "status": "error",
            "message": f"Failed to save file: {str(e)}"
        }
    
    # Process in background
    if background_tasks:
        background_tasks.add_task(process_pdf_background, user_id, file_path, file.filename)
    else:
        # Fallback to sync processing
        process_pdf_background(user_id, file_path, file.filename)
    
    # Update user profile to mark as uploaded
    try:
        profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        if not profile:
            profile = UserProfile(user_id=user_id)
            db.add(profile)
        
        profile.has_uploaded = True
        profile.uploaded_at = datetime.utcnow()
        db.commit()
    except Exception as e:
        print(f"Error updating profile: {e}")
    
    return {
        "status": "success",
        "message": "Resume uploaded successfully. Processing in background."
    }


@router.get("/status/{user_id}")
async def get_upload_status(user_id: int, db: Session = Depends(get_db)):
    """Check if user has uploaded resume and get summary"""
    
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    has_uploaded = profile.has_uploaded if profile else False
    
    # Get resume summary if available
    resume_summary = get_resume_summary(user_id) if has_uploaded else None
    
    return {
        "has_uploaded": has_uploaded,
        "resume_summary": resume_summary
    }


@router.delete("/{user_id}")
async def delete_resume(user_id: int, db: Session = Depends(get_db)):
    """Delete user's uploaded resume"""
    from app.services.rag_service import delete_user_resume
    
    success = delete_user_resume(user_id)
    
    if success:
        # Update profile
        profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        if profile:
            profile.has_uploaded = False
            db.commit()
        
        return {
            "status": "success",
            "message": "Resume deleted successfully"
        }
    else:
        return {
            "status": "error",
            "message": "Failed to delete resume"
        }