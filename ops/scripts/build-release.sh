#!/usr/bin/env bash

set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "${script_dir}/../.." && pwd)"
site_root="${repo_root}/site"
release_dir="${1:-${repo_root}/.build/release}"

publish_entries=(
  "assets"
  "components"
  "education"
  "inverter"
  "open-solutions"
  "orgmu"
  "qualification"
  "services"
  "teaching"
  "favicon.ico"
  "index.html"
  "manifest.webmanifest"
)

if ! command -v cp >/dev/null 2>&1; then
  echo "cp not found. Cannot build the release directory." >&2
  exit 1
fi

rm -rf "${release_dir}"
mkdir -p "${release_dir}"

for entry in "${publish_entries[@]}"; do
  if [[ ! -e "${site_root}/${entry}" ]]; then
    echo "Publish entry is missing: ${entry}" >&2
    exit 1
  fi
  cp -R "${site_root}/${entry}" "${release_dir}/"
done

bash "${repo_root}/ops/scripts/version.sh" stamp "${release_dir}" >/dev/null

echo "Release directory prepared at: ${release_dir}"
echo "Build version: $(bash "${repo_root}/ops/scripts/version.sh" current)"
