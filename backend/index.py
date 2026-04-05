from groq import Groq
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    print("❌ GROQ_API_KEY not found in .env")
    exit()

client = Groq(api_key=api_key)

models = client.models.list()

print("\n✅ Available Groq Models:\n")

for m in models.data:
    print(m.id)