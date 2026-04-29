from groq import Groq
from app.core.config import GROQ_API_KEY

client = Groq(api_key=GROQ_API_KEY)

def generate_text(prompt: str, temperature=0.7, max_tokens=300, task="general"):

    model = "llama-3.1-8b-instant"

    if task == "evaluation":
        model = "llama-3.3-70b-versatile"

    try:
        res = client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "system",
                    "content": "You are a strict and precise AI assistant. Follow instructions exactly."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=temperature,
            max_tokens=max_tokens
        )

        return res.choices[0].message.content.strip()

    except Exception as e:
        print("LLM ERROR:", e)
        return None