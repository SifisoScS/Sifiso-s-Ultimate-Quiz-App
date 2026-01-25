def shuffle_questions(questions):
    """Shuffle the list of questions."""
    import random
    shuffled = questions.copy()
    random.shuffle(shuffled)
    return shuffled


def check_answer(user_answer, correct_answer):
    """Check if the user's answer matches the correct answer."""
    # Handle case-insensitive comparison with whitespace trimming
    return user_answer.strip().lower() == correct_answer.strip().lower()
