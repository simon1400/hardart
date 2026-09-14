#!/usr/bin/env bash
# One time server setup for hardart.cz on the shared VPS (decision 029). Run as root from a folder that
# holds this script, hardart.cz.conf and hardart-headers.conf:
#
#   scp nginx/setup-server.sh nginx/hardart.cz.conf nginx/hardart-headers.conf het:/root/hardart-setup/
#   ssh het 'bash /root/hardart-setup/setup-server.sh'
#
# Safe to run again. It touches nothing that belongs to other sites: /opt/hardart, one nginx site
# file, one snippet, one certificate. Every nginx change is checked with `nginx -t` and rolled back if
# the check fails. Deploys come from GitHub Actions as root with the existing github-actions-deploy
# key, like the barbitch repos.
set -euo pipefail

HERE=$(cd "$(dirname "$0")" && pwd)
SITE=/etc/nginx/sites-available/hardart.cz
ENABLED=/etc/nginx/sites-enabled/hardart.cz
SNIPPET=/etc/nginx/snippets/hardart-headers.conf
WEBROOT=/var/www/letsencrypt
STAMP=$(date +%Y%m%d-%H%M%S)

log() { printf '\n== %s\n' "$*"; }

log "directories"
install -d -m 755 /opt/hardart /opt/hardart/releases "$WEBROOT"
ls -ld /opt/hardart /opt/hardart/releases

log "nginx backup"
tar -czf "/root/nginx-backup-hardart-$STAMP.tar.gz" -C /etc nginx
echo "/root/nginx-backup-hardart-$STAMP.tar.gz"

log "domain conflicts"
conflicts=$(grep -rlE 'server_name[^;]*[[:space:]](www\.)?hardart\.cz[;[:space:]]' \
  /etc/nginx/sites-enabled/ /etc/nginx/conf.d/ 2>/dev/null | grep -vx "$ENABLED" || true)
if [ -n "$conflicts" ]; then
  echo "hardart.cz is already served by: $conflicts" >&2
  exit 1
fi
echo none

# Installs a site config, keeps the previous one, and restores it when nginx -t fails.
apply_site() {
  local previous=""
  if [ -f "$SITE" ]; then
    previous="$SITE.bak-$STAMP"
    cp "$SITE" "$previous"
  fi
  install -m 644 "$1" "$SITE"
  ln -sfn "$SITE" "$ENABLED"
  if ! nginx -t; then
    if [ -n "$previous" ]; then cp "$previous" "$SITE"; else rm -f "$SITE" "$ENABLED"; fi
    echo "nginx -t failed, config restored" >&2
    exit 1
  fi
  systemctl reload nginx
}

log "headers snippet"
install -m 644 "$HERE/hardart-headers.conf" "$SNIPPET"

log "certificate"
if [ ! -f /etc/letsencrypt/live/hardart.cz/fullchain.pem ]; then
  # Port 80 only until the certificate exists: the full config references its files.
  bootstrap=$(mktemp)
  cat >"$bootstrap" <<'NGINX'
server {
    listen 80;
    listen [::]:80;
    server_name hardart.cz www.hardart.cz;
    location /.well-known/acme-challenge/ {
        root /var/www/letsencrypt;
    }
    location / {
        return 404;
    }
}
NGINX
  apply_site "$bootstrap"
  rm -f "$bootstrap"
  certbot certonly --webroot -w "$WEBROOT" --non-interactive --agree-tos \
    --cert-name hardart.cz -d hardart.cz -d www.hardart.cz
fi
ls -l /etc/letsencrypt/live/hardart.cz/

log "site config"
apply_site "$HERE/hardart.cz.conf"

log "neighbours still answer"
for url in https://barbitch.cz https://burgerfestival.cz https://ddsirup.co https://monitor.hardart.cz; do
  printf '%-32s %s\n' "$url" "$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "$url")"
done
echo "done. The first deploy creates /opt/hardart/current."
