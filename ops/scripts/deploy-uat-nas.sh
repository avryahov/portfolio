#!/usr/bin/env bash

set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "${script_dir}/../.." && pwd)"
release_dir="${RELEASE_DIR:-${repo_root}/.build/uat}"

# shellcheck disable=SC1091
source "${repo_root}/ops/deploy/uat/env.sh"

bash "${repo_root}/ops/scripts/build-release.sh" "${release_dir}"
bash "${repo_root}/ops/scripts/deploy-static-site.sh" "${release_dir}"
