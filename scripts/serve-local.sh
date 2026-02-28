#!/usr/bin/env bash
set -euo pipefail

PORT="${1:-8080}"
HOST="${2:-127.0.0.1}"

if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 not found. Install Python 3 to run local server." >&2
  exit 1
fi

echo "Serving static site at http://${HOST}:${PORT}"
echo "Press Ctrl+C to stop"
python3 -m http.server "${PORT}" --bind "${HOST}"
