# Phase 6 automated verification — RAG + Nika tutor
# Run from repo root: pnpm verify:phase6

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
Write-Host "=== OET Coach Phase 6 Verification ===" -ForegroundColor Cyan
Write-Host ""

# 6.1 RAG backend
$apiFiles = @(
  "apps/api/app/services/embeddings.py",
  "apps/api/app/services/rag.py",
  "apps/api/app/services/llm.py",
  "apps/api/app/services/nika_guard.py",
  "apps/api/app/services/nika_tutor.py",
  "apps/api/app/services/study_advice.py",
  "apps/api/app/services/quota.py",
  "apps/api/app/services/practice_tasks.py",
  "apps/api/app/services/user_skill_map.py",
  "apps/api/app/services/feedback_llm.py",
  "apps/api/app/data/rag_corpus.json",
  "scripts/ingest_rag.py"
)
foreach ($f in $apiFiles) {
  Add-Result "6.1 RAG" $f $(if (Test-Path $f) { "PASS" } else { "FAIL" })
}

$aiRouter = Get-Content "apps/api/app/routers/ai.py" -Raw -ErrorAction SilentlyContinue
Add-Result "6.1 RAG" "nika_tutor wired in ai.py" $(if ($aiRouter -match "answer_nika_chat") { "PASS" } else { "FAIL" })
Add-Result "6.1 RAG" "topic guard in ai flow" $(if ($aiRouter -match "NikaChatRequest") { "PASS" } else { "FAIL" })

Add-Result "6.1 RAG" "study-plan endpoint" $(if ($aiRouter -match "nika_study_plan") { "PASS" } else { "FAIL" })
Add-Result "6.1 RAG" "skill-map profile endpoints" $(if ((Get-Content "apps/api/app/routers/profile.py" -Raw) -match "me/skill-map") { "PASS" } else { "FAIL" })
Add-Result "6.1 RAG" "LLM feedback enrichment" $(if ((Get-Content "apps/api/app/routers/ai.py" -Raw) -match "enrich_writing_feedback") { "PASS" } else { "FAIL" })

# 6.1b Docs
$docFiles = @(
  "docs/07-IMPLEMENTATION/09-phase6-handoff.md",
  "docs/07-IMPLEMENTATION/10-phase6-smoke-test.md"
)
foreach ($f in $docFiles) {
  Add-Result "6.1 Docs" $f $(if (Test-Path $f) { "PASS" } else { "FAIL" })
}

# 6.2 Frontend Nika
$webFiles = @(
  "apps/web/src/lib/nika/chat.ts",
  "apps/web/src/lib/nika/context.ts",
  "apps/web/src/lib/nika/topic-guard.ts",
  "apps/web/src/lib/nika/offline-reply.ts",
  "apps/web/src/lib/nika/practice-tasks.ts",
  "apps/web/src/lib/profile/service.ts",
  "apps/web/src/lib/auth/sync-session-user.ts",
  "apps/web/src/components/nika/nika-chat.tsx",
  "apps/web/src/app/(study)/nika/page.tsx",
  "apps/web/src/app/(study)/materials/page.tsx"
)
foreach ($f in $webFiles) {
  Add-Result "6.2 Nika UI" $f $(if (Test-Path $f) { "PASS" } else { "FAIL" })
}

# 6.3 Tests
$testFiles = @(
  "apps/web/src/lib/nika/topic-guard.test.ts",
  "apps/web/src/lib/nika/offline-reply.test.ts",
  "apps/web/src/lib/nika/practice-tasks.test.ts",
  "apps/api/tests/test_nika_guard.py",
  "apps/api/tests/test_study_advice.py",
  "apps/api/tests/test_practice_tasks.py",
  "apps/api/tests/test_user_skill_map.py"
)
foreach ($f in $testFiles) {
  Add-Result "6.3 Tests" $f $(if (Test-Path $f) { "PASS" } else { "FAIL" })
}

# 6.4 Vitest
Write-Host "Running vitest (nika)..." -ForegroundColor Yellow
Push-Location (Join-Path $root "apps\web")
pnpm exec vitest run src/lib/nika/topic-guard.test.ts src/lib/nika/offline-reply.test.ts src/lib/nika/practice-tasks.test.ts src/components/nika/nika-message-text.test.ts 2>&1 | Out-Null
$vitestOk = $LASTEXITCODE -eq 0
Pop-Location
Add-Result "6.4 Vitest" "nika unit tests" $(if ($vitestOk) { "PASS" } else { "FAIL" })

# 6.5 Python guard tests
$python = Join-Path $root "apps\api\.venv\Scripts\python.exe"
if (Test-Path $python) {
  Write-Host "Running nika guard tests..." -ForegroundColor Yellow
  Push-Location (Join-Path $root "apps\api")
  $env:PYTHONPATH = "."
  & $python tests/test_nika_guard.py 2>&1 | Out-Null
  $guardOk = $LASTEXITCODE -eq 0
  & $python tests/test_study_advice.py 2>&1 | Out-Null
  $adviceOk = $LASTEXITCODE -eq 0
  & $python tests/test_practice_tasks.py 2>&1 | Out-Null
  $practiceOk = $LASTEXITCODE -eq 0
  & $python tests/test_user_skill_map.py 2>&1 | Out-Null
  $skillOk = $LASTEXITCODE -eq 0
  $pytestOk = $guardOk -and $adviceOk -and $practiceOk -and $skillOk
  Pop-Location
  Add-Result "6.5 Python" "nika + study advice tests" $(if ($pytestOk) { "PASS" } else { "FAIL" })
} else {
  Add-Result "6.5 Pytest" "venv missing" "SKIP" "run pip install in apps/api"
}

# Summary
Write-Host ""
$pass = ($results | Where-Object { $_.Status -eq "PASS" }).Count
$fail = ($results | Where-Object { $_.Status -eq "FAIL" }).Count
$skip = ($results | Where-Object { $_.Status -eq "SKIP" }).Count

$results | Format-Table -AutoSize
Write-Host ""
Write-Host "PASS: $pass  FAIL: $fail  SKIP: $skip" -ForegroundColor $(if ($fail -eq 0) { "Green" } else { "Red" })
Write-Host ""

if ($fail -gt 0) { exit 1 }
exit 0
