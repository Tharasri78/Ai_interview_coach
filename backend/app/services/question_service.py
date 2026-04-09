from app.core.llm import generate_text

def generate_question(topic, docs, difficulty):

    # Build context
    context = ""
    if docs:
       try:
           context = "\n".join([doc.page_content for doc in docs[:2]])
       except:
        context = ""
    # Prompt
    prompt = f"""
Generate ONE interview question.

Topic: {topic}
Difficulty: {difficulty}

Context:
{context}

Rules:
- Only return ONE clear question
- No numbering
- No explanation
"""

    try:
       response = generate_text(prompt)
    except Exception as e:
       print("LLM ERROR:", e)
       return f"What is {topic}? Explain with example."

    # 🔥 SAFETY (VERY IMPORTANT)
    if not response or len(response.strip()) < 10:
        return f"What is {topic} and explain it with an example?"

    return response.strip()