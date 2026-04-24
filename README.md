

---

```md
# Prepply - AI Interview Coach

A full-stack AI-powered application designed to help users practice and improve their interview skills through personalized question generation and structured feedback.

The platform allows users to upload learning materials, generate topic-based questions, submit answers, and track performance through a centralized dashboard.

The project demonstrates LLM integration, Retrieval-Augmented Generation (RAG), adaptive difficulty logic, and full-stack development using modern technologies.

---

# Link

Demo  
https://your-demo-link.com  

---

# Key Features

• PDF-based question generation using user content  
• Topic-based question input system  
• AI-powered answer evaluation  

• Scoring based on:
* Technical accuracy  
* Depth  
* Clarity  

• Adaptive difficulty system  
* Easy  
* Medium  
* Hard  

• Performance tracking system  
• History of past attempts  
• Summary dashboard  

• Strong and weak area identification  
• Topic-wise performance insights  
• Fallback question handling (when no PDF context is found)  

---

# Tech Stack

## Frontend

* React.js  
* Vite  
* Axios  
* Framer Motion  
* CSS  

## Backend

* FastAPI  
* SQLAlchemy  
* REST APIs  

## Database

* SQLite  

## AI & ML

* LangChain (RAG)  
* FAISS (Vector Store)  
* HuggingFace Embeddings  
* LLM API  


---

# System Architecture

```

React Client
│
▼
FastAPI Backend
│
▼
Vector Store (FAISS) + Database
│
▼
LLM (Question Generation + Evaluation)

```

1. The frontend handles user interaction and UI.  
2. The backend processes requests and manages logic.  
3. Vector store retrieves relevant document context.  
4. LLM generates questions and evaluates answers.  

---

# Installation & Setup

## 1. Clone Repository

```

git clone [https://github.com/Tharasri78/Ai_interview_coach](https://github.com/Tharasri78/Ai_interview_coach)
cd Ai_interview_coach

```

---

## 2. Run Backend

```

cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

```

Backend runs on:

```

[http://localhost:8000](http://localhost:8000)

```

---

## 3. Run Frontend

```

cd frontend
npm install
npm run dev

```

Frontend runs on:

```

[http://localhost:5173](http://localhost:5173)

```

---



# Author

Thara Sri  
https://github.com/Tharasri78  

---


