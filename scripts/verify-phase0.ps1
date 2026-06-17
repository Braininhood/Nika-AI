# Phase 0 automated verification
# Run from repo root: powershell -File scripts/verify-phase0.ps1

$ErrorActionPreference = "Continue"
$root = Split-Path $PSScriptRoot -Parent
Set-Location $root

$results = @()

function Add-Result($section, $item, $status, $note = "") {
  $script:results += [PSCustomObject]@{
    Section = $section
    Item    = $item
    Status  = $status
    Note    = $note
  }
}

Write-Host ""
Write-Host "=== OET Coach Phase 0 Verification ===" -ForegroundColor Cyan
Write-Host ""

$paths = @(
  "apps/web/package.json",
  "apps/api/requirements.txt",
  "apps/api/app/main.py",
  "pnpm-workspace.yaml",
  "docker-compose.yml",
  ".env.example",
  ".gitignore"
)
foreach ($p in $paths) {
  $ok = Test-Path $p
  $status = if ($ok) { "PASS" } else { "FAIL" }
  Add-Result "0.1 Monorepo" $p $status
}

Add-Result "0.2 Env" ".env" $(if (Test-Path ".env") { "PASS" } else { "FAIL" })
Add-Result "0.2 Env" "apps/web/.env.local" $(if (Test-Path "apps/web/.env.local") { "PASS" } else { "FAIL" })

$envLocal = Get-Content "apps/web/.env.local" -ErrorAction SilentlyContinue
$hasUrl = $envLocal -match "NEXT_PUBLIC_SUPABASE_URL=https://"
$hasKey = $envLocal -match "NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ"
Add-Result "0.2 Env" "Supabase URL in .env.local" $(if ($hasUrl) { "PASS" } else { "FAIL" })
Add-Result "0.2 Env" "Supabase anon key in .env.local" $(if ($hasKey) { "PASS" } else { "FAIL" })

Add-Result "0.2 DB" "initial_schema.sql" $(if (Test-Path "supabase/migrations/20250613000000_initial_schema.sql") { "PASS" } else { "FAIL" }) "Apply in Supabase SQL editor"

foreach ($icon in @("icon-192.png", "icon-512.png", "icon-maskable-512.png")) {
  $p = "apps/web/public/icons/$icon"
  Add-Result "0.4 PWA" $p $(if (Test-Path $p) { "PASS" } else { "FAIL" })
}
Add-Result "0.4 PWA" "manifest.json" $(if (Test-Path "apps/web/public/manifest.json") { "PASS" } else { "FAIL" })
Add-Result "0.4 PWA" "sw.ts" $(if (Test-Path "apps/web/src/app/sw.ts") { "PASS" } else { "FAIL" })

foreach ($f in @("apps/web/src/lib/db/index.ts", "apps/web/src/lib/sync/outbox.ts")) {
  Add-Result "0.5 Local DB" $f $(if (Test-Path $f) { "PASS" } else { "FAIL" })
}

Write-Host "Running pnpm build..." -ForegroundColor Yellow
pnpm build | Out-Null
Add-Result "DoD" "pnpm build" $(if ($LASTEXITCODE -eq 0) { "PASS" } else { "FAIL" })

Write-Host "Running pnpm test..." -ForegroundColor Yellow
pnpm test | Out-Null
Add-Result "DoD" "pnpm test" $(if ($LASTEXITCODE -eq 0) { "PASS" } else { "FAIL" })

Write-Host "Running pnpm lint..." -ForegroundColor Yellow
pnpm lint | Out-Null
Add-Result "DoD" "pnpm lint" $(if ($LASTEXITCODE -eq 0) { "PASS" } else { "FAIL" })

try {
  $health = Invoke-RestMethod -Uri "http://127.0.0.1:8000/health" -TimeoutSec 3
  Add-Result "0.3 API" "/health" $(if ($health.status -eq "ok") { "PASS" } else { "FAIL" })
} catch {
  Add-Result "0.3 API" "/health" "MANUAL" "Run pnpm dev:api or docker compose up"
}

Add-Result "0.3 API" "schema.d.ts" $(if (Test-Path "apps/web/src/lib/api/schema.d.ts") { "PASS" } else { "FAIL" })

try {
  docker compose ps --format json 2>$null | Out-Null
  $apiUp = docker compose ps --services --filter status=running 2>$null | Select-String -Pattern "api"
  $dbUp = docker compose ps --services --filter status=running 2>$null | Select-String -Pattern "db"
  $redisUp = docker compose ps --services --filter status=running 2>$null | Select-String -Pattern "redis"
  if ($apiUp -and $dbUp -and $redisUp) {
    Add-Result "0.3 Docker" "compose services running" "PASS"
  } else {
    Add-Result "0.3 Docker" "compose services running" "MANUAL" "Run docker compose up -d"
  }
} catch {
  Add-Result "0.3 Docker" "compose services running" "MANUAL" "Docker Desktop not running"
}

Add-Result "0.1 API" "Python venv" $(if (Test-Path "apps/api/.venv") { "PASS" } else { "FAIL" })

Add-Result "0.2 Manual" "Migration applied in Supabase" "MANUAL" "SQL editor"
Add-Result "0.2 Manual" "Magic link + Google OAuth" "MANUAL" "Supabase Auth"
Add-Result "DoD Manual" "Sign in works" "MANUAL" "/login"
Add-Result "DoD Manual" "Offline PWA shell" "MANUAL" "pnpm start + install"

Write-Host ""
$results | Format-Table -AutoSize

$pass = ($results | Where-Object { $_.Status -eq "PASS" }).Count
$fail = ($results | Where-Object { $_.Status -eq "FAIL" }).Count
$manual = ($results | Where-Object { $_.Status -eq "MANUAL" }).Count

$color = if ($fail -eq 0) { "Green" } else { "Red" }
Write-Host "Summary: $pass passed, $fail failed, $manual manual" -ForegroundColor $color
if ($fail -gt 0) { exit 1 }
