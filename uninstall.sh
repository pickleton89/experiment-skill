#!/usr/bin/env bash
# uninstall.sh — Remove experiment skill commands from a project or globally.
#
# Default:   remove from $PWD/.claude/commands/ (per-project)
# --global:  remove from ~/.claude/commands/
#
# Safe: only removes symlinks, never deletes regular files.

set -euo pipefail

BREADCRUMB_NAME=".experiment-skill-source"

COMMANDS=(
  experiment-adopt.md
  experiment-init.md
  experiment-plan.md
  experiment-capture.md
  experiment-findings.md
  experiment-report.md
)

# Parse flags
MODE="local"
for arg in "$@"; do
  case "$arg" in
    --global) MODE="global" ;;
    --help|-h)
      echo "Usage: uninstall.sh [--global]"
      echo ""
      echo "  (default)   Remove from current project (.claude/commands/)"
      echo "  --global    Remove from ~/.claude/commands/"
      exit 0
      ;;
    *) echo "Unknown flag: $arg (use --help for usage)"; exit 1 ;;
  esac
done

# Determine target directory
if [[ "$MODE" == "global" ]]; then
  TARGET_DIR="${HOME}/.claude/commands"
else
  TARGET_DIR="${PWD}/.claude/commands"
fi

if [[ ! -d "${TARGET_DIR}" ]]; then
  echo "No commands directory found at: ${TARGET_DIR}"
  exit 0
fi

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

# Remove breadcrumb and update wrapper for local uninstalls
if [[ "$MODE" == "local" ]]; then
  claude_dir="${TARGET_DIR%/commands}"
  for file in ".experiment-skill-source" "update-experiment-skill.sh"; do
    if [[ -f "${claude_dir}/${file}" ]]; then
      rm "${claude_dir}/${file}"
      echo "  Removed: ${file}"
    fi
  done
fi

echo ""
echo "Done: ${removed} removed, ${skipped} skipped"
