# Update or create this test file
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from src.utils.quiz_logic import shuffle_questions, check_answer

def test_shuffle_questions():
    """Test that questions are shuffled."""
    questions = [{'id': 1}, {'id': 2}, {'id': 3}, {'id': 4}, {'id': 5}]
    shuffled = shuffle_questions(questions.copy())
    
    assert len(shuffled) == len(questions)
    assert all(q in shuffled for q in questions)
    # Note: We can't guarantee order changed, but that's okay for shuffle

def test_check_answer_correct():
    """Test correct answer detection."""
    assert check_answer("Paris", "Paris") == True
    
def test_check_answer_incorrect():
    """Test incorrect answer detection."""
    assert check_answer("Paris", "London") == False
    
def test_check_answer_case_insensitive():
    """Test case insensitive matching."""
    assert check_answer("Paris", "paris") == True
    assert check_answer("paris", "PARIS") == True
    
def test_check_answer_whitespace():
    """Test whitespace handling."""
    assert check_answer("  Paris  ", "Paris") == True
    assert check_answer("Paris", "  Paris  ") == True
    
def test_check_answer_special_chars():
    """Test special characters handling."""
    assert check_answer("O'Neill", "O'Neill") == True
    assert check_answer("Café", "Café") == True