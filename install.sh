#!/usr/bin/env bash
# install.sh — Symlink experiment skill commands to ~/.claude/commands/
# Safe: won't overwrite non-symlink files. Idempotent.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_DIR="${SCRIPT_DIR}/.claude/commands"
TARGET_DIR="${HOME}/.claude/commands"

COMMANDS=(
  experiment-adopt.md
  experiment-init.md
  experiment-plan.md
  experiment-capture.md
  experiment-findings.md
  experiment-report.md
)

# Verify source files exist
missing=0
for cmd in "${COMMANDS[@]}"; do
  if [[ ! -f "${SOURCE_DIR}/${cmd}" ]]; then
    echo "ERROR: Source file not found: ${SOURCE_DIR}/${cmd}"
    missing=1
  fi
done
if [[ $missing -eq 1 ]]; then
  echo "Aborting. Ensure all command files exist in .claude/commands/"
  exit 1
fi

# Create target directory
mkdir -p "${TARGET_DIR}"

# Create symlinks
installed=0
skipped=0
for cmd in "${COMMANDS[@]}"; do
  target="${TARGET_DIR}/${cmd}"
  source="${SOURCE_DIR}/${cmd}"

  if [[ -L "${target}" ]]; then
    # Existing symlink — update it
    rm "${target}"
    ln -s "${source}" "${target}"
    echo "  Updated: ${cmd}"
    installed=$((installed + 1))
  elif [[ -e "${target}" ]]; then
    # Existing non-symlink file — don't overwrite
    echo "  Skipped: ${cmd} (non-symlink file exists at ${target})"
    skipped=$((skipped + 1))
  else
    # No existing file — create symlink
    ln -s "${source}" "${target}"
    echo "  Installed: ${cmd}"
    installed=$((installed + 1))
  fi
done

echo ""
echo "Done: ${installed} installed, ${skipped} skipped"
echo "Commands available as: /experiment-adopt, /experiment-init, /experiment-plan, /experiment-capture, /experiment-findings, /experiment-report"
