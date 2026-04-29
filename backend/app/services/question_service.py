from app.core.llm import generate_text
from app.services.rag_service import get_resume_text, get_user_skills, search_relevant_context
import random

def generate_question(
    user_id=None,
    topic=None,
    difficulty="medium",
    round_type="TECH",
    resume_context=None,
    previous_answer=None
):
    
    # Get resume content and skills
    resume_text = ""
    skills = []
    
    if user_id:
        resume_text = get_resume_text(user_id)
        skills = get_user_skills(user_id)
    
    # For TECHNICAL round - use REAL interview question templates
    if round_type == "TECH":
        return generate_real_technical_question(skills, topic, difficulty)
    
    elif round_type == "HR":
        return generate_real_hr_question(resume_text, skills)
    
    elif round_type == "DEEP":
        return generate_follow_up_question(previous_answer, skills)
    
    else:
        return generate_real_technical_question(skills, topic, difficulty)


def generate_real_technical_question(skills, topic, difficulty):
    """Generate REAL technical interview questions like FAANG companies ask"""
    
    # Use skill if available, otherwise use topic
    primary_skill = skills[0] if skills else (topic if topic else "JavaScript")
    
    # REAL Technical Questions by category
    real_questions = {
        # JavaScript/TypeScript
        "JavaScript": {
            "easy": [
                "What is the difference between `==` and `===` in JavaScript?",
                "Explain closures in JavaScript. Can you give a practical example?",
                "What is event delegation and why would you use it?",
                "Explain how `this` works in JavaScript with different contexts.",
                "What is the difference between `let`, `const`, and `var`?"
            ],
            "medium": [
                "Explain how prototypal inheritance works in JavaScript.",
                "What is the event loop? How do microtasks and macrotasks work?",
                "How would you implement a debounce function? When would you use it?",
                "Explain the difference between deep copy and shallow copy. How would you implement a deep clone?",
                "How does garbage collection work in JavaScript? What causes memory leaks?"
            ],
            "hard": [
                "Design a rate limiter for an API using JavaScript. What data structure would you use?",
                "How would you optimize a React application that renders 10,000 items?",
                "Explain how you would implement a virtual DOM diffing algorithm.",
                "Design a promise polyfill from scratch. How would you handle async operations?"
            ]
        },
        
        # React
        "React": {
            "easy": [
                "What is the difference between props and state in React?",
                "What is the Virtual DOM and how does React use it?",
                "Explain the purpose of `key` prop in React lists.",
                "What are hooks? Why were they introduced?",
                "What is the difference between controlled and uncontrolled components?"
            ],
            "medium": [
                "Explain the useEffect hook lifecycle. How do you prevent infinite loops?",
                "What is context API? When would you use it vs Redux?",
                "How would you optimize a component that re-renders too frequently?",
                "Explain the difference between `useMemo` and `useCallback`. When to use each?",
                "How do you handle forms in React? What libraries have you used?"
            ],
            "hard": [
                "Design a custom hook that fetches data with caching and retry logic.",
                "How would you implement code splitting and lazy loading in a React app?",
                "Explain how React's concurrent features work. What problem do they solve?",
                "Design a state management solution for a large React application."
            ]
        },
        
        # Python
        "Python": {
            "easy": [
                "What is the difference between a list and a tuple?",
                "How does list comprehension work? Provide an example.",
                "What are decorators? How would you write one?",
                "Explain the difference between `@staticmethod` and `@classmethod`.",
                "What is the Global Interpreter Lock (GIL)?"
            ],
            "medium": [
                "How does garbage collection work in Python?",
                "Explain the difference between `deepcopy` and `shallow copy`.",
                "What are generators? How are they different from lists?",
                "How would you handle exceptions in Python? What's the difference between `except` and `finally`?",
                "Explain how the `with` statement works. What is the context manager protocol?"
            ],
            "hard": [
                "Design a decorator that caches function results with timeout.",
                "How would you implement an async web scraper in Python?",
                "Explain Python's memory management. What are reference cycles?",
                "Design a thread-safe singleton pattern in Python."
            ]
        },
        
        # System Design
        "System Design": {
            "medium": [
                "How would you design a URL shortener like TinyURL?",
                "Design a rate limiter for a public API.",
                "How would you design a chat system like WhatsApp?",
                "Design a notification delivery system.",
                "How would you design a distributed caching system?"
            ],
            "hard": [
                "Design Twitter's timeline feed. How would you handle millions of users?",
                "Design Uber's ride matching system.",
                "How would you design Netflix's video streaming architecture?",
                "Design a distributed file storage system like Dropbox.",
                "How would you design a real-time analytics dashboard?"
            ]
        },
        
        # Data Structures & Algorithms
        "DSA": {
            "easy": [
                "Explain the difference between an array and a linked list.",
                "What is a hash table? How does it handle collisions?",
                "Explain the time complexity of binary search.",
                "What is the difference between BFS and DFS?",
                "What is a stack? Give real-world applications."
            ],
            "medium": [
                "How would you detect a cycle in a linked list?",
                "Design an LRU cache. What data structure would you use?",
                "Explain how you would find the first non-repeating character in a string.",
                "How would you check if two strings are anagrams?",
                "Explain how quicksort works. What's its time complexity?"
            ],
            "hard": [
                "Design an algorithm to find the median of two sorted arrays in O(log n).",
                "How would you serialize and deserialize a binary tree?",
                "Design a URL shortener that generates unique IDs (system design + algorithm).",
                "How would you implement autocomplete functionality?"
            ]
        },
        
        # Databases (SQL/MongoDB)
        "Database": {
            "easy": [
                "What is the difference between SQL and NoSQL databases?",
                "Explain INNER JOIN vs LEFT JOIN.",
                "What are indexes? How do they improve query performance?",
                "What is normalization? Name the normal forms.",
                "Explain primary key vs foreign key."
            ],
            "medium": [
                "How would you optimize a slow query?",
                "Explain ACID properties in databases.",
                "What is the difference between `HAVING` and `WHERE`?",
                "How does indexing work in MongoDB?",
                "What is sharding? When would you use it?"
            ],
            "hard": [
                "Design a database schema for a ride-sharing app.",
                "How would you handle database migrations without downtime?",
                "Explain different isolation levels in SQL. What problems do they solve?",
                "Design a distributed database for a global application."
            ]
        }
    }
    
    # Determine which category to use
    category = None
    if primary_skill:
        for key in real_questions.keys():
            if key.lower() in primary_skill.lower() or primary_skill.lower() in key.lower():
                category = key
                break
    
    # Default to JavaScript if no match
    if not category:
        if topic and topic in real_questions:
            category = topic
        else:
            category = "JavaScript"
    
    # Get questions for category
    questions_by_difficulty = real_questions.get(category, real_questions["JavaScript"])
    questions = questions_by_difficulty.get(difficulty, questions_by_difficulty["medium"])
    
    # Pick a random question from the list
    selected_question = random.choice(questions)
    
    # If we have user skills, personalize the question
    if skills and len(skills) > 0:
        # Add personalization based on their resume
        personalization = f" Based on your experience with {skills[0]}"
        if "React" in selected_question and skills[0] == "React":
            personalization = " Based on your React experience"
        elif "JavaScript" in selected_question and skills[0]:
            personalization = f" Given your background with {skills[0]}"
        else:
            personalization = ""
        
        return selected_question + personalization
    
    return selected_question


