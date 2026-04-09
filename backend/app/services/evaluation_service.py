from app.core.llm import generate_text
import json

def evaluate_answer(question, answer):

    prompt = f"""
You are a strict technical interviewer.

Evaluate the candidate's answer.

Question:
{question}

Answer:
{answer}

Return ONLY valid JSON in this format:

{{
  "scores": {{
    "technical": X,
    "depth": X,
    "clarity": X,
    "overall": X
  }},
  "feedback": {{
    "issues": "...",
    "missing": "...",
    "ideal": "..."
  }}
}}

Scoring rules:
- technical: correctness (0-10)
- depth: explanation depth (0-10)
- clarity: communication (0-10)
- overall: average (rounded)

Be strict:
- vague answers → low score
- incomplete answers → penalize
- no explanation → very low score

DO NOT return anything except JSON.
"""

    result = generate_text(prompt, temperature=0.3, max_tokens=250,  task="evaluation")

    if not result:
     return {
        "error": "LLM failed",
        "scores": None,
        "feedback": None
    }
    try:
        return json.loads(result)
    except Exception as e:
        print("JSON PARSE ERROR:", result)
        return {
            "error": "Invalid LLM response",
            "scores": None,
            "feedback": None
    }