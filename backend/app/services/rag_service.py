import os
import re
import json
from typing import List, Dict, Any

# Storage paths
DATA_DIR = "resume_data"
os.makedirs(DATA_DIR, exist_ok=True)

# In-memory cache for faster access
resume_cache = {}
skills_cache = {}
chunks_cache = {}

# ============ STORAGE FUNCTIONS ============

def get_user_resume_path(user_id):
    """Get file path for user's resume text"""
    return os.path.join(DATA_DIR, f"user_{user_id}_resume.txt")

def get_user_skills_path(user_id):
    """Get file path for user's skills"""
    return os.path.join(DATA_DIR, f"user_{user_id}_skills.json")

def get_user_chunks_path(user_id):
    """Get file path for user's resume chunks"""
    return os.path.join(DATA_DIR, f"user_{user_id}_chunks.json")

# ============ RESUME PROCESSING ============

def process_and_store_resume(user_id: int, file_path: str) -> bool:
    """
    Extract text from PDF and store for later use
    Returns True if successful
    """
    from app.utils.parser import extract_text, split_text
    
    try:
        # Extract text from PDF
        text = extract_text(file_path)
        
        if not text or len(text.strip()) < 50:
            print(f"Failed to extract text for user {user_id}")
            return False
        
        # Store full resume text
        with open(get_user_resume_path(user_id), "w", encoding="utf-8") as f:
            f.write(text)
        
        # Store in cache
        resume_cache[user_id] = text
        
        # Split into chunks for better retrieval
        chunks = split_text(text)
        chunks_list = [chunk.page_content if hasattr(chunk, 'page_content') else chunk for chunk in chunks]
        
        with open(get_user_chunks_path(user_id), "w", encoding="utf-8") as f:
            json.dump(chunks_list, f, indent=2)
        chunks_cache[user_id] = chunks_list
        
        # Extract and store skills
        skills = extract_skills_from_resume(text)
        with open(get_user_skills_path(user_id), "w", encoding="utf-8") as f:
            json.dump(skills, f, indent=2)
        skills_cache[user_id] = skills
        
        print(f"✅ Resume stored for user {user_id}: {len(text)} chars, {len(chunks_list)} chunks, {len(skills)} skills")
        return True
        
    except Exception as e:
        print(f"❌ Error processing resume for user {user_id}: {e}")
        return False

# ============ RETRIEVAL FUNCTIONS ============

def get_resume_text(user_id: int) -> str:
    """Get full resume text for user"""
    # Check cache first
    if user_id in resume_cache:
        return resume_cache[user_id]
    
    # Try to load from file
    try:
        with open(get_user_resume_path(user_id), "r", encoding="utf-8") as f:
            text = f.read()
            resume_cache[user_id] = text
            return text
    except FileNotFoundError:
        return ""
    except Exception as e:
        print(f"Error loading resume for user {user_id}: {e}")
        return ""

def get_user_skills(user_id: int) -> List[str]:
    """Get extracted skills for user"""
    # Check cache
    if user_id in skills_cache:
        return skills_cache[user_id]
    
    # Try to load from file
    try:
        with open(get_user_skills_path(user_id), "r", encoding="utf-8") as f:
            skills = json.load(f)
            skills_cache[user_id] = skills
            return skills
    except FileNotFoundError:
        return []
    except Exception as e:
        print(f"Error loading skills for user {user_id}: {e}")
        return []

def get_resume_chunks(user_id: int) -> List[str]:
    """Get resume text chunks for user"""
    # Check cache
    if user_id in chunks_cache:
        return chunks_cache[user_id]
    
    # Try to load from file
    try:
        with open(get_user_chunks_path(user_id), "r", encoding="utf-8") as f:
            chunks = json.load(f)
            chunks_cache[user_id] = chunks
            return chunks
    except FileNotFoundError:
        return []
    except Exception as e:
        print(f"Error loading chunks for user {user_id}: {e}")
        return []

# ============ SEARCH FUNCTIONS ============

