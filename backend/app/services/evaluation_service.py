from app.core.llm import generate_text
import json
import re

def evaluate_answer(question, answer):

    prompt = f"""
You are a STRICT technical interviewer.

Evaluate the candidate's answer.

Question:
{question}

Answer:
{answer}

Return ONLY raw JSON.
Do NOT use markdown.
Do NOT include ``` or explanations.

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
    "ideal": "...",
    "improved_answer": "..."
  }}
}}

Rules:
- Be brutally honest
- No generic feedback
- "missing" must be bullet-style (comma separated)
- "improved_answer" must be a strong 3–5 line interview answer
- Return ONLY JSON
"""

    result = generate_text(
        prompt,
        temperature=0.3,
        max_tokens=300,
        task="evaluation"
    )

    # ❌ LLM failed
    if not result:
        return default_response("LLM failed")

    try:
        # 🔥 Extract JSON safely
        match = re.search(r"\{.*\}", result, re.DOTALL)
        if not match:
            raise ValueError("No JSON found")

        clean = match.group()

        # 🔥 Remove trailing commas (common LLM bug)
        clean = re.sub(r",\s*}", "}", clean)
        clean = re.sub(r",\s*]", "]", clean)

        parsed = json.loads(clean)

        scores = parsed.get("scores", {})
        feedback = parsed.get("feedback", {})

        return {
            "scores": {
                "technical": scores.get("technical", 0),
                "depth": scores.get("depth", 0),
                "clarity": scores.get("clarity", 0),
                "overall": scores.get("overall", 0),
            },
            "feedback": {
                "issues": feedback.get("issues", ""),
                "missing": feedback.get("missing", ""),
                "ideal": feedback.get("ideal", ""),
                "improved_answer": feedback.get("improved_answer", "")
            }
        }

    except Exception:
        print("JSON PARSE ERROR:", result)
        return default_response("Invalid LLM response")


def default_response(error_msg):
    return {
        "error": error_msg,
        "scores": {
            "technical": 0,
            "depth": 0,
            "clarity": 0,
            "overall": 0
        },
        "feedback": {
            "issues": "Evaluation failed",
            "missing": "",
            "ideal": "",
            "improved_answer": ""
        }
    }