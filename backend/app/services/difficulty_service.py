def get_next_difficulty(avg_score):
    if avg_score is None:
        return "easy"

    if avg_score >= 8:
        return "hard"
    elif avg_score >= 5:
        return "medium"
    else:
        return "easy"


def get_user_avg_score(db, user_id):
    try:
        result = db.execute(
            "SELECT AVG(overall) FROM answers WHERE user_id = :uid",
            {"uid": user_id}
        ).fetchone()

        # 🔥 CRITICAL FIX
        if result is None or result[0] is None:
            return 0   # no data → treat as beginner

        return float(result[0])  # ensure numeric

    except Exception as e:
        print("AVG SCORE ERROR:", e)
        return 0