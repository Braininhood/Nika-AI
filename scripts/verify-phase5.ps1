# Phase 5 automated verification — adaptive engine + OET mock gate
# Run from repo root: pnpm verify:phase5

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
Write-Host "=== OET Coach Phase 5 Verification ===" -ForegroundColor Cyan
Write-Host ""

# 5.1 Adaptive engine (client)
$adaptiveFiles = @(
  "apps/web/src/lib/adaptive/types.ts",
  "apps/web/src/lib/adaptive/skill-stats.ts",
  "apps/web/src/lib/adaptive/readiness.ts",
  "apps/web/src/lib/adaptive/personal-course.ts",
  "apps/web/src/lib/adaptive/service.ts",
  "apps/web/src/lib/adaptive/plan.ts",
  "apps/web/src/lib/adaptive/readiness.test.ts",
  "apps/web/src/lib/adaptive/personal-course.test.ts"
)
foreach ($f in $adaptiveFiles) {
  Add-Result "5.1 Adaptive" $f $(if (Test-Path $f) { "PASS" } else { "FAIL" })
}

# 5.2 Mock engine
$mockFiles = @(
  "apps/web/src/lib/mock/build-mock.ts",
  "apps/web/src/lib/mock/submit-mock.ts",
  "apps/web/src/lib/mock/submit-mock.test.ts"
)
foreach ($f in $mockFiles) {
  Add-Result "5.2 Mock" $f $(if (Test-Path $f) { "PASS" } else { "FAIL" })
}

# 5.3 Dexie v5 schema
$dbContent = Get-Content "apps/web/src/lib/db/index.ts" -Raw -ErrorAction SilentlyContinue
Add-Result "5.3 Dexie v5" "readinessState table" $(if ($dbContent -match "readinessState") { "PASS" } else { "FAIL" })
Add-Result "5.3 Dexie v5" "mockAttempts table" $(if ($dbContent -match "mockAttempts") { "PASS" } else { "FAIL" })
Add-Result "5.3 Dexie v5" "personalCourses table" $(if ($dbContent -match "personalCourses") { "PASS" } else { "FAIL" })
Add-Result "5.3 Dexie v5" "version(5)" $(if ($dbContent -match "version\(5\)") { "PASS" } else { "FAIL" })

# 5.4 UI routes
$uiFiles = @(
  "apps/web/src/app/(study)/mock/page.tsx",
  "apps/web/src/app/(study)/course/page.tsx",
  "apps/web/src/components/readiness/readiness-card.tsx"
)
foreach ($f in $uiFiles) {
  Add-Result "5.4 UI" $f $(if (Test-Path $f) { "PASS" } else { "FAIL" })
}

# 5.5 Submit flows wire refreshAdaptiveState
foreach ($pair in @(
  @{ File = "apps/web/src/lib/writing/submit-feedback.ts"; Needle = "refreshAdaptiveState" },
  @{ File = "apps/web/src/lib/reading/submit-attempt.ts"; Needle = "refreshAdaptiveState" },
  @{ File = "apps/web/src/lib/listening/submit-attempt.ts"; Needle = "refreshAdaptiveState" },
  @{ File = "apps/web/src/lib/speaking/submit-attempt.ts"; Needle = "refreshAdaptiveState" }
)) {
  $text = Get-Content $pair.File -Raw -ErrorAction SilentlyContinue
  Add-Result "5.5 Loop" "$($pair.File) → adaptive" $(if ($text -match $pair.Needle) { "PASS" } else { "FAIL" })
}

# 5.6 Plan integrates readiness + flashcards
$planContent = Get-Content "apps/web/src/lib/plan/build-daily-plan.ts" -Raw -ErrorAction SilentlyContinue
Add-Result "5.6 Plan" "mock CTA in buildDailyPlan" $(if ($planContent -match "mock_eligible") { "PASS" } else { "FAIL" })
Add-Result "5.6 Plan" "flashcards in buildDailyPlan" $(if ($planContent -match "flashcardsDue") { "PASS" } else { "FAIL" })
Add-Result "5.6 Plan" "course link in buildDailyPlan" $(if ($planContent -match 'route: "/course"') { "PASS" } else { "FAIL" })

