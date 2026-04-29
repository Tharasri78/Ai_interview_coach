from app.services.question_service import generate_question
from app.services.evaluation_service import evaluate_answer
from app.services.summary_service import save_answer_to_db
from app.services.rag_service import get_user_skills

sessions = {}
TOTAL_QUESTIONS = 6

def start_interview(user_id):
    """Start interview - optimized for speed"""
    
    skills = get_user_skills(user_id)
    
    # Generate first question (HR round) - fast with caching
    first_question = generate_question(
        user_id=user_id,
        round_type="HR",
        difficulty="medium"
    )
    
    sessions[user_id] = {
        "round": 1,
        "question_index": 0,
        "history": [],
        "last_question": first_question,
        "skills": skills
    }
    
    return {
        "question": first_question,
        "round": 1,
        "index": 1,
        "total": TOTAL_QUESTIONS
    }

def next_step(user_id, answer):
    session = sessions.get(user_id)
    
    if not session:
        return {"error": "Session not found"}
    
    # Evaluate answer
    eval_result = evaluate_answer(session["last_question"], answer)
    
    # Save to history
    session["history"].append({
        "question": session["last_question"],
        "answer": answer,
        "round": session["round"],
        "scores": eval_result["scores"]
    })
    
    # Save to database (async, don't wait)
    try:
        save_answer_to_db(user_id, session["last_question"], answer, eval_result["scores"])
    except:
        pass
    
    score = eval_result["scores"]["overall"]
    difficulty = "easy" if score < 4 else "medium" if score < 7 else "hard"
    
    # Update question index
    session["question_index"] += 1
    
    # Check if complete
    if session["question_index"] >= TOTAL_QUESTIONS:
        from app.services.summary_service import generate_summary_from_history
        summary = generate_summary_from_history(session["history"])
        del sessions[user_id]
        return {"finished": True, "summary": summary}
    
    # Determine next round
    current_index = session["question_index"]
    
    if current_index <= 2:
        next_round = 1
        round_type = "HR"
        topic = None
    elif current_index <= 4:
        next_round = 2
        round_type = "TECH"
        skills = session.get("skills", [])
        topic = skills[(current_index - 3) % len(skills)] if skills else "technical concepts"
    else:
        next_round = 3
        round_type = "DEEP"
        topic = None
    
    prev_answer = session["history"][-1]["answer"] if round_type == "DEEP" else None
    
    # Generate next question - fast with caching
    next_question = generate_question(
        user_id=user_id,
        topic=topic,
        difficulty=difficulty,
        round_type=round_type,
        previous_answer=prev_answer
    )
    
    session["round"] = next_round
    session["last_question"] = next_question
    
    return {
        "question": next_question,
        "round": next_round,
        "index": session["question_index"] + 1,
        "total": TOTAL_QUESTIONS,
        "evaluation": eval_result
    }