def search_relevant_context(user_id: int, query: str, k: int = 3) -> str:
    """
    Search for relevant context from user's resume using keyword matching
    Returns top k most relevant chunks as a single string
    """
    chunks = get_resume_chunks(user_id)
    
    if not chunks:
        return ""
    
    # Simple keyword-based relevance scoring
    query_words = set(query.lower().split())
    
    scored_chunks = []
    for chunk in chunks:
        chunk_lower = chunk.lower()
        # Count matching words
        score = sum(1 for word in query_words if word in chunk_lower)
        # Bonus for technology matches
        tech_words = ["react", "node", "python", "java", "javascript", "typescript", "aws", "docker"]
        tech_score = sum(1 for tech in tech_words if tech in chunk_lower)
        total_score = score + tech_score * 2
        
        if total_score > 0:
            scored_chunks.append((total_score, chunk))
    
    # Sort by relevance and take top k
    scored_chunks.sort(reverse=True, key=lambda x: x[0])
    top_chunks = [chunk for _, chunk in scored_chunks[:k]]
    
    if not top_chunks:
        # Return first few chunks if no match found
        top_chunks = chunks[:k]
    
    return "\n\n".join(top_chunks)

def get_resume_summary(user_id: int) -> Dict[str, Any]:
    """Get a summary of user's resume for context"""
    text = get_resume_text(user_id)
    skills = get_user_skills(user_id)
    
    if not text:
        return {"has_resume": False, "skills": [], "first_100_chars": ""}
    
    # Extract first few sentences as summary
    sentences = re.split(r'[.!?]+', text)
    summary = ". ".join(sentences[:3]) if sentences else text[:200]
    
    return {
        "has_resume": True,
        "skills": skills,
        "summary": summary[:300] + "...",
        "length": len(text)
    }

# ============ SKILL EXTRACTION ============

def extract_skills_from_resume(text: str) -> List[str]:
    """Extract technical skills from resume text"""
    skills_keywords = [
        # Languages
        "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "Go", "Rust", 
        "PHP", "Ruby", "Swift", "Kotlin", "Scala", "Dart", "R", "MATLAB",
        
        # Frontend
        "React", "Angular", "Vue", "Next.js", "Nuxt", "Svelte", "HTML", "CSS", 
        "Sass", "Tailwind", "Bootstrap", "jQuery", "Redux", "GraphQL", "Apollo",
        
        # Backend
        "Node.js", "Express", "Django", "Flask", "FastAPI", "Spring Boot", "ASP.NET",
        "Laravel", "Rails", "Gin", "Fiber",
        
        # Databases
        "MongoDB", "PostgreSQL", "MySQL", "Redis", "Elasticsearch", "Cassandra",
        "DynamoDB", "Firebase", "SQLite", "Oracle", "SQL Server",
        
        # Cloud & DevOps
        "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "Ansible",
        "Jenkins", "GitLab CI", "GitHub Actions", "CircleCI", "Prometheus", "Grafana",
        
        # Data & ML
        "Machine Learning", "AI", "TensorFlow", "PyTorch", "Pandas", "NumPy",
        "Scikit-learn", "Keras", "OpenCV", "NLP", "Computer Vision",
        
        # Other
        "REST API", "Microservices", "Serverless", "WebSocket", "OAuth", "JWT",
        "Git", "Linux", "Unix", "Agile", "Scrum", "Jira", "Confluence"
    ]
    
    found_skills = []
    text_lower = text.lower()
    
    for skill in skills_keywords:
        if skill.lower() in text_lower:
            found_skills.append(skill)
    
    # Remove duplicates and return
    unique_skills = list(dict.fromkeys(found_skills))
    return unique_skills[:15]  # Return top 15 skills

# ============ DELETE FUNCTIONS ============

def delete_user_resume(user_id: int) -> bool:
    """Delete user's resume data"""
    try:
        # Clear cache
        resume_cache.pop(user_id, None)
        skills_cache.pop(user_id, None)
        chunks_cache.pop(user_id, None)
        
        # Delete files
        for path in [get_user_resume_path(user_id), get_user_skills_path(user_id), get_user_chunks_path(user_id)]:
            if os.path.exists(path):
                os.remove(path)
        
        print(f"Deleted resume data for user {user_id}")
        return True
    except Exception as e:
        print(f"Error deleting resume for user {user_id}: {e}")
        return False

# ============ VECTOR FUNCTIONS (Legacy/Placeholder) ============
# These are kept for compatibility but not used

def create_or_update_vector_store(user_id, chunks):
    """Legacy function - now using file storage"""
    return process_and_store_resume(user_id, None)

def load_vector_store(user_id):
    """Legacy function - returns None"""
    return None

def retrieve_docs(vs, query, k=3):
    """Legacy function - returns empty list"""
    return []

def build_context(docs):
    """Legacy function - returns empty string"""
    return ""