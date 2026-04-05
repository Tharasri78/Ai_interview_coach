import os
from dotenv import load_dotenv
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pypdf import PdfReader
from groq import Groq

load_dotenv()

PRIMARY_MODEL = "llama-3.3-70b-versatile"
FALLBACK_MODEL = "llama-3.1-8b-instant"

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


# ---------- LLM ----------
def call_llm(prompt):
    try:
        res = client.chat.completions.create(
            model=PRIMARY_MODEL,
            messages=[{"role": "user", "content": prompt}],
        )
        return res.choices[0].message.content
    except:
        res = client.chat.completions.create(
            model=FALLBACK_MODEL,
            messages=[{"role": "user", "content": prompt}],
        )
        return res.choices[0].message.content


# ---------- PDF ----------
def load_pdf(file_path):
    reader = PdfReader(file_path)
    return "".join([p.extract_text() or "" for p in reader.pages])


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

    docs = [
        Document(
            page_content=chunk,
            metadata={"source": f"chunk_{i}"}
        )
        for i, chunk in enumerate(chunks)
    ]

    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

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

    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    return FAISS.load_local(db_path, embeddings, allow_dangerous_deserialization=True)


# ---------- RETRIEVAL ----------
def retrieve_docs(vs, query, k=6):
    results = vs.similarity_search_with_score(query, k=k)

    if not results:
        return []

    results = sorted(results, key=lambda x: x[1])
    docs = [doc for doc, score in results[:4]]

    return docs


# ---------- CONFIDENCE ----------
def compute_confidence(num_docs):
    if num_docs >= 4:
        return "high"
    elif num_docs >= 2:
        return "medium"
    else:
        return "low"


# ---------- QUESTION ----------
def generate_question(topic, docs, difficulty):
    if not docs:
        return "No relevant content found"

    context = "\n\n".join([d.page_content for d in docs])

    prompt = f"""
STRICT MODE

Topic: {topic}
Difficulty: {difficulty}

Context:
{context}

Rules:
- Use ONLY context
- No hallucination
- Keep under 20 words

Return ONLY question.
"""

    return call_llm(prompt)


# ---------- EVALUATION ----------
def evaluate_answer(question, answer, docs):
    if not docs:
        return None

    context = "\n\n".join([d.page_content for d in docs])
     
    prompt = f"""
STRICT MODE

Question: {question}
Answer: {answer}

Reference:
{context}

Evaluation Rules:
- Use reference as support but allow correct external knowledge
- DO NOT reward vague or one-line answers
- Answers must explain "what + how + purpose"
- If answer is too short (less than 1 meaningful sentence), score MUST be <= 4
- If answer lacks explanation, max score = 5
- Only detailed answers can score above 7

Scoring Guide (0–10):
- 9–10: Detailed, complete explanation with technical clarity
- 7–8: Good explanation with minor gaps
- 5–6: Basic definition, limited depth
- 3–4: Very shallow or incomplete
- 0–2: Incorrect or irrelevant

Return ONLY JSON:
{{
 "technical": number,
 "depth": number,
 "clarity": number,
 "overall": number,
 "feedback": "short feedback",
 "missing": "only key missing points"
}}
"""


    return call_llm(prompt)