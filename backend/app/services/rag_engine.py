import os
from dotenv import load_dotenv
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pypdf import PdfReader
from groq import Groq

load_dotenv()

PRIMARY_MODEL = "llama-3.1-8b-instant"
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# 🔥 LOAD EMBEDDINGS ONCE (IMPORTANT)
embeddings = HuggingFaceEmbeddings(
    model_name="all-MiniLM-L6-v2",
    model_kwargs={"device": "cpu"},
    encode_kwargs={"normalize_embeddings": False}
)

# ---------- LLM ----------
def call_llm(prompt):
    try:
        res = client.chat.completions.create(
            model=PRIMARY_MODEL,
            messages=[{"role": "user", "content": prompt}],
            timeout=5
        )
        return res.choices[0].message.content
    except Exception as e:
        print("LLM ERROR:", str(e))
        return "OUT_OF_CONTEXT"


# ---------- PDF ----------
def load_pdf(file_path):
    reader = PdfReader(file_path)
    text = ""

    for page in reader.pages:
        t = page.extract_text()
        if t:
            text += t

    if not text.strip():
        raise ValueError("PDF has no readable text")

    return text


def split_text(text):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=100
    )
    return splitter.split_text(text)


# ---------- VECTOR ----------
def get_user_db_path(user_id):
    return f"faiss_index/user_{user_id}"


def create_or_update_vector_store(user_id, pdf_path):
    db_path = get_user_db_path(user_id)

    text = load_pdf(pdf_path)
    chunks = split_text(text)

    print("TEXT LENGTH:", len(text))
    print("CHUNKS:", len(chunks))

    docs = [
        Document(page_content=c, metadata={"id": i})
        for i, c in enumerate(chunks)
    ]

    try:
        vs = FAISS.load_local(db_path, embeddings, allow_dangerous_deserialization=True)
        vs.add_documents(docs)
    except:
        vs = FAISS.from_documents(docs, embeddings)

    vs.save_local(db_path)


def load_vector_store(user_id):
    db_path = get_user_db_path(user_id)

    if not os.path.exists(db_path):
        return None

    return FAISS.load_local(db_path, embeddings, allow_dangerous_deserialization=True)


# ---------- RETRIEVAL ----------
def retrieve_docs(vs, query, k=5):
    results = vs.similarity_search_with_score(query, k=k)

    if not results:
        return [], "none"

    docs = [doc for doc, score in results]
    best_score = results[0][1]

    # 🔥 RELAXED THRESHOLDS (IMPORTANT FIX)
    if best_score < 0.8:
        return docs[:3], "strong"
    elif best_score < 2.0:
        return docs[:2], "weak"
    else:
        # 🔥 fallback → still return docs (fix for "java")
        return docs[:2], "weak"


# ---------- CONFIDENCE ----------
def compute_confidence(n):
    if n >= 3:
        return "high"
    elif n >= 2:
        return "medium"
    return "low"


# ---------- QUESTION ----------
def generate_question(topic, docs, difficulty):
    if not docs:
        return "OUT_OF_CONTEXT"

    context = "\n\n".join([d.page_content[:100] for d in docs])

    prompt = f"""
You are an interview question generator.

Topic: {topic}

Context:
{context}

RULES:
- Use ONLY the context
- If somewhat related → still generate question
- If totally unrelated → return OUT_OF_CONTEXT
- Keep it clear and interview-style

Return ONLY the question.
"""

    return call_llm(prompt)


# ---------- EVALUATION ----------
def evaluate_answer(question, answer, docs):
    if not docs:
        return None

    context = "\n\n".join([d.page_content[:200] for d in docs])

    prompt = f"""
You are an interview evaluator.

Question: {question}
Answer: {answer}

Reference:
{context}

Evaluate fairly.

Rules:
- Reward partial correctness
- Do NOT be overly strict
- Accept short answers if correct

Return JSON:

{{
  "technical": 0,
  "depth": 0,
  "clarity": 0,
  "feedback": {{
    "issues": "",
    "missing": "",
    "ideal": ""
  }}
}}
"""

    return call_llm(prompt)