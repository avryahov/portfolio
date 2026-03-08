#!/usr/bin/env bash

set -euo pipefail

DEPLOY_PORT="${DEPLOY_PORT:-22}"
SSH_IDENTITY_FILE="${SSH_IDENTITY_FILE:-$HOME/.ssh/id_ed25519}"

if [[ -z "${DEPLOY_HOST:-}" || -z "${DEPLOY_USER:-}" || -z "${DEPLOY_PATH:-}" ]]; then
  echo "Deploy environment is incomplete. Required: DEPLOY_HOST, DEPLOY_USER, DEPLOY_PATH." >&2
  exit 1
fi

ssh \
  -i "${SSH_IDENTITY_FILE}" \
  -o IdentitiesOnly=yes \
  -o PreferredAuthentications=publickey \
  -o PubkeyAuthentication=yes \
  -o StrictHostKeyChecking=yes \
  -o ConnectTimeout=10 \
  -p "${DEPLOY_PORT}" \
  "${DEPLOY_USER}@${DEPLOY_HOST}" <<EOF
set -euo pipefail
test -d "${DEPLOY_PATH}"
test -f "${DEPLOY_PATH}/index.html"
test -f "${DEPLOY_PATH}/assets/js/main.js"
test -f "${DEPLOY_PATH}/components/footer.html"
test ! -d "${DEPLOY_PATH}/.git"
EOF
