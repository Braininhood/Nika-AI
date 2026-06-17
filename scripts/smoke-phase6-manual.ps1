# Phase 6 manual smoke test (automated where possible)
# Run from repo root after: pnpm dev:all

$ErrorActionPreference = "Continue"
$root = Split-Path $PSScriptRoot -Parent
Set-Location $root

$results = @()

function Add-SmokeResult($item, $status, $note = "") {
  $script:results += [PSCustomObject]@{ Item = $item; Status = $status; Note = $note }
}

Write-Host ""
Write-Host "=== Phase 6 Smoke Test ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "Running verify:phase6..." -ForegroundColor Yellow
& powershell -ExecutionPolicy Bypass -File scripts\verify-phase6.ps1 | Out-Null
Add-SmokeResult "pnpm verify:phase6" $(if ($LASTEXITCODE -eq 0) { "PASS" } else { "FAIL" })

try {
  $health = Invoke-RestMethod -Uri "http://127.0.0.1:8000/health" -TimeoutSec 5
  Add-SmokeResult "API /health" $(if ($health.status -eq "ok") { "PASS" } else { "FAIL" })
} catch {
  Add-SmokeResult "API /health" "FAIL" "Start API: pnpm dev:api"
}

try {
  $webHealth = Invoke-RestMethod -Uri "http://127.0.0.1:3000/health" -TimeoutSec 5
  Add-SmokeResult "Web proxy /health" $(if ($webHealth.status -eq "ok") { "PASS" } else { "FAIL" })
} catch {
  Add-SmokeResult "Web proxy /health" "FAIL" "Start web: pnpm dev"
}

$pages = @("/nika", "/materials", "/login")
foreach ($path in $pages) {
  try {
    $res = Invoke-WebRequest -Uri "http://127.0.0.1:3000$path" -TimeoutSec 10 -UseBasicParsing
    Add-SmokeResult "GET $path" $(if ($res.StatusCode -eq 200) { "PASS" } else { "FAIL" })
  } catch {
    Add-SmokeResult "GET $path" "FAIL" $_.Exception.Message
  }
}

try {
  $skillRes = Invoke-WebRequest -Uri "http://127.0.0.1:3000/api/v1/profile/me/skill-map" -TimeoutSec 5 -UseBasicParsing
  Add-SmokeResult "skill-map endpoint routing" "PASS" "HTTP $($skillRes.StatusCode)"
} catch {
  $code = $_.Exception.Response.StatusCode.value__
  if ($code -eq 401) {
    Add-SmokeResult "skill-map endpoint routing" "PASS" "401 without token (not 404)"
  } elseif ($code -eq 404) {
    Add-SmokeResult "skill-map endpoint routing" "FAIL" "Still returns 404"
  } else {
    Add-SmokeResult "skill-map endpoint routing" "FAIL" $_.Exception.Message
  }
}

Push-Location (Join-Path $root "apps\web")
pnpm exec vitest run src/lib/nika/offline-reply.test.ts src/components/nika/nika-message-text.test.ts 2>&1 | Out-Null
Add-SmokeResult "Offline Nika + link rendering" $(if ($LASTEXITCODE -eq 0) { "PASS" } else { "FAIL" })
pnpm exec vitest run src/lib/nika/topic-guard.test.ts 2>&1 | Out-Null
Add-SmokeResult "Topic guard (weather refused)" $(if ($LASTEXITCODE -eq 0) { "PASS" } else { "FAIL" })
Pop-Location

Write-Host ""
$results | Format-Table -AutoSize
$pass = ($results | Where-Object { $_.Status -eq "PASS" }).Count
$fail = ($results | Where-Object { $_.Status -eq "FAIL" }).Count
Write-Host "PASS: $pass  FAIL: $fail" -ForegroundColor $(if ($fail -eq 0) { "Green" } else { "Red" })
Write-Host ""
Write-Host "Manual browser checks when signed in:" -ForegroundColor Yellow
Write-Host "  - Nika: ask OET question, check clickable links"
Write-Host "  - Materials Hub: official OET tabs"
Write-Host "  - DevTools offline: Nika still replies"
Write-Host ""

if ($fail -gt 0) { exit 1 }
exit 0
