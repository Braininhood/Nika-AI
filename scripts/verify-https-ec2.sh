#!/usr/bin/env bash
# Quick HTTPS / Caddy diagnostics on EC2. Run from repo root.
set -euo pipefail

DOMAIN="${1:-nika-oet.fun}"
EXPECTED_IP="${2:-16.60.104.34}"

echo "=== DNS: $DOMAIN ==="
RESOLVED="$(dig +short "$DOMAIN" 2>/dev/null | tail -1 || true)"
echo "  A record: ${RESOLVED:-<none>}"
echo "  Expected: $EXPECTED_IP"
if [[ "$RESOLVED" != "$EXPECTED_IP" ]]; then
  echo "  WARN: DNS does not match Elastic IP — Let's Encrypt will fail"
fi

echo ""
echo "=== Caddy service ==="
if systemctl is-active --quiet caddy 2>/dev/null; then
  echo "  status: active"
else
  echo "  status: NOT RUNNING — run: sudo systemctl enable caddy && sudo systemctl restart caddy"
fi
systemctl is-enabled caddy 2>/dev/null && echo "  enabled: yes" || echo "  enabled: no"

echo ""
echo "=== Caddyfile ==="
if [[ -f /etc/caddy/Caddyfile ]]; then
  sudo caddy validate --config /etc/caddy/Caddyfile 2>&1 | sed 's/^/  /'
else
  echo "  MISSING /etc/caddy/Caddyfile"
  echo "  Fix: sudo cp /opt/Nika-AI/deploy/caddy/Caddyfile /etc/caddy/Caddyfile"
fi

echo ""
echo "=== Ports (local) ==="
ss -tlnp 2>/dev/null | grep -E ':80 |:443 ' || echo "  WARN: nothing listening on 80/443"

echo ""
echo "=== HTTP redirect (must be 301/308 → https) ==="
curl -sI "http://$DOMAIN" 2>&1 | head -5 | sed 's/^/  /' || echo "  FAIL: cannot reach http://$DOMAIN"

echo ""
echo "=== HTTPS + certificate ==="
if curl -sfI "https://$DOMAIN" >/tmp/https-head.txt 2>/tmp/https-err.txt; then
  head -8 /tmp/https-head.txt | sed 's/^/  /'
  echo | openssl s_client -connect "${DOMAIN}:443" -servername "$DOMAIN" 2>/dev/null \
    | openssl x509 -noout -subject -dates 2>/dev/null | sed 's/^/  cert: /'
else
  echo "  FAIL: HTTPS error"
  sed 's/^/  /' /tmp/https-err.txt 2>/dev/null || true
  echo "  Recent Caddy logs:"
  sudo journalctl -u caddy -n 15 --no-pager 2>/dev/null | sed 's/^/    /' || true
fi

echo ""
echo "=== Next.js (localhost:3000) ==="
curl -sf -o /dev/null -w "  web HTTP %{http_code}\n" http://127.0.0.1:3000/ || echo "  FAIL: Nika-AI-web not responding"

echo ""
echo "Done. If HTTPS fails: fix DNS → open SG ports 80+443 → copy Caddyfile → sudo systemctl restart caddy"
