def get_next_difficulty(avg_score, current_difficulty="easy"):

    if avg_score < 4:
        return "easy"

    elif avg_score < 7:
        return "medium"

    else:
        return "hard"