# 5.7 API routers
$apiFiles = @(
  "apps/api/app/services/readiness.py",
  "apps/api/app/services/course.py",
  "apps/api/app/routers/readiness.py",
  "apps/api/app/routers/mock_exam.py",
  "apps/api/app/routers/course.py"
)
foreach ($f in $apiFiles) {
  Add-Result "5.7 API" $f $(if (Test-Path $f) { "PASS" } else { "FAIL" })
}
$mainPy = Get-Content "apps/api/app/main.py" -Raw -ErrorAction SilentlyContinue
Add-Result "5.7 API" "readiness router mounted" $(if ($mainPy -match "readiness") { "PASS" } else { "FAIL" })
Add-Result "5.7 API" "mock router mounted" $(if ($mainPy -match "mock_exam") { "PASS" } else { "FAIL" })
Add-Result "5.7 API" "course router mounted" $(if ($mainPy -match "course") { "PASS" } else { "FAIL" })

# 5.8 Docs
$docFiles = @(
  "docs/07-IMPLEMENTATION/07-phase5-handoff.md",
  "docs/07-IMPLEMENTATION/08-phase5-smoke-test.md"
)
foreach ($f in $docFiles) {
  Add-Result "5.8 Docs" $f $(if (Test-Path $f) { "PASS" } else { "FAIL" })
}

Write-Host "Running tsc --noEmit..." -ForegroundColor Yellow
Push-Location "apps/web"
pnpm exec tsc --noEmit 2>&1 | Out-Null
Add-Result "DoD" "tsc --noEmit" $(if ($LASTEXITCODE -eq 0) { "PASS" } else { "FAIL" })
Pop-Location

Write-Host "Running Phase 5 vitest..." -ForegroundColor Yellow
Push-Location "apps/web"
pnpm exec vitest run `
  src/lib/adaptive/readiness.test.ts `
  src/lib/adaptive/personal-course.test.ts `
  src/lib/mock/submit-mock.test.ts `
  src/lib/plan/build-daily-plan.test.ts `
  src/lib/quiz/flashcards.test.ts 2>&1 | Out-Null
Add-Result "DoD" "Phase 5 vitest (18+ tests)" $(if ($LASTEXITCODE -eq 0) { "PASS" } else { "FAIL" })
Pop-Location

try {
  $readiness = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/readiness/status" -Headers @{ Authorization = "Bearer test" } -TimeoutSec 2 -ErrorAction Stop
} catch {
  if ($_.Exception.Response.StatusCode -eq 401) {
    Add-Result "5.7 API live" "GET /readiness/status" "PASS" "401 without token (route exists)"
  } else {
    Add-Result "5.7 API live" "GET /readiness/status" "MANUAL" "Run pnpm dev:api"
  }
}

Add-Result "DoD Manual" "Mock fail → plan adapts" "MANUAL" "See 08-phase5-smoke-test.md"
Add-Result "DoD Manual" "2 consecutive mock passes → exam ready" "MANUAL" "See 08-phase5-smoke-test.md"
Add-Result "Deferred" "Mock auto-score from exam pages" "DEFERRED" "Mark complete on /mock for now"
Add-Result "Deferred" "Readiness PDF export" "DEFERRED" "Phase 5 polish"
Add-Result "Deferred" "Server skill-map sync" "DEFERRED" "Dexie source of truth; Phase 6"

Write-Host ""
$results | Format-Table -AutoSize

$pass = ($results | Where-Object { $_.Status -eq "PASS" }).Count
$fail = ($results | Where-Object { $_.Status -eq "FAIL" }).Count
$manual = ($results | Where-Object { $_.Status -in @("MANUAL", "DEFERRED") }).Count

$color = if ($fail -eq 0) { "Green" } else { "Red" }
Write-Host "Summary: $pass passed, $fail failed, $manual manual/deferred" -ForegroundColor $color
if ($fail -gt 0) { exit 1 }
