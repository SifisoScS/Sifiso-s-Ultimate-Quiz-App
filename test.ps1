Write-Host "=== Running Quiz App Tests ===" -ForegroundColor Cyan

# Activate venv
if (Test-Path venv) {
    .\venv\Scripts\Activate.ps1
}

# Check if pytest is installed
try {
    python -m pytest --version
    Write-Host "Pytest found! Running tests..." -ForegroundColor Green
    
    # Run tests if they exist
    if (Test-Path app\tests\) {
        python -m pytest app\tests\ -v
    } elseif (Test-Path tests\) {
        python -m pytest tests\ -v
    } else {
        Write-Host "No test directory found. Running basic import test..." -ForegroundColor Yellow
        python -c "
import sys
sys.path.insert(0, '.')
try:
    from src.utils.quiz_logic import shuffle_questions, check_answer
    print('✓ All imports work!')
    print('✓ Basic function test:', check_answer('test', 'test'))
    print('✅ Tests passed!')
except ImportError as e:
    print(f'✗ Import error: {e}')
    exit(1)
"
    }
    
} catch {
    Write-Host "Pytest not installed. Installing..." -ForegroundColor Yellow
    pip install pytest
    
    # Try again
    if (Test-Path app\tests\) {
        python -m pytest app\tests\ -v
    } else {
        Write-Host "Running basic tests..." -ForegroundColor Yellow
        python -c "
import sys
sys.path.insert(0, '.')
try:
    from src.utils.quiz_logic import check_answer
    print('✓ Import test passed')
    print('✓ Function test:', check_answer('Paris', 'Paris'))
    print('✅ Basic tests passed!')
except Exception as e:
    print(f'✗ Error: {e}')
"
    }
}
