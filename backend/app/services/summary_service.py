from sqlalchemy.orm import Session
from sqlalchemy import text
from collections import defaultdict


def get_summary(db: Session, user_id: int):
    rows = db.execute(
        text("""
        SELECT question, technical, depth, clarity, overall
        FROM answers
        WHERE user_id = :uid
        """),
        {"uid": user_id}
    ).fetchall()

    if not rows:
        return None

    total = len(rows)

    tech_avg = sum(r.technical for r in rows) / total
    depth_avg = sum(r.depth for r in rows) / total
    clarity_avg = sum(r.clarity for r in rows) / total
    overall_avg = sum(r.overall for r in rows) / total

    # 🔥 Topic detection (simple keyword grouping)
    topic_scores = defaultdict(list)

    for r in rows:
        q = r.question.lower()

        if "stack" in q:
            topic_scores["stack"].append(r.overall)
        elif "linked list" in q:
            topic_scores["linked list"].append(r.overall)
        elif "react" in q:
            topic_scores["react"].append(r.overall)
        elif "array" in q:
            topic_scores["array"].append(r.overall)
        else:
            topic_scores["general"].append(r.overall)

    topic_summary = {
        t: round(sum(v)/len(v), 2) for t, v in topic_scores.items()
    }

    strong = max(
        {"technical": tech_avg, "depth": depth_avg, "clarity": clarity_avg},
        key=lambda x: {"technical": tech_avg, "depth": depth_avg, "clarity": clarity_avg}[x]
    )

    weak = min(
        {"technical": tech_avg, "depth": depth_avg, "clarity": clarity_avg},
        key=lambda x: {"technical": tech_avg, "depth": depth_avg, "clarity": clarity_avg}[x]
    )

    # 🔥 Suggestions logic
    suggestions = []

    if depth_avg < 5:
        suggestions.append("Explain concepts with real-world examples")
    if clarity_avg < 5:
        suggestions.append("Structure answers clearly (intro → body → example)")
    if tech_avg < 5:
        suggestions.append("Revise core concepts and definitions")

    return {
        "avg_score": round(overall_avg, 2),
        "total": total,
        "breakdown": {
            "technical": round(tech_avg, 2),
            "depth": round(depth_avg, 2),
            "clarity": round(clarity_avg, 2),
        },
        "topics": topic_summary,
        "strong": strong,
        "weak": weak,
        "suggestions": suggestions
    }