import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

def test_quiz_integration():
    """Integration test for quiz components."""
    # This is a placeholder - we'll expand this
    # Test that all components work together
    
    # Import all needed modules
    from src.utils.file_utils import load_questions_from_csv
    from src.utils.quiz_logic import shuffle_questions, check_answer
    from src.utils.leaderboard_utils import load_leaderboard, update_leaderboard
    
    # Quick integration check
    assert callable(load_questions_from_csv)
    assert callable(shuffle_questions)
    assert callable(check_answer)
    assert callable(load_leaderboard)
    assert callable(update_leaderboard)
    
    print("Integration test passed - all components available")