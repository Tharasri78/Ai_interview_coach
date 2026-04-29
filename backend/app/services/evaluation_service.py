from app.core.llm import generate_text
import json
import re

def evaluate_answer(question, answer):
    """Evaluate answer with LLM + rule-based scoring"""
    
    # First, rule-based scoring
    rule_score = calculate_rule_based_score(answer)
    
    prompt = f"""
You are a strict interviewer evaluating a candidate's answer.

Question: {question}
Answer: {answer}

Evaluate and return ONLY valid JSON. No extra text.

Return EXACT format:
{{
  "scores": {{
    "technical": number (1-10),
    "depth": number (1-10),
    "clarity": number (1-10),
    "overall": number (1-10)
  }},
  "feedback": {{
    "issues": "what's wrong with this answer",
    "missing": "what key points are missing",
    "ideal": "what a great answer includes",
    "improved_answer": "rewrite the answer properly"
  }}
}}
"""

    # Retry up to 2 times
    llm_result = None
    for attempt in range(2):
        result = generate_text(prompt, temperature=0.3, max_tokens=800, task="evaluation")
        if result:
            parsed = parse_llm_json(result)
            if parsed:
                llm_result = parsed
                break
    
    if llm_result:
        # Combine LLM score with rule-based score
        llm_overall = llm_result.get("scores", {}).get("overall", 6)
        final_overall = (llm_overall + rule_score) / 2
        
        # Update the overall score
        llm_result["scores"]["overall"] = round(final_overall, 1)
        llm_result["scores"]["rule_based_score"] = rule_score
        
        return llm_result
    
    # Fallback response
    return default_response(rule_score)


def calculate_rule_based_score(answer):
    """Calculate score based on answer length, structure, etc."""
    score = 5  # Start at 5
    
    if not answer:
        return 2
    
    length = len(answer)
    
    # Length scoring
    if length < 50:
        score -= 2
    elif length < 100:
        score -= 1
    elif length > 300:
        score += 1
    elif length > 500:
        score += 2
    
    # Structure indicators (STAR method keywords)
    star_keywords = ["situation", "task", "action", "result", "context", "goal", "outcome", "learned"]
    star_count = sum(1 for kw in star_keywords if kw.lower() in answer.lower())
    score += min(star_count, 3)  # Max +3
    
    # Technical depth indicators
    tech_keywords = ["because", "however", "therefore", "implemented", "designed", "built", "optimized"]
    tech_count = sum(1 for kw in tech_keywords if kw.lower() in answer.lower())
    score += min(tech_count // 2, 2)  # Max +2
    
    # Cap at 10, floor at 1
    return max(1, min(10, score))


def parse_llm_json(raw_output):
    """Parse JSON from LLM output with multiple recovery strategies"""
    if not raw_output:
        return None
    
    # Clean markdown
    clean = raw_output.strip()
    clean = clean.replace("```json", "").replace("```", "").strip()
    
    # Extract JSON object
    match = re.search(r"\{.*\}", clean, re.DOTALL)
    if not match:
        return None
    
    json_str = match.group()
    
    # Try variable lengths until valid
    for length in range(len(json_str), len(json_str) - 50, -1):
        try:
            truncated = json_str[:length]
            # Fix missing closing braces
            open_braces = truncated.count('{')
            close_braces = truncated.count('}')
            if open_braces > close_braces:
                truncated += '}' * (open_braces - close_braces)
            return json.loads(truncated)
        except:
            continue
    
    return None


def default_response(rule_score=5):
    return {
        "scores": {
            "technical": rule_score,
            "depth": rule_score - 1 if rule_score > 1 else 1,
            "clarity": rule_score,
            "overall": rule_score
        },
        "feedback": {
            "issues": "Answer lacks depth and structure. Add more details and examples.",
            "missing": "Specific examples, STAR method structure, technical depth",
            "ideal": "Use STAR method: Situation, Task, Action, Result. Include metrics when possible.",
            "improved_answer": "Add a clear structure: 1) Context, 2) Your role, 3) Actions taken, 4) Measurable results"
        }
    }