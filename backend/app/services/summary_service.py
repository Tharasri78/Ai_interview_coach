from app.db.database import SessionLocal
from app.db.models import Answer
from datetime import datetime

from app.db.database import SessionLocal
from app.db.models import Answer
from datetime import datetime

def save_answer_to_db(user_id, question, answer, scores):
    """Save answer to database with correct timestamp"""
    db = SessionLocal()
    try:
        answer_record = Answer(
            user_id=user_id,
            question=question,
            answer=answer,
            technical=scores.get("technical", 0),
            depth=scores.get("depth", 0),
            clarity=scores.get("clarity", 0),
            overall=scores.get("overall", 0),
            created_at=datetime.now()  # Use datetime.now() instead of datetime.utcnow()
        )
        db.add(answer_record)
        db.commit()
        print(f"✅ Saved answer at {datetime.now()} for user {user_id}")
        return True
    except Exception as e:
        print(f"❌ DB Save error: {e}")
        db.rollback()
        return False
    finally:
        db.close()

def generate_summary_from_history(history):
    """Generate summary from session history"""
    if not history:
        return {
            "total": 0,
            "avg_score": 0,
            "breakdown": {"technical": 0, "depth": 0, "clarity": 0},
            "strong": "N/A",
            "weak": "N/A",
            "suggestions": ["Complete a practice session to see your analysis"]
        }
    
    total = len(history)
    
    avg_technical = sum(h["scores"].get("technical", 0) for h in history) / total
    avg_depth = sum(h["scores"].get("depth", 0) for h in history) / total
    avg_clarity = sum(h["scores"].get("clarity", 0) for h in history) / total
    avg_overall = sum(h["scores"].get("overall", 0) for h in history) / total
    
    scores_by_question = [(h["question"], h["scores"].get("overall", 0)) for h in history]
    scores_by_question.sort(key=lambda x: x[1])
    
    weak_question = scores_by_question[0][0] if scores_by_question else "N/A"
    strong_question = scores_by_question[-1][0] if scores_by_question else "N/A"
    
    if len(weak_question) > 60:
        weak_question = weak_question[:57] + "..."
    if len(strong_question) > 60:
        strong_question = strong_question[:57] + "..."
    
    suggestions = []
    if avg_depth < 5:
        suggestions.append("Add more depth - explain WHY and HOW")
    if avg_clarity < 5:
        suggestions.append("Use STAR method: Situation, Task, Action, Result")
    if avg_technical < 5:
        suggestions.append("Include technical details and specific technologies")
    if len(suggestions) == 0:
        suggestions.append("Great job! Keep practicing with harder questions")
    if avg_overall < 6:
        suggestions.append("Provide concrete examples from your experience")
    
    return {
        "total": total,
        "avg_score": round(avg_overall, 1),
        "breakdown": {
            "technical": round(avg_technical, 1),
            "depth": round(avg_depth, 1),
            "clarity": round(avg_clarity, 1)
        },
        "strong": strong_question,
        "weak": weak_question,
        "suggestions": suggestions
    }

def generate_summary(history):
    return generate_summary_from_history(history)

def get_summary_from_db(user_id):
    db = SessionLocal()
    try:
        answers = db.query(Answer).filter(Answer.user_id == user_id).all()
        
        if not answers:
            return {
                "total": 0,
                "avg_score": 0,
                "breakdown": {"technical": 0, "depth": 0, "clarity": 0},
                "strong": "N/A",
                "weak": "N/A",
                "suggestions": ["Complete a practice session to see your analysis"]
            }
        
        history = [
            {
                "question": a.question,
                "answer": a.answer,
                "scores": {
                    "technical": a.technical,
                    "depth": a.depth,
                    "clarity": a.clarity,
                    "overall": a.overall
                }
            }
            for a in answers
        ]
        
        return generate_summary_from_history(history)
    except Exception as e:
        print(f"Get summary error: {e}")
        return {
            "total": 0,
            "avg_score": 0,
            "breakdown": {"technical": 0, "depth": 0, "clarity": 0},
            "strong": "N/A",
            "weak": "N/A",
            "suggestions": ["Error loading summary"]
        }
    finally:
        db.close()