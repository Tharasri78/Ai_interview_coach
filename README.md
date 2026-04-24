
---

```md
# Prepply — AI Interview Coach

<p align="center">
  <b>AI-powered interview preparation system using RAG + adaptive evaluation</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Backend-FastAPI-green?style=for-the-badge" />
  <img src="https://img.shields.io/badge/AI-RAG%20%7C%20LLM-purple?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Database-SQLite-orange?style=for-the-badge" />
</p>

---

## Overview

Prepply is a full-stack AI system that generates **context-aware interview questions from user-provided materials** and evaluates answers using a **multi-dimensional scoring model**.

Unlike static interview tools, it creates a **continuous feedback loop**:
- Generate → Answer → Evaluate → Improve → Repeat

---

## Key Features

- **Context-Aware Question Generation (RAG)**  
  Generates questions from uploaded PDFs  

- **Adaptive Difficulty Engine**  
  Automatically adjusts complexity (Easy → Medium → Hard)  

- **AI Answer Evaluation**  
  - Technical accuracy  
  - Depth of explanation  
  - Clarity  

- **Performance Tracking**  
  - History of attempts  
  - Score breakdown  

- **Summary Dashboard**  
  - Strong vs weak areas  
  - Topic-wise insights  

- **Fallback Handling**  
  Generates general questions when context is unavailable  

---

## System Architecture

```

User Input
↓
Topic Processing
↓
Vector Retrieval (FAISS)
↓
LLM Question Generation
↓
User Answer
↓
LLM Evaluation
↓
Score + Feedback
↓
Adaptive Difficulty Update

```

---

## Tech Stack

### Frontend
- React.js  
- Vite  
- Axios  
- Framer Motion  
- CSS  

### Backend
- FastAPI  
- SQLAlchemy  

### Database
- SQLite  

### AI & ML
- LangChain (RAG pipeline)  
- FAISS (Vector Store)  
- HuggingFace Embeddings  
- LLM API  

---

## Project Structure

```

prepply/
├── backend/
│   ├── api/
│   ├── services/
│   ├── db/
│   └── core/
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── api/
│   └── styles/

````

---

## Installation

### Backend
```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
````

### Frontend

```bash
npm install
npm run dev
```

---

## What Makes This Different

* Uses **user-specific data instead of generic questions**
* Implements **adaptive interview flow**
* Combines **RAG + evaluation + feedback loop**
* Provides **actionable improvement insights**

---

## Author

Thara Sri
[https://github.com/Tharasri78](https://github.com/Tharasri78)

---

