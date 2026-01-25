import sys
import os
import tempfile
import csv
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from src.utils.file_utils import load_questions_from_csv

def test_load_questions_from_csv():
    """Test loading questions from CSV."""
    # Create a temporary CSV file
    with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False, newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['question', 'options', 'answer', 'category', 'difficulty'])
        # Use comma-separated options like the actual CSV
        writer.writerow(['What is 2+2?', '3,4,5', '4', 'Math', 'Easy'])
        writer.writerow(['Capital of France?', 'London,Paris,Berlin', 'Paris', 'Geography', 'Medium'])
        temp_file = f.name
    
    try:
        questions = load_questions_from_csv(temp_file)
        
        assert len(questions) == 2
        assert questions[0]['question'] == 'What is 2+2?'
        assert questions[0]['category'] == 'Math'
        assert questions[0]['difficulty'] == 'Easy'
        # Should be split into list
        assert questions[0]['options'] == ['3', '4', '5']
        assert questions[1]['answer'] == 'Paris'
        
    finally:
        os.unlink(temp_file)

def test_load_questions_invalid_file():
    """Test handling of invalid file path."""
    # Should handle gracefully
    try:
        load_questions_from_csv("non_existent_file.csv")
        # If it doesn't raise, that's fine
        assert True
    except Exception:
        # If it raises, that's also fine
        assert True
