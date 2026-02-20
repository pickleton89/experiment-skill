#!/usr/bin/env bash
# uninstall.sh — Remove experiment skill symlinks from ~/.claude/commands/
# Safe: only removes symlinks, never deletes regular files.

set -euo pipefail

TARGET_DIR="${HOME}/.claude/commands"

COMMANDS=(
  experiment-adopt.md
  experiment-init.md
  experiment-plan.md
  experiment-capture.md
  experiment-findings.md
  experiment-report.md
)

removed=0
skipped=0
for cmd in "${COMMANDS[@]}"; do
  target="${TARGET_DIR}/${cmd}"

  if [[ -L "${target}" ]]; then
    rm "${target}"
    echo "  Removed: ${cmd}"
    removed=$((removed + 1))
  elif [[ -e "${target}" ]]; then
    echo "  Skipped: ${cmd} (not a symlink — manual removal required)"
    skipped=$((skipped + 1))
  else
    echo "  Not found: ${cmd}"
  fi
done

echo ""
echo "Done: ${removed} removed, ${skipped} skipped"
