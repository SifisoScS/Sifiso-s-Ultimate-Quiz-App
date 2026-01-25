# PowerShell Makefile alternative

function Invoke-Setup {
    Write-Host "Running setup..." -ForegroundColor Green
    .\setup.ps1
}

function Invoke-Test {
    Write-Host "Running tests..." -ForegroundColor Cyan
    .\run_tests.ps1
}

function Invoke-Run {
    Write-Host "Starting app..." -ForegroundColor Magenta
    .\dev.ps1
}

function Invoke-Clean {
    Write-Host "Cleaning up..." -ForegroundColor Yellow
    # Remove pycache
    Get-ChildItem -Path . -Include "__pycache__" -Recurse -Directory | Remove-Item -Recurse -Force
    Get-ChildItem -Path . -Include "*.pyc" -Recurse -File | Remove-Item -Force
    Write-Host "Clean complete!" -ForegroundColor Green
}

function Invoke-Help {
    Write-Host "Available commands:" -ForegroundColor Blue
    Write-Host "  .\Makefile.ps1 setup    - Setup environment" -ForegroundColor White
    Write-Host "  .\Makefile.ps1 test     - Run tests" -ForegroundColor White
    Write-Host "  .\Makefile.ps1 run      - Run app" -ForegroundColor White
    Write-Host "  .\Makefile.ps1 clean    - Clean pycache" -ForegroundColor White
    Write-Host "  .\Makefile.ps1 help     - Show this help" -ForegroundColor White
}

# Main switch
param(
    [string] = "help"
)

switch () {
    "setup" { Invoke-Setup }
    "test" { Invoke-Test }
    "run" { Invoke-Run }
    "clean" { Invoke-Clean }
    default { Invoke-Help }
}
