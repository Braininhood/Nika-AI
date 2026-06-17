# Run FastAPI dev server (Windows-friendly venv path)
# Usage: powershell -File scripts/dev-api.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$apiDir = Join-Path $root "apps\api"
$python = Join-Path $apiDir ".venv\Scripts\python.exe"

if (-not (Test-Path $python)) {
  Write-Error "Python venv not found. From apps/api run: python -m venv .venv then pip install -r requirements.txt"
}

Set-Location $apiDir
& $python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
