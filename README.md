
```
#  Prepply - AI-Powered Interview Coach

Prepply is an intelligent interview preparation platform that generates personalized questions from your learning materials and provides instant AI feedback on your answers.

##  Features

-  **Upload Learning Materials** - Upload PDF documents to extract relevant concepts
-  **Topic-Based Questions** - Generate questions on specific topics from your materials
-  **AI Answer Evaluation** - Get scored feedback on technical accuracy, depth, and clarity
-  **Performance Tracking** - View detailed history and performance summaries
-  **Adaptive Difficulty** - Questions adjust to your skill level (Easy/Medium/Hard)
-  **Gap Identification** - Understand missing concepts in your answers
-  **Follow-up Questions** - Get deeper questions based on your responses

## 🛠️ Tech Stack

### Frontend
- React.js with Hooks
- CSS3 with modern styling
- Framer Motion for animations
- React Icons

### Backend
- FastAPI (Python)
- SQLAlchemy ORM
- SQLite/PostgreSQL

### AI & ML
- LangChain for RAG (Retrieval Augmented Generation)
- FAISS for vector storage
- HuggingFace Embeddings
- LLM integration for question generation & evaluation

##  Getting Started

### Prerequisites

```bash
Python 3.9+
Node.js 16+
npm or yarn
```

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/Tharasri78/Ai_interview_coach
cd prepply

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn app.main:app --reload
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

##  Project Structure

```
prepply/
├── app/
│   ├── api/              # API endpoints
│   │   ├── auth.py       # Authentication
│   │   ├── answer.py     # Answer submission
│   │   ├── question.py   # Question generation
│   │   ├── history.py    # User history
│   │   ├── summary.py    # Performance summary
│   │   └── upload.py     # PDF upload
│   ├── core/             # Core services
│   │   └── llm.py        # LLM integration
│   ├── db/               # Database
│   │   ├── database.py   # DB connection
│   │   └── models.py     # SQLAlchemy models
│   └── services/         # Business logic
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

## Usage

1. **Sign Up / Login** - Create your account
2. **Upload PDF** - Upload your learning material (resume, notes, study guide)
3. **Generate Question** - Enter a topic to get an AI-generated question
4. **Submit Answer** - Write your answer and get instant feedback
5. **Review History** - Track your progress over time
6. **View Summary** - See your strengths and weaknesses






