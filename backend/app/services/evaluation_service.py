from app.core.llm import generate_text
import json
import re

def evaluate_answer(question, answer):

    prompt = f"""
You are a strict technical interviewer.

Evaluate the candidate's answer.

Question:
{question}

Answer:
{answer}

Return ONLY raw JSON.
Do NOT use markdown.
Do NOT include ``` or any explanation.
Start with {{ and end with }}.

Format:
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
"""

    result = generate_text(
        prompt,
        temperature=0.3,
        max_tokens=250,
        task="evaluation"
    )

    # ❌ LLM failed
    if not result:
        return {
            "error": "LLM failed",
            "scores": None,
            "feedback": None
        }

    try:
        # 🔥 CRITICAL FIX: extract ONLY JSON
        match = re.search(r"\{.*\}", result, re.DOTALL)

        if not match:
            raise ValueError("No JSON found")

        clean_json = match.group()

        parsed = json.loads(clean_json)

        # 🔥 EXTRA SAFETY (avoid frontend crash)
        if "scores" not in parsed or "feedback" not in parsed:
            raise ValueError("Invalid structure")

        return parsed

    except Exception as e:
        print("JSON PARSE ERROR:", result)

        return {
            "error": "Invalid LLM response",
            "scores": None,
            "feedback": None
        }