#!/usr/bin/env bash

set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "${script_dir}/.." && pwd)"
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

if ! command -v rsync >/dev/null 2>&1; then
  echo "rsync not found. Install rsync to build the release directory." >&2
  exit 1
fi

bash "${repo_root}/scripts/version.sh" sync >/dev/null

rm -rf "${release_dir}"
mkdir -p "${release_dir}"

for entry in "${publish_entries[@]}"; do
  if [[ ! -e "${repo_root}/${entry}" ]]; then
    echo "Publish entry is missing: ${entry}" >&2
    exit 1
  fi
  rsync -a "${repo_root}/${entry}" "${release_dir}/"
done

echo "Release directory prepared at: ${release_dir}"
echo "Build version: $(bash "${repo_root}/scripts/version.sh" current)"
