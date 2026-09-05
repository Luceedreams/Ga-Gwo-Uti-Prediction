# UTI-Predict — Start everything
# Run from the GaGwoFrontend-main folder:  .\start.ps1

$root    = $PSScriptRoot
$backend = Join-Path $root "Backend_updated"

Write-Host ""
Write-Host "=== UTI-Predict Startup ===" -ForegroundColor Cyan

# 1. Check model files exist
$modelFile = Join-Path $root "models\hybrid_random_forest.pkl"
if (-not (Test-Path $modelFile)) {
    Write-Host "`n[!] Model files missing. Training now..." -ForegroundColor Yellow
    Push-Location $backend
    python train_model.py
    Pop-Location
}

# 2. Start Flask backend
Write-Host "`n[1/2] Starting Flask API on http://localhost:5000 ..." -ForegroundColor Green
Start-Process python -ArgumentList "app.py" -WorkingDirectory $backend -WindowStyle Normal

Start-Sleep -Seconds 3

# 3. Start Vite frontend
Write-Host "[2/2] Starting React frontend on http://localhost:3000 ..." -ForegroundColor Green
Start-Process npm -ArgumentList "run","dev" -WorkingDirectory $root -WindowStyle Normal

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "Both servers are running." -ForegroundColor Cyan
Write-Host "  Frontend -> http://localhost:3000"
Write-Host "  Backend  -> http://localhost:5000"
Write-Host ""
Write-Host "Press any key to exit this launcher (servers keep running)."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
