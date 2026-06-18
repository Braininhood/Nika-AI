#!/usr/bin/env bash
# Redeploy on EC2 after git pull — same stack as local dev (no Docker).
# Usage: ./scripts/deploy-ec2.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ensure_swap() {
  if swapon --show 2>/dev/null | grep -q .; then
    echo "==> Swap active"
    swapon --show
    return 0
  fi
  if [[ ! -f /swapfile ]]; then
    echo "==> Creating 2G swap (required for Next.js build on t3.micro)"
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    grep -q '/swapfile' /etc/fstab 2>/dev/null || echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
  fi
  echo "==> Enabling swap"
  sudo swapon /swapfile
  swapon --show
}

OLLAMA_WAS_RUNNING=false
cleanup_build() {
  if [[ "$OLLAMA_WAS_RUNNING" == "true" ]]; then
    echo "==> Restarting ollama"
    sudo systemctl start ollama || true
  fi
}

echo "==> pnpm install"
sudo npm install -g pnpm@10
hash -r 2>/dev/null || true
pnpm -v
pnpm install

echo "==> Python API deps"
cd apps/api
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt -q
cd "$ROOT"

echo "==> Prepare for Next.js build (low RAM)"
ensure_swap
free -h

if systemctl is-active --quiet ollama 2>/dev/null; then
  OLLAMA_WAS_RUNNING=true
  echo "==> Stopping ollama during build to free RAM"
  sudo systemctl stop ollama
fi
trap cleanup_build EXIT

ENV_LOCAL="$ROOT/apps/web/.env.local"
if [[ -f "$ENV_LOCAL" ]] && [[ ! -r "$ENV_LOCAL" ]]; then
  echo "ERROR: Cannot read $ENV_LOCAL (permission denied)."
  echo "Fix: sudo chown \$(whoami):\$(whoami) $ENV_LOCAL .env && chmod 600 $ENV_LOCAL .env"
  exit 1
fi

echo "==> Build Next.js"
# t3.micro: cap Node heap; swap handles the rest. Override: NODE_MAX_OLD_SPACE_SIZE=1024
export NODE_OPTIONS="--max-old-space-size=${NODE_MAX_OLD_SPACE_SIZE:-768}"
export NEXT_TELEMETRY_DISABLED=1
pnpm build

echo "==> Install/update systemd units"
sudo cp "$ROOT/deploy/systemd/Nika-AI-api.service" /etc/systemd/system/
sudo cp "$ROOT/deploy/systemd/Nika-AI-web.service" /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable Nika-AI-api Nika-AI-web
for old in oet-coach-api oet-coach-web; do
  if systemctl is-enabled "$old" &>/dev/null; then
    echo "==> Disabling legacy unit: $old"
    sudo systemctl disable --now "$old" || true
  fi
done

echo "==> Restart services"
sudo systemctl restart Nika-AI-api
sudo systemctl restart Nika-AI-web

echo "==> Status"
sudo systemctl --no-pager status Nika-AI-api Nika-AI-web
curl -sf http://127.0.0.1:8000/health | head -c 200
echo ""
curl -sf -o /dev/null -w "web HTTP %{http_code}\n" http://127.0.0.1:3000/
