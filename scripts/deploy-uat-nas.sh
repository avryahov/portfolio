#!/usr/bin/env bash

set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "${script_dir}/.." && pwd)"

# shellcheck disable=SC1091
source "${repo_root}/deploy/uat/env.sh"

LOCAL_BRANCH="$(git -C "${repo_root}" branch --show-current 2>/dev/null || true)"

if [[ -z "${LOCAL_BRANCH}" ]]; then
  echo "Unable to detect local git branch." >&2
  exit 1
fi

if [[ "${LOCAL_BRANCH}" != "${DEPLOY_BRANCH}" ]]; then
  echo "Local branch is '${LOCAL_BRANCH}', expected '${DEPLOY_BRANCH}' before UAT deploy." >&2
  exit 1
fi

if [[ -z "${DEPLOY_HOST}" || -z "${DEPLOY_USER}" || -z "${DEPLOY_PATH}" ]]; then
  echo "UAT deploy environment is incomplete. Check deploy/uat/env.sh." >&2
  exit 1
fi

echo "Deploying '${DEPLOY_BRANCH}' to Synology UAT:"
echo "  host: ${DEPLOY_HOST}"
echo "  port: ${DEPLOY_PORT}"
echo "  user: ${DEPLOY_USER}"
echo "  path: ${DEPLOY_PATH}"
echo

ssh -p "${DEPLOY_PORT}" "${DEPLOY_USER}@${DEPLOY_HOST}" <<EOF
set -euo pipefail
cd "${DEPLOY_PATH}"
if ! git rev-parse --show-toplevel >/dev/null 2>&1; then
  echo "Remote path '${DEPLOY_PATH}' is not a readable git repository for user '${DEPLOY_USER}'." >&2
  echo "On Synology this usually means the repo was cloned as root; fix with: sudo -i && chown -R ${DEPLOY_USER}:users ${DEPLOY_PATH}" >&2
  exit 1
fi
git fetch origin
git checkout "${DEPLOY_BRANCH}"
git pull --ff-only origin "${DEPLOY_BRANCH}"
bash scripts/version.sh sync
echo
echo "UAT updated"
echo "Branch: \$(git branch --show-current)"
echo "Commit: \$(git rev-parse --short HEAD)"
echo "Version: \$(bash scripts/version.sh current)"
EOF
