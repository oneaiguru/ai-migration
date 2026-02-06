#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}" )" && pwd)"
repo_root="$(cd "${script_dir}/.." && pwd)"
alias_file="$repo_root/scripts/shell/ccc-aliases.sh"

if [ ! -f "$alias_file" ]; then
  echo "Alias file not found: $alias_file" >&2
  exit 1
fi

shell_name="${SHELL##*/}"
case "$shell_name" in
  zsh) rc_file="$HOME/.zshrc" ;;
  bash) rc_file="$HOME/.bashrc" ;;
  *) rc_file="$HOME/.zshrc" ;;
 esac

mkdir -p "$HOME"
touch "$rc_file"

snip_alias="export CCC_REPO_ROOT=\"$repo_root\"
if [ -f \"$alias_file\" ]; then
  . \"$alias_file\"
fi"

if grep -F "$alias_file" "$rc_file" >/dev/null 2>&1; then
  echo "[install] Alias sourcing already present in $rc_file"
else
  {
    echo ""
    echo "# Claude Code Companion aliases"
    printf '%s\n' "$snip_alias"
  } >> "$rc_file"
  echo "[install] Appended alias loader to $rc_file"
fi

# shellcheck disable=SC2016
env_snip='CCC_CONFIG_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/ccc"
if [ -f "${CCC_CONFIG_DIR}/env" ]; then
  . "${CCC_CONFIG_DIR}/env"
fi'

if grep -F '/ccc/env' "$rc_file" >/dev/null 2>&1; then
  echo "[install] Env loader already present in $rc_file"
else
  {
    echo ""
    echo "# Claude Code Companion env loader"
    printf '%s\n' "$env_snip"
  } >> "$rc_file"
  echo "[install] Appended env loader to $rc_file"
fi

echo "Done. Restart your shell or run: source $rc_file"
