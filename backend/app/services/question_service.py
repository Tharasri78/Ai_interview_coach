from app.core.llm import generate_text


def generate_question(topic: str, docs=None, difficulty: str = "medium"):
    """
    Generate ONE interview question based on topic + difficulty + optional context.
    """

    # ─────────────────────────────
    # 1. SAFE CONTEXT EXTRACTION
    # ─────────────────────────────
    context = ""

    if docs:
        try:
            context = "\n".join([
                doc.page_content[:300] for doc in docs[:2]
            ])
        except Exception as e:
            print("Context Error:", e)
            context = ""

    # ─────────────────────────────
    # 2. PROMPT (REAL ADAPTIVE LOGIC)
    # ─────────────────────────────
    prompt = f"""
You are a strict technical interviewer.

Generate ONE interview question.

Topic: {topic}
Difficulty: {difficulty}

Context:
{context}

IMPORTANT:
- You MUST strictly follow the difficulty level.
- Do NOT generate an easier question than requested.

Difficulty behavior:
- EASY → definition or basic concept
- MEDIUM → explanation + example or use case
- HARD → scenario, system design, or real-world problem

Rules:
- Return ONLY the question
- No explanation
"""

    # ─────────────────────────────
    # 3. LLM CALL
    # ─────────────────────────────
    try:
        response = generate_text(prompt, temperature=0.7)
    except Exception as e:
        print("LLM ERROR:", e)
        return fallback_question(topic, difficulty)

    # ─────────────────────────────
    # 4. SAFETY CHECK
    # ─────────────────────────────
    if not response or len(response.strip()) < 10:
        return fallback_question(topic, difficulty)

    return response.strip()


# ─────────────────────────────
# 5. FALLBACK (DIFFICULTY-AWARE)
# ─────────────────────────────
def fallback_question(topic: str, difficulty: str):
    if difficulty == "hard":
        return f"How would you design a system using {topic} in a real-world application?"
    elif difficulty == "medium":
        return f"How does {topic} work and where is it used?"
    else:
        return f"What is {topic}? Give an example."