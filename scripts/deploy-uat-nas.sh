#!/usr/bin/env bash

set -euo pipefail

NAS_HOST="${NAS_HOST:-192.168.1.77}"
NAS_USER="${NAS_USER:-avryahov}"
NAS_PATH="${NAS_PATH:-/volume1/web/portfolio}"
NAS_BRANCH="${NAS_BRANCH:-dev}"
LOCAL_BRANCH="$(git branch --show-current 2>/dev/null || true)"

if [[ -z "${LOCAL_BRANCH}" ]]; then
  echo "Unable to detect local git branch." >&2
  exit 1
fi

if [[ "${LOCAL_BRANCH}" != "${NAS_BRANCH}" ]]; then
  echo "Local branch is '${LOCAL_BRANCH}', expected '${NAS_BRANCH}' before UAT deploy." >&2
  exit 1
fi

echo "Deploying '${NAS_BRANCH}' to Synology UAT:"
echo "  host: ${NAS_HOST}"
echo "  user: ${NAS_USER}"
echo "  path: ${NAS_PATH}"
echo

ssh "${NAS_USER}@${NAS_HOST}" <<EOF
set -euo pipefail
cd "${NAS_PATH}"
git fetch origin
git checkout "${NAS_BRANCH}"
git pull --ff-only origin "${NAS_BRANCH}"
bash scripts/version.sh sync
echo
echo "UAT updated"
echo "Branch: \$(git branch --show-current)"
echo "Commit: \$(git rev-parse --short HEAD)"
echo "Version: \$(bash scripts/version.sh current)"
EOF
