#!/usr/bin/env bash

set -euo pipefail

repo_root="${1:-.}"

if [[ -z "${CI_REPO_TOKEN:-}" || -z "${CI_REPOSITORY:-}" || -z "${CI_SHA:-}" || -z "${CI_CLONE_URL_BASE:-}" ]]; then
  echo "CI checkout environment is incomplete. Required: CI_REPO_TOKEN, CI_REPOSITORY, CI_SHA, CI_CLONE_URL_BASE." >&2
  exit 1
fi

cd "${repo_root}"
rm -rf .git
git init .
git remote add origin "${CI_CLONE_URL_BASE}/${CI_REPOSITORY}.git"
git -c http.extraHeader="Authorization: Bearer ${CI_REPO_TOKEN}" fetch --no-tags origin "${CI_SHA}"
git checkout --detach FETCH_HEAD
