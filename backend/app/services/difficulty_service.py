def get_next_difficulty(avg_score):

    if avg_score is None:
        return "easy"

    if avg_score < 4:
        return "easy"
    elif avg_score < 7:
        return "medium"
    else:
        return "hard"


def get_user_avg_score(db, user_id):
    try:
        results = db.execute(
            "SELECT AVG(overall) FROM answers WHERE user_id = :uid",
            {"uid": user_id}
        ).fetchone()

        return results[0] if results and results[0] else None
    except:
        return None