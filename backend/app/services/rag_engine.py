import os
from dotenv import load_dotenv

from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain.docstore.document import Document

load_dotenv()

VECTOR_DB_PATH = "faiss_index"


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