#!/usr/bin/env bash

set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "${script_dir}/.." && pwd)"
release_dir="${1:-${RELEASE_DIR:-${repo_root}/.build/release}}"
release_name="$(basename "${release_dir}")"
archive_dir="${repo_root}/.build"
archive_path="${archive_dir}/${release_name}.tar.gz"

DEPLOY_PORT="${DEPLOY_PORT:-22}"
DEPLOY_POST_HOOK="${DEPLOY_POST_HOOK:-}"
SKIP_LOCAL_BRANCH_CHECK="${SKIP_LOCAL_BRANCH_CHECK:-0}"
SSH_IDENTITY_FILE="${SSH_IDENTITY_FILE:-$HOME/.ssh/id_ed25519}"
SSH_COMMON_OPTS=(
  -i "${SSH_IDENTITY_FILE}"
  -o IdentitiesOnly=yes
  -o PreferredAuthentications=publickey
  -o PubkeyAuthentication=yes
  -o StrictHostKeyChecking=yes
  -p "${DEPLOY_PORT}"
)

if [[ ! -d "${release_dir}" ]]; then
  echo "Release directory not found: ${release_dir}" >&2
  exit 1
fi

if [[ -z "${DEPLOY_HOST:-}" || -z "${DEPLOY_USER:-}" || -z "${DEPLOY_PATH:-}" ]]; then
  echo "Deploy environment is incomplete. Required: DEPLOY_HOST, DEPLOY_USER, DEPLOY_PATH." >&2
  exit 1
fi

if ! command -v tar >/dev/null 2>&1; then
  echo "tar not found. Install tar to deploy the release directory." >&2
  exit 1
fi

if ! command -v scp >/dev/null 2>&1; then
  echo "scp not found. Install OpenSSH client to deploy the release directory." >&2
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

mkdir -p "${archive_dir}"
rm -f "${archive_path}"
tar -C "$(dirname "${release_dir}")" -czf "${archive_path}" "${release_name}"

remote_tmp_archive="/tmp/${release_name}.tar.gz"
remote_tmp_dir="/tmp/${release_name}-extract"

scp "${SSH_COMMON_OPTS[@]}" "${archive_path}" "${DEPLOY_USER}@${DEPLOY_HOST}:${remote_tmp_archive}"

ssh "${SSH_COMMON_OPTS[@]}" "${DEPLOY_USER}@${DEPLOY_HOST}" <<EOF
set -euo pipefail
rm -rf "${remote_tmp_dir}"
mkdir -p "${remote_tmp_dir}" "${DEPLOY_PATH}"
tar -xzf "${remote_tmp_archive}" -C "${remote_tmp_dir}"
find "${DEPLOY_PATH}" -mindepth 1 -maxdepth 1 -exec rm -rf {} +
cp -R "${remote_tmp_dir}/${release_name}/." "${DEPLOY_PATH}/"
rm -rf "${remote_tmp_dir}" "${remote_tmp_archive}"
EOF

if [[ -n "${DEPLOY_POST_HOOK}" ]]; then
  ssh "${SSH_COMMON_OPTS[@]}" "${DEPLOY_USER}@${DEPLOY_HOST}" "${DEPLOY_POST_HOOK}"
fi

rm -f "${archive_path}"

echo
echo "Deploy completed successfully."
