# Phase 8 automated verification — launch prep (English-only)
# Run from repo root: pnpm verify:phase8

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
Write-Host "=== OET Coach Phase 8 Verification ===" -ForegroundColor Cyan
Write-Host ""

# 8.1 Legal pages
$legalPages = @(
  "apps/web/src/app/privacy/page.tsx",
  "apps/web/src/app/terms/page.tsx",
  "apps/web/src/app/about/page.tsx",
  "apps/web/src/app/install/page.tsx"
)
foreach ($f in $legalPages) {
  Add-Result "8.1 Legal/a11y" $f $(if (Test-Path $f) { "PASS" } else { "FAIL" })
}

$a11yDoc = "docs/08-LEGAL-AND-QUALITY/02-accessibility-and-inclusivity.md"
Add-Result "8.1 Legal/a11y" "accessibility doc" $(if (Test-Path $a11yDoc) { "PASS" } else { "FAIL" })

$englishPolicy = "docs/08-LEGAL-AND-QUALITY/04-localization-and-languages.md"
Add-Result "8.1 English-only" "policy doc" $(if (Test-Path $englishPolicy) { "PASS" } else { "FAIL" })

# 8.2 Deploy docs
$deployDocs = @(
  "docs/07-IMPLEMENTATION/03-deployment-hosting.md",
  "docs/07-IMPLEMENTATION/04-aws-free-tier-deploy.md",
  "docs/07-IMPLEMENTATION/14-admin-panel-setup.md",
  "deploy/systemd/Nika-AI-api.service",
  "deploy/systemd/Nika-AI-web.service",
  "scripts/deploy-ec2.sh"
)
foreach ($f in $deployDocs) {
  Add-Result "8.2 Deploy" $f $(if (Test-Path $f) { "PASS" } else { "FAIL" })
}

# 8.3 Admin tools
$adminFiles = @(
  "apps/web/src/app/admin/page.tsx",
  "apps/web/src/app/admin/scenarios/page.tsx",
  "apps/web/src/app/admin/packs/page.tsx",
  "apps/web/src/lib/auth/roles.ts",
  "apps/web/src/components/admin/admin-shell.tsx",
  "apps/web/src/components/auth/role-route-guard.tsx",
  "apps/api/app/routers/admin.py"
)
foreach ($f in $adminFiles) {
  Add-Result "8.3 Admin" $f $(if (Test-Path $f) { "PASS" } else { "FAIL" })
}

# 8.4 sklearn readiness
$mlFiles = @(
  "apps/api/app/services/readiness_model.py",
  "apps/api/tests/test_readiness_model.py"
)
foreach ($f in $mlFiles) {
  Add-Result "8.4 ML readiness" $f $(if (Test-Path $f) { "PASS" } else { "FAIL" })
}

$req = Get-Content "apps/api/requirements.txt" -Raw -ErrorAction SilentlyContinue
Add-Result "8.4 ML readiness" "scikit-learn in requirements" $(if ($req -match "scikit-learn") { "PASS" } else { "FAIL" })

# 8.5 Pack publisher CDN
$packScripts = @(
  "apps/web/scripts/upload-content-pack.mjs"
)
foreach ($f in $packScripts) {
  Add-Result "8.5 CDN packs" $f $(if (Test-Path $f) { "PASS" } else { "FAIL" })
}

# 8.6 No copyrighted PDFs in git
$pdfHits = @(Get-ChildItem -Recurse -Include *.pdf -ErrorAction SilentlyContinue |
  Where-Object { $_.FullName -notmatch "node_modules|\.venv|\.next" })
$pdfCount = $pdfHits.Count
$pdfStatus = if ($pdfCount -eq 0) { "PASS" } else { "WARN" }
Add-Result "8.6 Copyright" "no PDFs in repo" $pdfStatus "$pdfCount PDF(s) found"

# 8.7 Python tests (readiness model) — run from apps/api
try {
  if (Test-Path ".venv/Scripts/python.exe") {
    $pyLocal = ".venv/Scripts/python.exe"
  } elseif (Test-Path ".venv/bin/python") {
    $pyLocal = ".venv/bin/python"
  } else {
    $pyLocal = "python"
  }
  & $pyLocal -m pytest tests/test_readiness_model.py -q 2>&1 | Out-Null
  Add-Result "8.4 ML readiness" "pytest readiness_model" $(if ($LASTEXITCODE -eq 0) { "PASS" } else { "FAIL" })
} catch {
  Add-Result "8.4 ML readiness" "pytest readiness_model" "SKIP" "pytest not available"
}
Pop-Location

# Summary
Write-Host ""
$pass = ($results | Where-Object { $_.Status -eq "PASS" }).Count
$fail = ($results | Where-Object { $_.Status -eq "FAIL" }).Count
$warn = ($results | Where-Object { $_.Status -eq "WARN" }).Count

foreach ($r in $results) {
  $color = switch ($r.Status) {
    "PASS" { "Green" }
    "FAIL" { "Red" }
    "WARN" { "Yellow" }
    default { "Gray" }
  }
  $note = if ($r.Note) { " ($($r.Note))" } else { "" }
  Write-Host "[$($r.Status)] $($r.Section) - $($r.Item)$note" -ForegroundColor $color
}

Write-Host ""
Write-Host "Phase 8: $pass passed, $fail failed, $warn warnings" -ForegroundColor $(if ($fail -eq 0) { "Green" } else { "Red" })
Write-Host ""
Write-Host "Manual daily checklist:" -ForegroundColor Cyan
Write-Host "  [ ] Chrome offline - one study flow"
Write-Host "  [ ] iOS Safari install - /install guide"
Write-Host "  [ ] AI JSON parses - Nika chat + writing feedback"
Write-Host "  [ ] No copyrighted official PDFs in git"
Write-Host ""

if ($fail -gt 0) { exit 1 }
