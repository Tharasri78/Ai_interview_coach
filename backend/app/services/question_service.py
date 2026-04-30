from app.core.llm import generate_text
from app.services.rag_service import get_resume_text, get_user_skills
import concurrent.futures
import random

def generate_question_by_type(user_id, q_index, difficulty="medium", previous_answer=None):
    """Generate question based on exact flow with professional HR and Deep Dive"""
    
    resume_text = get_resume_text(user_id)
    skills = get_user_skills(user_id)
    skills_text = ", ".join(skills[:5]) if skills else "software development"
    context = resume_text[:1200] if resume_text else ""
    
    # Q0: HR - Project-based (Professional)
    if q_index == 0:
        prompt = f"""You are a technical hiring manager. Based on this candidate's resume, ask ONE specific project-based question.

Resume: {context if context else "No resume provided"}
Skills: {skills_text}

Requirements:
- Ask about a SPECIFIC technology or project from their resume
- Focus on: technical challenges, architecture decisions, or problem-solving
- NO business or profit-related questions
- Be professional and relevant to software engineering

Return ONLY the question text.

Examples:
- "I see you built a project with {skills[0] if skills else 'React'}. What was the most challenging technical problem you solved?"
- "Your resume mentions {skills[1] if len(skills) > 1 else 'backend development'}. How did you ensure code quality and testing?"
- "Tell me about a technical decision you made that significantly improved performance.""" 
    
    # Q1: HR - Professional Behavioral (No profit/loss)
    elif q_index == 1:
        prompt = f"""You are a technical hiring manager. Ask ONE professional behavioral question.

Candidate's Skills: {skills_text}

Requirements:
- Focus on: teamwork, conflict resolution, ownership, learning from mistakes
- Ask about REAL software engineering situations
- NO business, profit, or company financial questions
- Professional and relevant to tech roles

Return ONLY the question text.

Examples:
- "Tell me about a time you had to debug a production issue. What was your approach?"
- "Describe a situation where you disagreed with a teammate's technical approach. How was it resolved?"
- "Tell me about a mistake you made in code. What did you learn from it?"
- "How do you handle technical feedback during code reviews?"""
    
    # Q2: TECH - Resume-based
    elif q_index == 2:
        prompt = f"""Ask ONE technical question based on candidate's resume.

Resume: {context[:800] if context else "No resume provided"}
Skills: {skills_text}
Difficulty: {difficulty}

Requirements:
- Question must reference a SPECIFIC skill from their resume
- Make it practical and scenario-based
- {difficulty.upper()} level depth expected

Return ONLY the question text.

Example: "In your {skills[0] if skills else 'Node.js'} project, how did you handle async operations and ensure scalability?"""
    
    # Q3: TECH - General concept
    elif q_index == 3:
        topics = ["API design", "database optimization", "caching strategies", "authentication flows", "error handling", "testing strategies"]
        topic = random.choice(topics)
        prompt = f"""Ask ONE {difficulty} level technical interview question about {topic}.

Requirements:
- Core computer science or software engineering principle
- {difficulty.upper()} level depth
- Real-world application context

Return ONLY the question text.

Example: "How does caching improve performance, and what are the challenges of cache invalidation?"""
    
    # Q4: TECH - Coding
    elif q_index == 4:
        prompt = f"""Ask ONE coding algorithm question.

Skills: {skills_text}
Difficulty: {difficulty}

The candidate should explain their approach, time complexity, and edge cases.

Return ONLY the question text.

Example: "Write a function to check if a string is a palindrome. Explain your approach and complexity."""
    
    # Q5: DEEP - Professional Follow-up (No random questions)
    elif q_index == 5:
        prompt = f"""Based on the candidate's previous answer, ask ONE professional follow-up question.

Candidate's Previous Answer: {previous_answer[:500] if previous_answer else "No previous answer"}
Candidate's Skills: {skills_text}

Requirements:
- Ask about: trade-offs, edge cases, scalability, or alternative approaches
- Challenge their technical decision
- Push them to think deeper about their solution
- MUST be relevant to their previous answer

Return ONLY the question text.

Examples:
- "What would happen if you needed to handle 10x more traffic? How would your solution change?"
- "What are the trade-offs between your approach and an alternative?"
- "Can you think of an edge case where your solution might fail?"
- "How would you test that solution thoroughly?"""
    
    else:
        return {"type": "standard", "question": "Describe your approach to solving complex technical problems."}
    
    # Generate question with timeout
    try:
        with concurrent.futures.ThreadPoolExecutor() as executor:
            future = executor.submit(generate_text, prompt, 0.7, 200)
            question = future.result(timeout=5)
    except concurrent.futures.TimeoutError:
        print(f"Timeout generating question for index {q_index}")
        fallbacks = get_fallback_question(q_index, skills_text, skills)
        return {"type": "standard", "question": fallbacks}
    except Exception as e:
        print(f"Question generation error: {e}")
        fallbacks = get_fallback_question(q_index, skills_text, skills)
        return {"type": "standard", "question": fallbacks}
    
    if question and len(question.strip()) > 10:
        question = question.strip().strip('"').strip("'")
        return {"type": "standard", "question": question}
    
    fallbacks = get_fallback_question(q_index, skills_text, skills)
    return {"type": "standard", "question": fallbacks}


def get_fallback_question(q_index, skills_text, skills):
    """Professional fallback questions - NO profit/business questions"""
    primary_skill = skills[0] if skills else "software development"
    
    fallbacks = {
        0: f"Describe a technical challenge you faced while working with {primary_skill} and how you solved it.",
        1: "Tell me about a time you had to resolve a technical disagreement with a teammate.",
        2: f"Explain your approach to debugging and testing in {primary_skill} projects.",
        3: "Describe a technical concept you recently learned and how you applied it.",
        4: "Write a function to find the first non-repeating character in a string. Explain your approach.",
        5: "What would you improve about your previous answer? What alternative approaches exist?"
    }
    
    return fallbacks.get(q_index, "Describe your approach to solving technical problems.")