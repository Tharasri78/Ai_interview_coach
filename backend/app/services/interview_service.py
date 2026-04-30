from app.services.question_service import generate_question_by_type
from app.services.evaluation_service import evaluate_answer
from app.services.summary_service import save_answer_to_db, generate_summary_from_history

sessions = {}
TOTAL_QUESTIONS = 6

def start_interview(user_id):
    """Start interview with first question (Q1 - HR Project Based)"""
    
    first_question = generate_question_by_type(user_id, 0)
    
    sessions[user_id] = {
        "q_index": 0,
        "history": [],
        "current_question": first_question.get("question") if first_question.get("type") == "standard" else first_question.get("data", {}).get("title", ""),
        "coding_question": None,
        "coding_evaluation": None
    }
    
    return {
        "type": first_question.get("type", "standard"),
        "question": first_question.get("question") or first_question.get("data"),
        "round": 1,
        "q_index": 1,
        "total": TOTAL_QUESTIONS
    }

def next_step(user_id, answer):
    """Process answer and get next question"""
    session = sessions.get(user_id)
    if not session:
        return {"error": "Session not found. Please start a new interview."}
    
    q_index = session["q_index"]
    current_question = session.get("current_question", "")
    
    # Evaluate answer
    eval_result = evaluate_answer(current_question, answer)
    
    # SAVE TO DATABASE - THIS WAS MISSING
    try:
        save_answer_to_db(user_id, current_question, answer, eval_result.get("scores", {}))
        print(f"✅ Saved answer for user {user_id}, question {q_index + 1}")
    except Exception as e:
        print(f"❌ Failed to save answer: {e}")
    
    # Save to memory history
    session["history"].append({
        "q_index": q_index,
        "question": current_question,
        "answer": answer,
        "scores": eval_result.get("scores", {})
    })
    
    # Check if interview complete
    if q_index + 1 >= TOTAL_QUESTIONS:
        summary = generate_summary_from_history(session["history"])
        del sessions[user_id]
        return {"finished": True, "summary": summary}
    
    # Get next question
    next_q_index = q_index + 1
    next_question = generate_question_by_type(user_id, next_q_index, "medium", answer)
    
    # Store current question for next evaluation
    if next_question.get("type") == "standard":
        session["current_question"] = next_question.get("question", "")
    else:
        session["current_question"] = next_question.get("data", {}).get("title", "Coding Challenge")
        session["coding_question"] = next_question.get("data")
    
    # Update session
    session["q_index"] = next_q_index
    
    # Calculate round number
    if next_q_index <= 1:
        round_num = 1
    elif next_q_index <= 4:
        round_num = 2
    else:
        round_num = 3
    
    return {
        "type": next_question.get("type", "standard"),
        "question": next_question.get("question") or next_question.get("data"),
        "round": round_num,
        "q_index": next_q_index + 1,
        "total": TOTAL_QUESTIONS,
        "evaluation": eval_result
    }

def get_session(user_id):
    """Get current session for user"""
    return sessions.get(user_id)