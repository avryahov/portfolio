#!/usr/bin/env bash
set -euo pipefail

# Bootstrap nginx from repo config on Ubuntu/Debian.
# Usage:
#   bash /var/www/portfolio/deploy/nginx/bootstrap-nginx.sh
#
# Optional env vars:
#   PROJECT_DIR=/var/www/portfolio
#   NGINX_CONF_NAME=portfolio.conf
#   PRIMARY_DOMAIN=itpuh.ru
#   PRIMARY_DOMAIN_ALT=xn--h1aoifk.xn--p1ai
#   PRIMARY_DOMAIN_UNICODE=итпух.рф

PROJECT_DIR="${PROJECT_DIR:-/var/www/portfolio}"
NGINX_CONF_NAME="${NGINX_CONF_NAME:-portfolio.conf}"
PRIMARY_DOMAIN="${PRIMARY_DOMAIN:-itpuh.ru}"
PRIMARY_DOMAIN_ALT="${PRIMARY_DOMAIN_ALT:-xn--h1aoifk.xn--p1ai}"
PRIMARY_DOMAIN_UNICODE="${PRIMARY_DOMAIN_UNICODE:-итпух.рф}"

SRC_CONF="${PROJECT_DIR}/deploy/nginx/${NGINX_CONF_NAME}"
DST_AVAIL="/etc/nginx/sites-available/${NGINX_CONF_NAME}"
DST_ENABLED="/etc/nginx/sites-enabled/${NGINX_CONF_NAME}"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run as root." >&2
  exit 1
fi

if [[ ! -f "${SRC_CONF}" ]]; then
  echo "Source config not found: ${SRC_CONF}" >&2
  exit 1
fi

cp "${SRC_CONF}" "${DST_AVAIL}"
ln -sf "${DST_AVAIL}" "${DST_ENABLED}"
rm -f /etc/nginx/sites-enabled/default

ufw allow OpenSSH >/dev/null 2>&1 || true
ufw allow 'Nginx Full' >/dev/null 2>&1 || true
ufw --force enable >/dev/null 2>&1 || true

nginx -t
systemctl enable nginx
systemctl restart nginx

echo
echo "Done. Active config: ${DST_ENABLED}"
echo "Quick checks:"
echo "  ss -tulpn | grep -E ':80|:443'"
echo "  curl -I http://127.0.0.1"
echo "  curl -I http://${PRIMARY_DOMAIN}"
echo "  curl -I --resolve ${PRIMARY_DOMAIN}:80:127.0.0.1 http://${PRIMARY_DOMAIN}"
echo "  curl -I http://${PRIMARY_DOMAIN_ALT}"
echo "  curl -I --resolve ${PRIMARY_DOMAIN_ALT}:80:127.0.0.1 http://${PRIMARY_DOMAIN_ALT}"
echo
echo "Domain:"
echo "  ${PRIMARY_DOMAIN}"
echo "  ${PRIMARY_DOMAIN_UNICODE} (${PRIMARY_DOMAIN_ALT})"
echo
echo "Certbot example:"
echo "  certbot --nginx -d ${PRIMARY_DOMAIN} -d www.${PRIMARY_DOMAIN} -d ${PRIMARY_DOMAIN_ALT} -d www.${PRIMARY_DOMAIN_ALT} --redirect -m your-email@example.com --agree-tos -n"
