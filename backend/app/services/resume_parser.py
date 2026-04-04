from pypdf import PdfReader
import re

def extract_text_from_pdf(file):
    reader = PdfReader(file)
    text = ""

    for page in reader.pages:
        text += page.extract_text() or ""

    return text


def extract_skills(text):
    text = text.lower()

    # normalize common variations
    text = text.replace("react.js", "react")
    text = text.replace("node.js", "node")
    text = text.replace("express.js", "express")
    skills_list = [
        "javascript", "java", "react", "node", "express",
        "mongodb", "git", "github", "sql", "dbms", "os"
    ]


    # tokenize words properly
    words = re.findall(r'\b[a-zA-Z\+\#\.]+\b', text)

    found_skills = []

    for skill in skills_list:
        skill_words = skill.split()

        if len(skill_words) == 1:
            if skill in words:
                found_skills.append(skill)
        else:
            if skill in text:
                found_skills.append(skill)

    return list(set(found_skills))