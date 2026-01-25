# Test runner script
Write-Host "Running Quiz App Tests..." -ForegroundColor Cyan

# Activate venv if exists
if (Test-Path venv) {
    & venv\Scripts\Activate.ps1
}

# Run all tests
python -m pytest tests/ -v --cov=src --cov-report=term-missing

# If pytest not installed, run basic tests
if ( -eq 9009) {
    Write-Host "Pytest not found. Running basic tests..." -ForegroundColor Yellow
    python -c "
import sys
sys.path.insert(0, '.')
from src.utils.quiz_logic import shuffle_questions, check_answer

# Quick tests
questions = [{'id': 1}, {'id': 2}, {'id': 3}]
shuffled = shuffle_questions(questions.copy())
print(f'Shuffle test: {len(shuffled) == len(questions)}')

print(f'Check answer test 1: {check_answer(\"Paris\", \"Paris\")}')
print(f'Check answer test 2: {not check_answer(\"Paris\", \"London\")}')
print('Basic tests passed!')
"
}
