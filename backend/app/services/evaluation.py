from groq import Groq
import os
import json
from dotenv import load_dotenv

load_dotenv()

PRIMARY_MODEL = "llama-3.3-70b-versatile"
FALLBACK_MODEL = "llama-3.1-8b-instant"

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


# ---------- SAFE LLM CALL ----------
def call_llm(prompt):
    try:
        response = client.chat.completions.create(
            model=PRIMARY_MODEL,
            messages=[{"role": "user", "content": prompt}],
        )
        return response.choices[0].message.content

    except Exception:
        print("⚠️ Primary failed, using fallback...")
        response = client.chat.completions.create(
            model=FALLBACK_MODEL,
            messages=[{"role": "user", "content": prompt}],
        )
        return response.choices[0].message.content


# ---------- STRICT EVALUATION ----------
def evaluate_answer(question, answer):
    prompt = f"""
You are a strict technical interviewer.

Question: {question}
Answer: {answer}

Evaluate using these rules:
- Technical correctness (0-10)
- Depth (0-10)
- Clarity (0-10)

IMPORTANT:
- Return ONLY valid JSON
- No text outside JSON
- All values must be integers between 0 and 10

Format:
{{
    "technical": 0,
    "depth": 0,
    "clarity": 0,
    "overall": 0
}}
"""

    return call_llm(prompt)


# ---------- VALIDATION + RETRY ----------
def parse_evaluation(response_text):
    try:
        data = json.loads(response_text)

        # Validate keys
        required_keys = ["technical", "depth", "clarity", "overall"]
        for key in required_keys:
            if key not in data:
                raise ValueError("Missing key")

            # Clamp values between 0–10
            data[key] = max(0, min(10, int(data[key])))

        return data

    except Exception:
        print("⚠️ Invalid JSON, retrying once...")

        # Retry once with stricter prompt
        retry_prompt = f"""
Fix this JSON and return ONLY valid JSON:

{response_text}

Format:
{{
    "technical": number,
    "depth": number,
    "clarity": number,
    "overall": number
}}
"""

        try:
            fixed = call_llm(retry_prompt)
            return json.loads(fixed)
        except:
            print("❌ Failed again, returning default")

            return {
                "technical": 0,
                "depth": 0,
                "clarity": 0,
                "overall": 0
            }