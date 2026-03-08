#!/usr/bin/env bash

set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "${script_dir}/.." && pwd)"
release_dir="${1:-${RELEASE_DIR:-${repo_root}/.build/release}}"

DEPLOY_PORT="${DEPLOY_PORT:-22}"
DEPLOY_POST_HOOK="${DEPLOY_POST_HOOK:-}"
SKIP_LOCAL_BRANCH_CHECK="${SKIP_LOCAL_BRANCH_CHECK:-0}"

if [[ ! -d "${release_dir}" ]]; then
  echo "Release directory not found: ${release_dir}" >&2
  exit 1
fi

if [[ -z "${DEPLOY_HOST:-}" || -z "${DEPLOY_USER:-}" || -z "${DEPLOY_PATH:-}" ]]; then
  echo "Deploy environment is incomplete. Required: DEPLOY_HOST, DEPLOY_USER, DEPLOY_PATH." >&2
  exit 1
fi

if ! command -v rsync >/dev/null 2>&1; then
  echo "rsync not found. Install rsync to deploy the release directory." >&2
  exit 1
fi

if ! command -v ssh >/dev/null 2>&1; then
  echo "ssh not found. Install OpenSSH client to deploy the release directory." >&2
  exit 1
fi

LOCAL_BRANCH="$(git -C "${repo_root}" branch --show-current 2>/dev/null || true)"

if [[ -n "${DEPLOY_BRANCH:-}" && "${SKIP_LOCAL_BRANCH_CHECK}" != "1" && "${LOCAL_BRANCH}" != "${DEPLOY_BRANCH}" ]]; then
  echo "Local branch is '${LOCAL_BRANCH}', expected '${DEPLOY_BRANCH}' before deploy." >&2
  exit 1
fi

echo "Deploying release directory:"
echo "  source: ${release_dir}"
echo "  host: ${DEPLOY_HOST}"
echo "  port: ${DEPLOY_PORT}"
echo "  user: ${DEPLOY_USER}"
echo "  path: ${DEPLOY_PATH}"
echo

ssh -p "${DEPLOY_PORT}" "${DEPLOY_USER}@${DEPLOY_HOST}" "mkdir -p '${DEPLOY_PATH}'"

rsync \
  -az \
  --delete \
  --omit-dir-times \
  --no-perms \
  -e "ssh -p ${DEPLOY_PORT}" \
  "${release_dir}/" \
  "${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/"

if [[ -n "${DEPLOY_POST_HOOK}" ]]; then
  ssh -p "${DEPLOY_PORT}" "${DEPLOY_USER}@${DEPLOY_HOST}" "${DEPLOY_POST_HOOK}"
fi

echo
echo "Deploy completed successfully."
