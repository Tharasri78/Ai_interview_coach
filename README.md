
# AI Interview Coach

An AI-powered system that helps users practice interview questions using their own study materials.  
The platform generates questions from uploaded PDFs and evaluates answers using a Retrieval-Augmented Generation (RAG) pipeline.

---

# Project Structure

backend/ — FastAPI server, RAG pipeline, evaluation logic  
frontend/ — React application (user interface)  
vector_store/ — FAISS index (embeddings storage)  
uploads/ — uploaded PDFs  

---

# Key Features

• Upload PDF documents (resume, notes, study material)  
• Topic-based question generation  
• AI-based answer evaluation (technical accuracy, depth, clarity)  
• RAG pipeline for context-aware questions  
• Fallback question generation when no document context is found  
• History tracking of past attempts  
• Performance summary and scoring  

---

# Tech Stack

## Backend
- FastAPI  
- Python  
- FAISS (vector database)  
- LangChain (RAG pipeline)  

## Frontend
- React  
- Axios  
- CSS  

## AI / GenAI
- LLM integration for question generation  
- RAG (Retrieval-Augmented Generation)  
- Embeddings for document retrieval  

---

# Requirements

- Python 3.9+  
- Node.js 16+  
- npm  
- API key for LLM (OpenAI / compatible provider)  

---

# Backend — Setup & Run

Go to backend:

```

cd backend

```

Install dependencies:

```

pip install -r requirements.txt

```

Create `.env` file:

```

OPENAI_API_KEY=your_api_key
DATABASE_URL=sqlite:///./app.db

```

Run server:

```

uvicorn main:app --reload

```

Server runs on:

```

[http://localhost:8000](http://localhost:8000)

```

---

# Frontend — Setup & Run

Go to frontend:

```

cd frontend

```

Install dependencies:

```

npm install

```

Start app:

```

npm run dev

```

Frontend runs on:

```

[http://localhost:5173](http://localhost:5173)

```

---

# System Flow

```

User → Upload PDF
↓
Frontend → FastAPI Backend
↓
Text Extraction → Embeddings → FAISS
↓
RAG Retrieval → LLM
↓
Question Generation / Answer Evaluation

```

---

# API Overview

## Question

```

POST /generate-question

```

Generate a question based on topic and document context  

## Answer

```

POST /submit-answer

```

Evaluate answer and return score + feedback  

## History

```

GET /history/{user_id}

```

Retrieve past attempts  

## Summary

```

GET /summary/{user_id}

```

Performance insights  

---

# Environment Variables

## Backend

```

OPENAI_API_KEY=your_api_key
DATABASE_URL=your_database_url

```

## Frontend

```

VITE_API_BASE_URL=[http://localhost:8000](http://localhost:8000)

```

---

# Deployment Notes

- Ensure backend is deployed with HTTPS  
- Update frontend API base URL accordingly  
- Use persistent storage for FAISS index in production  

---

# Author

Thara Sri  

GitHub  
https://github.com/Tharasri78  

---

# License

This project is developed for learning and portfolio purposes.
```

