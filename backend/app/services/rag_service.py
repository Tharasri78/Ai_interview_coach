from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
import os

VECTOR_DB_PATH = "faiss_index"

embedding = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

def get_user_index_path(user_id):
    return f"{VECTOR_DB_PATH}/user_{user_id}"

def create_or_update_vector_store(user_id, chunks):

    path = get_user_index_path(user_id)

    if os.path.exists(path):
        db = FAISS.load_local(path, embedding, allow_dangerous_deserialization=True)
        db.add_texts(chunks)
    else:
        db = FAISS.from_texts(chunks, embedding)

    db.save_local(path)


def load_vector_store(user_id):

    path = get_user_index_path(user_id)

    if not os.path.exists(path):
        return None

    return FAISS.load_local(path, embedding, allow_dangerous_deserialization=True)


def retrieve_docs(vs, query, k=3):
    try:
        docs = vs.similarity_search(query, k=k)
        return docs
    except:
        return []