def generate_real_hr_question(resume_text, skills):
    """Generate REAL HR interview questions"""
    
    hr_questions = [
        "Tell me about a time you had to resolve a conflict within your team.",
        "Describe a situation where you took ownership of a project that was failing.",
        "Tell me about a time you received constructive criticism. How did you respond?",
        "Describe a technical challenge you faced and how you overcame it.",
        "Tell me about a time you had to work with a difficult team member.",
        "Describe a situation where you went above and beyond your job responsibilities.",
        "Tell me about a time you made a mistake. How did you handle it?",
        "Where do you see yourself in 5 years?",
        "Why do you want to work in this role?",
        "Describe a time you had to learn a new technology quickly.",
        "Tell me about your proudest professional achievement.",
        "How do you handle tight deadlines and pressure?",
        "Describe your ideal work environment.",
        "Tell me about a time you had to persuade someone to see things your way.",
        "How do you stay updated with the latest technologies?"
    ]
    
    # Personalize based on resume
    if skills and len(skills) > 0:
        skill_specific = f" Given your expertise in {skills[0]}"
        selected = random.choice(hr_questions)
        return selected + skill_specific
    
    return random.choice(hr_questions)


def generate_follow_up_question(previous_answer, skills):
    """Generate follow-up questions based on previous answer"""
    
    follow_ups = [
        "Can you provide a specific example?",
        "What was the outcome? How did you measure success?",
        "What would you do differently if you could do it again?",
        "How did you handle the trade-offs in that decision?",
        "What alternative approaches did you consider?",
        "How would you scale that solution to handle 10x more users?",
        "What were the technical challenges you encountered?",
        "How did you ensure code quality and testing?",
        "What was the most difficult part of that implementation?",
        "How did you collaborate with other teams on this?"
    ]
    
    return random.choice(follow_ups)


def fallback_question(topic, difficulty):
    """Fallback questions if everything fails"""
    fallbacks = {
        "easy": f"What interests you about {topic if topic else 'software development'}?",
        "medium": f"Describe a challenging {topic if topic else 'technical'} problem you solved recently.",
        "hard": f"Design a system that solves a real-world problem using {topic if topic else 'your technical skills'}."
    }
    return fallbacks.get(difficulty, fallbacks["medium"])