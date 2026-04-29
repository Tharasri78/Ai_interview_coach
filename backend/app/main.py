from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import auth, upload, history, interview, summary

app = FastAPI(title="Interview Coach AI", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# PRELOAD ALL MODELS ON STARTUP
print("Starting server and preloading models...")

# Force import to trigger model loading
try:
    from app.services import rag_service
    print("✓ RAG service ready")
except Exception as e:
    print(f"RAG service error: {e}")

try:
    from app.core import llm
    print("✓ LLM service ready")
except Exception as e:
    print(f"LLM service error: {e}")

print("Server ready - models loaded")

# Routes
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(upload.router, prefix="/upload", tags=["Upload"])
app.include_router(history.router, prefix="/history", tags=["History"])
app.include_router(interview.router, prefix="/interview", tags=["Interview"])
app.include_router(summary.router, prefix="/summary", tags=["Summary"])

@app.get("/")
def root():
    return {"message": "Interview Coach AI API", "status": "ready"}