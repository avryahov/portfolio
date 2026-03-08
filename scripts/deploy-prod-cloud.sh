#!/usr/bin/env bash

set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "${script_dir}/.." && pwd)"

# shellcheck disable=SC1091
source "${repo_root}/deploy/prod/env.sh"

LOCAL_BRANCH="$(git -C "${repo_root}" branch --show-current 2>/dev/null || true)"

if [[ -z "${LOCAL_BRANCH}" ]]; then
  echo "Unable to detect local git branch." >&2
  exit 1
fi

if [[ "${LOCAL_BRANCH}" != "${DEPLOY_BRANCH}" ]]; then
  echo "Local branch is '${LOCAL_BRANCH}', expected '${DEPLOY_BRANCH}' before PROD deploy." >&2
  exit 1
fi

if [[ -z "${DEPLOY_HOST}" ]]; then
  echo "DEPLOY_HOST is empty. Set the real PROD host in deploy/prod/env.sh or export DEPLOY_HOST=..." >&2
  exit 1
fi

echo "Deploying '${DEPLOY_BRANCH}' to cloud PROD:"
echo "  host: ${DEPLOY_HOST}"
echo "  port: ${DEPLOY_PORT}"
echo "  user: ${DEPLOY_USER}"
echo "  path: ${DEPLOY_PATH}"
echo

ssh -p "${DEPLOY_PORT}" "${DEPLOY_USER}@${DEPLOY_HOST}" <<EOF
set -euo pipefail
cd "${DEPLOY_PATH}"
if ! git rev-parse --show-toplevel >/dev/null 2>&1; then
  echo "Remote path '${DEPLOY_PATH}' is not a readable git repository on PROD." >&2
  exit 1
fi
git fetch origin
git checkout "${DEPLOY_BRANCH}"
git pull --ff-only origin "${DEPLOY_BRANCH}"
bash ../scripts/version.sh sync
bash nginx/reload-nginx.sh
echo
echo "PROD updated"
echo "Branch: \$(git branch --show-current)"
echo "Commit: \$(git rev-parse --short HEAD)"
echo "Version: \$(bash ../scripts/version.sh current)"
EOF
