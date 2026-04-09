from groq import Groq
from app.core.config import GROQ_API_KEY

client = Groq(api_key=GROQ_API_KEY)

def generate_text(prompt: str, temperature=0.7, max_tokens=300):
    try:
        res = client.chat.completions.create(
            model="mixtral-8x7b-32768",
            messages=[{"role": "user", "content": prompt}],
            temperature=temperature,
            max_tokens=max_tokens
        )
        return res.choices[0].message.content.strip()
    except Exception as e:
        print("LLM ERROR:", e)
        return None