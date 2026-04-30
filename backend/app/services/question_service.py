from app.core.llm import generate_text
from app.services.rag_service import get_resume_text, get_user_skills
import concurrent.futures
import random

def generate_question_by_type(user_id, q_index, difficulty="medium", previous_answer=None):
    """Generate question based on exact flow"""
    
    resume_text = get_resume_text(user_id)
    skills = get_user_skills(user_id)
    skills_text = ", ".join(skills[:5]) if skills else "software development"
    context = resume_text[:1200] if resume_text else ""
    
    # Q0: HR - Project-based
    if q_index == 0:
        prompt = f"""Based on this resume, ask ONE project-based behavioral question.

Resume: {context if context else "No resume provided"}

Return ONLY the question text."""
    
    # Q1: HR - Problem-solving
    elif q_index == 1:
        prompt = f"""Ask ONE problem-solving or conflict resolution question.

Return ONLY the question text."""
    
    # Q2: TECH - Resume-based
    elif q_index == 2:
        prompt = f"""Ask ONE technical question based on candidate's resume.

Skills: {skills_text}
Difficulty: {difficulty}

Return ONLY the question text."""
    
    # Q3: TECH - General concept
    elif q_index == 3:
        topics = ["API design", "database optimization", "caching strategies", "authentication flows"]
        topic = random.choice(topics)
        prompt = f"""Ask ONE {difficulty} level technical question about {topic}.

Return ONLY the question text."""
    
    # Q4: TECH - Coding (Text-based, no run tests)
    elif q_index == 4:
        prompt = f"""Ask ONE coding algorithm question that the candidate needs to explain with logic.

Candidate Skills: {skills_text}
Difficulty: {difficulty}

The candidate should explain their approach, time complexity, and edge cases.

Return ONLY the question text.

Example: Write a function to check if a string is a palindrome. Explain your approach and complexity."""
    
    # Q5: DEEP - Follow-up
    elif q_index == 5:
        prev = previous_answer[:300] if previous_answer else ""
        prompt = f"""Based on candidate's answer: {prev}
Ask ONE follow-up question that tests deeper understanding.

Return ONLY the question text."""
    
    else:
        return {"type": "standard", "question": "Describe your approach to solving complex problems."}
    
    # Generate question with timeout
    try:
        with concurrent.futures.ThreadPoolExecutor() as executor:
            future = executor.submit(generate_text, prompt, 0.7, 200)
            question = future.result(timeout=5)
    except:
        fallbacks = {
            0: "Describe a challenging technical project you worked on.",
            1: "Tell me about a time you had to debug a critical issue.",
            2: f"Explain how you would use {skills_text} to solve a real problem.",
            3: "Explain a concept you recently learned and how you applied it.",
            4: "Write a function to reverse a string. Explain your approach and complexity.",
            5: "What would you improve about your previous answer?"
        }
        return {"type": "standard", "question": fallbacks.get(q_index, "Describe your technical experience.")}
    
    if question and len(question.strip()) > 10:
        question = question.strip().strip('"').strip("'")
        return {"type": "standard", "question": question}
    
    return {"type": "standard", "question": "Describe your approach to solving technical problems."}