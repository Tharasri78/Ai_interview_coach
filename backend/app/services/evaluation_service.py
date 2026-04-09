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

    result = generate_text(prompt, temperature=0.3, max_tokens=250)

    try:
        return json.loads(result)
    except:
        return {
            "scores": {
                "technical": 3,
                "depth": 3,
                "clarity": 3,
                "overall": 3
            },
            "feedback": {
                "issues": "Evaluation failed.",
                "missing": "Could not analyze answer.",
                "ideal": "Provide a structured explanation with examples."
            }
        }