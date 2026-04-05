from pypdf import PdfReader
import re


def extract_text_from_pdf(file):
    reader = PdfReader(file)
    text = ""

    for page in reader.pages:
        text += page.extract_text() or ""

    return text.lower()


def extract_skills(text):
    skills_db = [
        "python", "java", "javascript",
        "react", "node", "express",
        "mongodb", "sql", "dbms",
        "os", "machine learning", "ai"
    ]

    found = []

    for skill in skills_db:
        if re.search(rf"\b{skill}\b", text):
            found.append(skill)

    return list(set(found))