#!/usr/bin/env bash
set -euo pipefail

PORT="${1:-8080}"
HOST="${2:-127.0.0.1}"
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "${script_dir}/../.." && pwd)"
site_root="${repo_root}/site"

if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 not found. Install Python 3 to run local server." >&2
  exit 1
fi

if [[ ! -d "${site_root}" ]]; then
  echo "site root not found: ${site_root}" >&2
  exit 1
fi

echo "Serving static site at http://${HOST}:${PORT}"
echo "Press Ctrl+C to stop"
cd "${site_root}"
python3 -m http.server "${PORT}" --bind "${HOST}"
