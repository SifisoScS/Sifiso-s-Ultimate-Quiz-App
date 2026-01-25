# Development script - runs app with auto-reload
Write-Host "Starting Quiz App in development mode..." -ForegroundColor Magenta

# Activate venv
if (Test-Path venv) {
    & venv\Scripts\Activate.ps1
}

# Run Streamlit with autoreload
streamlit run src/quiz_app.py --server.runOnSave true

Write-Host "App stopped." -ForegroundColor Yellow
