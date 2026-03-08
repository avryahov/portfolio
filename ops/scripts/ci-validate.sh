#!/usr/bin/env bash

set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "${script_dir}/../.." && pwd)"

required_files=(
  "index.html"
  "README.md"
  "components/header.html"
  "components/footer.html"
  "assets/js/main.js"
  "ops/scripts/version.sh"
  "ops/scripts/deploy-uat-nas.sh"
  "ops/scripts/deploy-prod-cloud.sh"
  "ops/deploy/uat/env.sh"
  "ops/deploy/prod/env.sh"
  "version.env"
)

for file in "${required_files[@]}"; do
  if [[ ! -f "${repo_root}/${file}" ]]; then
    echo "Required file is missing: ${file}" >&2
    exit 1
  fi
done

echo "Current build version: $(bash "${repo_root}/ops/scripts/version.sh" current)"

echo "CI validation passed."
