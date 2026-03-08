#!/usr/bin/env bash

set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "${script_dir}/.." && pwd)"

required_files=(
  "index.html"
  "README.md"
  "components/header.html"
  "components/footer.html"
  "assets/js/main.js"
  "scripts/version.sh"
  "scripts/deploy-uat-nas.sh"
  "scripts/deploy-prod-cloud.sh"
  "version.env"
)

tracked_metadata_files=(
  "components/footer.html"
  "assets/js/main.js"
)

for file in "${required_files[@]}"; do
  if [[ ! -f "${repo_root}/${file}" ]]; then
    echo "Required file is missing: ${file}" >&2
    exit 1
  fi
done

echo "Current build version: $(bash "${repo_root}/scripts/version.sh" current)"

tmp_dir="$(mktemp -d)"
trap 'rm -rf "${tmp_dir}"' EXIT

for file in "${tracked_metadata_files[@]}"; do
  mkdir -p "${tmp_dir}/$(dirname "${file}")"
  cp "${repo_root}/${file}" "${tmp_dir}/${file}"
done

bash "${repo_root}/scripts/version.sh" sync >/dev/null

metadata_changed=0

for file in "${tracked_metadata_files[@]}"; do
  if ! cmp -s "${tmp_dir}/${file}" "${repo_root}/${file}"; then
    metadata_changed=1
    break
  fi
done

if [[ "${metadata_changed}" == "1" ]]; then
  echo "Generated version artifacts are out of sync." >&2
  echo "Run './scripts/version.sh sync' and commit the changes." >&2
  git -C "${repo_root}" --no-pager diff -- "${tracked_metadata_files[@]}" >&2
  exit 1
fi

echo "CI validation passed."
