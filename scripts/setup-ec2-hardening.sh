#!/usr/bin/env bash
# OS hardening for Ubuntu 24.04 on EC2 — run once after first SSH login.
# Usage: sudo ./scripts/setup-ec2-hardening.sh
set -euo pipefail

if [[ "${EUID:-}" -ne 0 ]]; then
  echo "Run as root: sudo $0"
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive

echo "==> apt update"
apt-get update -qq

echo "==> Install unattended-upgrades + apt-listchanges"
apt-get install -y unattended-upgrades apt-listchanges

echo "==> Enable automatic security updates"
cat >/etc/apt/apt.conf.d/20auto-upgrades <<'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
APT::Periodic::AutocleanInterval "7";
APT::Periodic::Download-Upgradeable-Packages "1";
EOF

# Security updates only; no automatic reboot (reboot manually after kernel updates)
cat >/etc/apt/apt.conf.d/50unattended-upgrades <<'EOF'
Unattended-Upgrade::Allowed-Origins {
	"${distro_id}:${distro_codename}-security";
	"${distro_id}ESMApps:${distro_codename}-apps-security";
	"${distro_id}ESM:${distro_codename}-infra-security";
};
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
Unattended-Upgrade::Automatic-Reboot-Time "04:00";
EOF

dpkg-reconfigure -plow unattended-upgrades

echo "==> SSH: disable password authentication (key-only)"
SSHD="/etc/ssh/sshd_config"
if grep -q '^#\?PasswordAuthentication' "$SSHD"; then
  sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' "$SSHD"
else
  echo 'PasswordAuthentication no' >>"$SSHD"
fi
if grep -q '^#\?PermitRootLogin' "$SSHD"; then
  sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin prohibit-password/' "$SSHD"
fi
systemctl reload ssh || systemctl reload sshd || true

echo "==> Optional: fail2ban for SSH brute-force protection"
if ! command -v fail2ban-client >/dev/null 2>&1; then
  apt-get install -y fail2ban
  systemctl enable fail2ban
  systemctl start fail2ban
fi

echo "==> Dry-run unattended upgrade (no changes applied)"
unattended-upgrade --dry-run --debug 2>&1 | tail -20

echo ""
echo "Done. Security patches will install automatically."
echo "After kernel updates, reboot during a maintenance window: sudo reboot"
echo "Check logs: grep unattended /var/log/syslog | tail -20"
