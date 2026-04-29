# app/utils/parser.py
import re
from typing import List

def extract_text(file_path: str) -> str:
    """
    Extract text from PDF file using PyMuPDF (fitz)
    """
    try:
        import fitz  # PyMuPDF
        doc = fitz.open(file_path)
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        return text if text.strip() else ""
    except ImportError:
        print("PyMuPDF (fitz) not installed. Run: pip install pymupdf")
        return ""
    except Exception as e:
        print(f"PDF extraction error: {e}")
        return ""

def split_text(text: str, chunk_size: int = 500, chunk_overlap: int = 50) -> List:
    """
    Split text into chunks for RAG without LangChain dependency
    """
    if not text:
        return []
    
    # Simple chunking by sentence boundaries
    sentences = re.split(r'(?<=[.!?])\s+', text)
    
    chunks = []
    current_chunk = ""
    
    for sentence in sentences:
        # If adding this sentence would exceed chunk size
        if len(current_chunk) + len(sentence) > chunk_size and current_chunk:
            chunks.append(current_chunk)
            # Start new chunk with overlap from previous chunk
            overlap_text = current_chunk[-chunk_overlap:] if chunk_overlap > 0 else ""
            current_chunk = overlap_text + " " + sentence if overlap_text else sentence
        else:
            if current_chunk:
                current_chunk += " " + sentence
            else:
                current_chunk = sentence
    
    # Add last chunk
    if current_chunk:
        chunks.append(current_chunk)
    
    # Convert to Document objects for LangChain compatibility
    try:
        from langchain.schema import Document
        return [Document(page_content=chunk) for chunk in chunks]
    except ImportError:
        # If LangChain not available, return as list of strings
        return chunks

def extract_skills_from_text(text: str) -> list:
    """Extract skills from resume text"""
    skills_keywords = [
        "React", "Node.js", "Python", "Java", "JavaScript", "TypeScript",
        "MongoDB", "PostgreSQL", "MySQL", "AWS", "Docker", "Kubernetes", 
        "GraphQL", "REST API", "Machine Learning", "AI", "TensorFlow", 
        "PyTorch", "Flask", "Django", "FastAPI", "Vue", "Angular", "Next.js",
        "Git", "CI/CD", "Redis", "Elasticsearch", "Kafka", "RabbitMQ",
        "HTML", "CSS", "Sass", "Tailwind", "Bootstrap", "jQuery",
        "C++", "C#", "Go", "Rust", "PHP", "Ruby", "Swift", "Kotlin"
    ]
    
    found_skills = []
    text_lower = text.lower()
    
    for skill in skills_keywords:
        if skill.lower() in text_lower:
            found_skills.append(skill)
    
    return found_skills[:10]  # Return top 10 skills


# Optional: Create a simple Document class if LangChain not available
class SimpleDocument:
    def __init__(self, page_content):
        self.page_content = page_content