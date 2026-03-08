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

has_tracked_changes() {
  if git -C "${repo_root}" diff --quiet HEAD --; then
    return 1
  fi

  return 0
}

effective_commit_count() {
  local total_count
  total_count="$(git_count)"

  if has_tracked_changes; then
    printf '%s' "$((total_count + 1))"
    return
  fi

  printf '%s' "${total_count}"
}

date_stamp() {
  TZ="${VERSION_TZ:-Asia/Yekaterinburg}" date '+%Y%m%d'
}

component_stamp() {
  printf '%s-%s' "$(date_stamp)" "$(effective_commit_count)"
}

patch_number() {
  local total_count
  total_count="$(effective_commit_count)"
  if (( total_count < PATCH_BASE_COUNT )); then
    echo "git commit count ${total_count} is below PATCH_BASE_COUNT ${PATCH_BASE_COUNT}" >&2
    exit 1
  fi
  printf '%s' "$((total_count - PATCH_BASE_COUNT))"
}

full_version() {
  printf '%s.%s.%s.%s' \
    "${MAJOR}" \
    "${MINOR}" \
    "$(patch_number)" \
    "$(date_stamp)"
}

write_version_state() {
  cat > "${version_file}" <<EOF
MAJOR=${MAJOR}
MINOR=${MINOR}
PATCH_BASE_COUNT=${PATCH_BASE_COUNT}
EOF
}

sync_footer_version() {
  local target_root="${1:-${repo_root}}"
  local target_footer_file="${target_root}/components/footer.html"
  local target_main_js_file="${target_root}/assets/js/main.js"
  local version_string
  local comp_version

  if [[ ! -f "${target_footer_file}" || ! -f "${target_main_js_file}" ]]; then
    echo "Version stamp targets not found under: ${target_root}" >&2
    exit 1
  fi

  version_string="$(full_version)"
  comp_version="$(component_stamp)"

  perl -0pi -e 's/Сборка\s+[0-9]+\.[0-9]+\.[0-9]+\.[0-9]{8}(?:\.[0-9a-f]+)?/"Сборка '"${version_string}"'"/ge' "${target_footer_file}"
  perl -0pi -e "s/componentVersion = '\\d{8}-\\d+';/componentVersion = '${comp_version}';/g" "${target_main_js_file}"

  printf '%s\n' "${version_string}"
}

print_usage() {
  cat <<'EOF'
Usage:
  ./scripts/version.sh current
  ./scripts/version.sh sync
  ./scripts/version.sh stamp <target_root>
  ./scripts/version.sh minor
  ./scripts/version.sh major

Commands:
  current  Print the current full build version.
  sync     Refresh the footer build badge and component cache version in the repository.
  stamp    Refresh the footer build badge and component cache version under a target directory.
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
  stamp)
    target_root="${2:-}"
    if [[ -z "${target_root}" ]]; then
      echo "Usage: ./scripts/version.sh stamp <target_root>" >&2
      exit 1
    fi
    sync_footer_version "${target_root}"
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
