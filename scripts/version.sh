#!/usr/bin/env bash

set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "${script_dir}/.." && pwd)"
version_file="${repo_root}/version.env"
footer_file="${repo_root}/components/footer.html"
main_js_file="${repo_root}/assets/js/main.js"

if [[ ! -f "${version_file}" ]]; then
  echo "version file not found: ${version_file}" >&2
  exit 1
fi

# shellcheck disable=SC1090
source "${version_file}"

git_count() {
  git -C "${repo_root}" rev-list --count HEAD
}

git_short_hash() {
  git -C "${repo_root}" rev-parse --short HEAD
}

date_stamp() {
  date '+%Y%m%d'
}

component_stamp() {
  printf '%s-%s' "$(date '+%Y%m%d')" "$(git_count)"
}

patch_number() {
  local total_count
  total_count="$(git_count)"
  if (( total_count < PATCH_BASE_COUNT )); then
    echo "git commit count ${total_count} is below PATCH_BASE_COUNT ${PATCH_BASE_COUNT}" >&2
    exit 1
  fi
  printf '%s' "$((total_count - PATCH_BASE_COUNT))"
}

full_version() {
  printf '%s.%s.%s.%s.%s' \
    "${MAJOR}" \
    "${MINOR}" \
    "$(patch_number)" \
    "$(date_stamp)" \
    "$(git_short_hash)"
}

write_version_state() {
  cat > "${version_file}" <<EOF
MAJOR=${MAJOR}
MINOR=${MINOR}
PATCH_BASE_COUNT=${PATCH_BASE_COUNT}
EOF
}

sync_footer_version() {
  local version_string
  local comp_version

  version_string="$(full_version)"
  comp_version="$(component_stamp)"

  perl -0pi -e 's/Сборка\s+[0-9]+\.[0-9]+\.[0-9]+\.[0-9]{8}\.[0-9a-f]+/"Сборка '"${version_string}"'"/ge' "${footer_file}"
  perl -0pi -e "s/componentVersion = '\\d{8}-\\d+';/componentVersion = '${comp_version}';/g" "${main_js_file}"

  printf '%s\n' "${version_string}"
}

print_usage() {
  cat <<'EOF'
Usage:
  ./scripts/version.sh current
  ./scripts/version.sh sync
  ./scripts/version.sh minor
  ./scripts/version.sh major

Commands:
  current  Print the current full build version.
  sync     Refresh the footer build badge and component cache version.
  minor    Increment MINOR, reset patch counting to zero from the current git history point, then sync.
  major    Increment MAJOR, reset MINOR to zero, reset patch counting to zero from the current git history point, then sync.
EOF
}

command="${1:-current}"

case "${command}" in
  current)
    full_version
    ;;
  sync)
    sync_footer_version
    ;;
  minor)
    MINOR="$((MINOR + 1))"
    PATCH_BASE_COUNT="$(git_count)"
    write_version_state
    sync_footer_version
    ;;
  major)
    MAJOR="$((MAJOR + 1))"
    MINOR=0
    PATCH_BASE_COUNT="$(git_count)"
    write_version_state
    sync_footer_version
    ;;
  *)
    print_usage
    exit 1
    ;;
esac
