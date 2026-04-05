def get_next_difficulty(avg_score, current_difficulty):
    
    if current_difficulty == "easy":
        return "medium" if avg_score >= 6 else "easy"
    
    elif current_difficulty == "medium":
        if avg_score >= 8:
            return "hard"
        elif avg_score < 5:
            return "easy"
        else:
            return "medium"
    
    elif current_difficulty == "hard":
        return "hard" if avg_score >= 7 else "medium"
    
    return "easy"