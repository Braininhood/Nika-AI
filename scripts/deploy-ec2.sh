#!/usr/bin/env bash
# Redeploy on EC2 after git pull — same stack as local dev (no Docker).
# Usage: ./scripts/deploy-ec2.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> pnpm install"
npm install -g pnpm 2>/dev/null || true
pnpm install

echo "==> Python API deps"
cd apps/api
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt -q
cd "$ROOT"

echo "==> Build Next.js"
pnpm build

echo "==> Restart services"
sudo systemctl restart oet-coach-api
sudo systemctl restart oet-coach-web

echo "==> Status"
sudo systemctl --no-pager status oet-coach-api oet-coach-web
curl -sf http://127.0.0.1:8000/health | head -c 200
echo ""
curl -sf -o /dev/null -w "web HTTP %{http_code}\n" http://127.0.0.1:3000/
