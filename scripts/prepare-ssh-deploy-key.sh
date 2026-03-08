#!/usr/bin/env bash

set -euo pipefail

DEPLOY_PORT="${DEPLOY_PORT:-22}"
SSH_IDENTITY_FILE="${SSH_IDENTITY_FILE:-$HOME/.ssh/id_ed25519}"

if [[ -z "${DEPLOY_SSH_KEY:-}" ]]; then
  echo "DEPLOY_SSH_KEY is empty." >&2
  exit 1
fi

mkdir -p ~/.ssh
chmod 700 ~/.ssh
printf '%s\n' "${DEPLOY_SSH_KEY}" > "${SSH_IDENTITY_FILE}"
chmod 600 "${SSH_IDENTITY_FILE}"

if [[ -n "${DEPLOY_KNOWN_HOSTS:-}" ]]; then
  printf '%s\n' "${DEPLOY_KNOWN_HOSTS}" > ~/.ssh/known_hosts
elif [[ -n "${DEPLOY_HOST:-}" ]]; then
  ssh-keyscan -p "${DEPLOY_PORT}" -H "${DEPLOY_HOST}" > ~/.ssh/known_hosts
else
  echo "DEPLOY_HOST is empty and DEPLOY_KNOWN_HOSTS was not provided." >&2
  exit 1
fi

chmod 644 ~/.ssh/known_hosts
