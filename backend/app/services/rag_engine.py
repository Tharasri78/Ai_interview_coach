import os
from dotenv import load_dotenv

from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_core.documents import Document
from groq import Groq
load_dotenv()

VECTOR_DB_PATH = "faiss_index"

PRIMARY_MODEL = "llama-3.3-70b-versatile"
FALLBACK_MODEL = "llama-3.1-8b-instant"

# Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def call_llm(prompt):
    try:
        response = client.chat.completions.create(
            model=PRIMARY_MODEL,
            messages=[{"role": "user", "content": prompt}],
        )
        return response.choices[0].message.content

    except Exception:
        print("⚠️ Switching to fallback model...")

        response = client.chat.completions.create(
            model=FALLBACK_MODEL,
            messages=[{"role": "user", "content": prompt}],
        )
        return response.choices[0].message.content


def load_questions():
    file_path = "data/questions.txt"

    with open(file_path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    docs = []

    for line in lines:
        if ":" in line:
            topic, question = line.split(":", 1)
            docs.append(
                Document(
                    page_content=question.strip(),
                    metadata={"topic": topic.strip().lower()}
                )
            )

    return docs


def create_vector_store():
    docs = load_questions()

    embeddings = HuggingFaceEmbeddings(
        model_name="all-MiniLM-L6-v2"
    )

    vectorstore = FAISS.from_documents(docs, embeddings)

    vectorstore.save_local(VECTOR_DB_PATH)


def load_vector_store():
    embeddings = HuggingFaceEmbeddings(
        model_name="all-MiniLM-L6-v2"
    )

    return FAISS.load_local(
        VECTOR_DB_PATH,
        embeddings,
        allow_dangerous_deserialization=True
    )




def generate_question_with_llm(topic, retrieved_questions, difficulty):
    prompt = f"""
You are a technical interview generator.

Topic: {topic}
Difficulty: {difficulty}


Based on:
{chr(10).join(retrieved_questions)}

Rules:
- Focus on ONE concept only
- Match the difficulty level:
  - easy → basic definition
  - medium → explanation or comparison
  - hard → scenario or problem-solving
- Keep it under 20 words
- No explanation
- Output ONLY the question

Example:
What is the purpose of self in Python classes?
"""
    return call_llm(prompt)


       