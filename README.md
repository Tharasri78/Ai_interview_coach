

---

```md
# Prepply — AI-Powered Interview Coach

Prepply is an AI-driven interview preparation system that generates **context-aware technical questions from user-provided materials** and delivers **adaptive evaluation with actionable performance insights**.

---

## Overview

Prepply transforms interview practice into a **personalized feedback loop system**:

- Questions are generated from your own content (PDFs)  
- Difficulty adapts based on performance  
- Feedback improves future questions  

---

## Features

- **Upload Learning Materials**  
  Upload PDF documents to extract relevant concepts  

- **Topic-Based Question Generation**  
  Generate questions from your materials using RAG  

- **AI Answer Evaluation**  
  Get feedback on:
  - Technical accuracy  
  - Depth  
  - Clarity  

- **Adaptive Difficulty**  
  Questions adjust automatically (Easy → Medium → Hard)  

- **Performance Tracking**  
  View history and score breakdown  

- **Performance Summary**  
  - Overall score  
  - Strong vs weak areas  
  - Topic insights  

- **Follow-up Questions**  
  Get deeper questions based on your answers  

- **Fallback Handling**  
  Uses general knowledge when PDF context is unavailable  

---

## Tech Stack

### Frontend
- React.js (Hooks)
- CSS3 (Custom UI)
- Framer Motion
- React Icons

### Backend
- FastAPI
- SQLAlchemy ORM
- SQLite / PostgreSQL

### AI & ML
- LangChain (RAG pipeline)
- FAISS (Vector Store)
- HuggingFace Embeddings
- LLM API (Question generation & evaluation)

---

## System Workflow

```

PDF Upload → Embedding → Vector Store
↓
Topic Input → Semantic Retrieval → Question Generation
↓
User Answer → AI Evaluation → Score Storage
↓
Difficulty Adjustment → Next Question

```

---

## Project Structure

```

prepply/
├── app/
│   ├── api/
│   │   ├── auth.py
│   │   ├── answer.py
│   │   ├── question.py
│   │   ├── history.py
│   │   ├── summary.py
│   │   └── upload.py
│   ├── core/
│   │   └── llm.py
│   ├── db/
│   │   ├── database.py
│   │   └── models.py
│   └── services/
│       ├── evaluation_service.py
│       ├── question_service.py
│       ├── rag_service.py
│       └── difficulty_service.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Summary.jsx
│   │   │   ├── Upload.jsx
│   │   │   ├── Question.jsx
│   │   │   └── Answer.jsx
│   │   ├── api/
│   │   │   └── apiService.js
│   │   └── styles/
│   └── public/
└── requirements.txt

```

---

## Getting Started

### Prerequisites

```

Python 3.9+
Node.js 16+
npm or yarn

````

---

### Backend Setup

```bash
git clone https://github.com/Tharasri78/Ai_interview_coach
cd prepply

python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt
uvicorn app.main:app --reload
````

---

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

---

## Usage

1. Sign up / login
2. Upload a PDF (resume, notes, study material)
3. Enter a topic
4. Generate a question
5. Submit your answer
6. Get AI evaluation
7. Track history and view summary

---

## What Makes This Project Different

* Uses user-specific data instead of generic questions
* Implements adaptive difficulty based on performance
* Combines generation, evaluation, and feedback loop
* Provides actionable insights, not just scores


---

## Conclusion

Prepply is a **context-aware, adaptive interview system** designed to simulate real interview scenarios and improve actual performance.

```


