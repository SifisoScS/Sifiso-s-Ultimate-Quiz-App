# Setup script for Quiz App
Write-Host "Setting up Quiz App environment..." -ForegroundColor Green

# Create virtual environment if not exists
if (-not (Test-Path venv)) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
venv\Scripts\Activate.ps1

# Install requirements
Write-Host "Installing requirements..." -ForegroundColor Yellow
pip install -r requirements.txt

# Install dev requirements if exists
if (Test-Path requirements-dev.txt) {
    Write-Host "Installing dev requirements..." -ForegroundColor Yellow
    pip install -r requirements-dev.txt
}

# Run tests
Write-Host "Running tests..." -ForegroundColor Yellow
python -m pytest tests/ -v

Write-Host "Setup complete! Run with: streamlit run src/quiz_app.py" -ForegroundColor Green
