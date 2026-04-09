from groq import Groq

client = Groq(api_key="")

models = client.models.list()

print("Available models:\n")

for m in models.data:
    print(m.id)