


#  AI-POWERED INTERVIEW COACH

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.10-3776AB?logo=python)](https://python.org/)
[![SQLite](https://img.shields.io/badge/SQLite-003B57?logo=sqlite)](https://sqlite.org/)
[![Groq](https://img.shields.io/badge/Groq-LLM-FF6B6B?logo=groq)](https://groq.com)




**Prepply** is an AI-powered interview preparation platform that generates personalized questions based on your resume, evaluates your answers, and provides actionable feedback to help you ace technical interviews.

## ✨ Features

-  **Resume-Based Questions** - Upload your PDF resume, get personalized questions based on your actual skills and experience
-  **3-Round Interview Flow** - HR → Technical → Deep Dive - mirrors real interview processes at top tech companies
-  **AI-Powered Evaluation** - Get detailed scores on technical accuracy, depth, and clarity with actionable feedback
-  **Coding Challenges** - Solve algorithmic problems with test case validation and instant feedback
-  **Performance Analytics** - Track strengths, weaknesses, and improvement over time with detailed summaries
-  **Real-time Feedback** - Live answer quality hints using STAR method analysis
-  **Progress Tracking** - Visual progress bar and round indicators throughout the interview

##  Tech Stack

### Frontend
- **React 18** - UI framework
- **React Router DOM** - Navigation
- **Axios** - API calls
- **React Icons** - Icons
- **Framer Motion** - Animations
- **CSS Modules** - Styling

### Backend
- **FastAPI** - REST API framework
- **SQLAlchemy** - ORM for database
- **SQLite** - Database
- **Groq LLM** - AI question generation and evaluation
- **PyMuPDF (fitz)** - PDF text extraction
- **LangChain** - Text splitting and RAG
- **Sentence Transformers** - Embeddings for resume search
- **FAISS** - Vector storage

##  Prerequisites

- Node.js (v18 or higher)
- Python (v3.10 or higher)
- Groq API key ([Get one here](https://console.groq.com))

##  Installation

### 1. Clone the repository

```bash
git clone https://github.com/Tharasri78.git

```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo "GROQ_API_KEY=your_api_key_here" > .env

# Initialize database
python -c "from app.db.database import engine, Base; from app.db import models; Base.metadata.create_all(engine)"

# Run backend server
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```


## 📁 Project Structure

```
prepply/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/
│   │   │       ├── auth.py
│   │   │       ├── upload.py
│   │   │       ├── interview.py
│   │   │       ├── history.py
│   │   │       └── summary.py
│   │   ├── services/
│   │   │   ├── interview_service.py
│   │   │   ├── question_service.py
│   │   │   ├── evaluation_service.py
│   │   │   ├── rag_service.py
│   │   │   └── summary_service.py
│   │   ├── db/
│   │   │   ├── database.py
│   │   │   └── models.py
│   │   ├── core/
│   │   │   └── llm.py
│   │   └── utils/
│   │       └── parser.py
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Upload.jsx
│   │   │   ├── InterviewBox.jsx
│   │   │   └── HistoryPanel.jsx
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   ├── Auth.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── Summary.jsx
│   │   ├── api/
│   │   │   └── apiService.js
│   │   └── App.jsx
│   └── package.json
└── README.md
```

## 🔄 Interview Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     6 Questions / 3 Rounds                   │
├─────────────────────────────────────────────────────────────┤
│  Q1  │  HR Round        │ Project-based behavioral question │
│  Q2  │  HR Round        │ Problem-solving & conflict         │
│  Q3  │  Technical Round │ Resume-based technical question    │
│  Q4  │  Technical Round │ General concept question           │
│  Q5  │  Technical Round │ Coding challenge (with test cases) │
│  Q6  │  Deep Dive       │ Adaptive follow-up question        │
└─────────────────────────────────────────────────────────────┘
```

##  API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup/` | User registration |
| POST | `/auth/login/` | User login |
| POST | `/upload/upload-pdf/` | Upload resume PDF |
| POST | `/interview/start-interview/` | Start interview session |
| POST | `/interview/next-step/` | Submit answer, get next question |
| GET | `/history/{user_id}` | Get answer history |
| GET | `/summary/{user_id}` | Get performance summary |

## How It Works

1. **Upload Resume** - Upload your PDF resume. The system extracts text and identifies your skills
2. **Start Interview** - Begin a structured 6-question interview across 3 rounds
3. **Answer Questions** - Write detailed answers. Get real-time quality hints
4. **Receive Feedback** - Get scores (1-10) on technical accuracy, depth, and clarity
5. **Review Summary** - View performance analytics, strengths, and improvement areas

## 🔧 Environment Variables

### Backend (.env)
```env
GROQ_API_KEY=your_groq_api_key_here
```

##👨‍💻 Author
##Tharasri B


---



