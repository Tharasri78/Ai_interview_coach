from app.core.llm import generate_text


def generate_followup(question: str, answer: str):

    prompt = f"""
You are a strict technical interviewer.

The candidate answered a question.

Original Question:
{question}

Candidate Answer:
{answer}

Your job:
- Ask ONE follow-up question
- It must go deeper based on the answer
- If answer is weak → clarify basics
- If answer is strong → ask advanced scenario

Rules:
- Return ONLY the question
- No explanation
- No numbering
"""

    try:
        res = generate_text(prompt, temperature=0.7)
        if not res or len(res.strip()) < 10:
            return None
        return res.strip()
    except:
        return None