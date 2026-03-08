#!/usr/bin/env bash

set -euo pipefail

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run as root." >&2
  exit 1
fi

nginx -t
systemctl reload nginx

echo "nginx config test passed and service reloaded."
