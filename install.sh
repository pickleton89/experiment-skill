#!/usr/bin/env bash
# install.sh — Install experiment skill commands into a project or globally.
#
# Default:   local install to $PWD/.claude/commands/ (per-project)
# --global:  install to ~/.claude/commands/ (available in all sessions)
#
# Local installs create .claude/update-experiment-skill.sh for easy updates.
# Safe: won't overwrite non-symlink files. Idempotent.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_DIR="${SCRIPT_DIR}/.claude/commands"

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
      echo "Usage: install.sh [--global]"
      echo ""
      echo "  (default)   Install into current project (.claude/commands/)"
      echo "  --global    Install into ~/.claude/commands/ (all sessions)"
      echo ""
      echo "Local installs create .claude/update-experiment-skill.sh for updates."
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

# For local installs: write breadcrumb and update wrapper
if [[ "$MODE" == "local" ]]; then
  CLAUDE_DIR="${TARGET_DIR%/commands}"

  # Breadcrumb: records skill repo path for update wrapper
  echo "${SCRIPT_DIR}" > "${CLAUDE_DIR}/.experiment-skill-source"

  # Update wrapper: lets users re-run install from the project directory
  cat > "${CLAUDE_DIR}/update-experiment-skill.sh" <<'WRAPPER'
#!/usr/bin/env bash
set -euo pipefail
BREADCRUMB="$(cd "$(dirname "$0")" && pwd)/.experiment-skill-source"
if [[ ! -f "$BREADCRUMB" ]]; then
  echo "ERROR: No experiment-skill source found. Re-install from the skill repo."
  exit 1
fi
SKILL_REPO="$(cat "$BREADCRUMB")"
if [[ ! -f "${SKILL_REPO}/install.sh" ]]; then
  echo "ERROR: Skill repo not found at: $SKILL_REPO"
  echo "Has it moved? Re-install from the new location."
  exit 1
fi
echo "Updating from: $SKILL_REPO"
exec "${SKILL_REPO}/install.sh"
WRAPPER
  chmod +x "${CLAUDE_DIR}/update-experiment-skill.sh"
fi

echo ""
echo "Done: ${installed} installed, ${skipped} skipped"
if [[ "$MODE" == "local" ]]; then
  echo "Installed to: ${TARGET_DIR}"
  echo "To update later: .claude/update-experiment-skill.sh"
else
  echo "Installed globally to: ${TARGET_DIR}"
fi
echo "Commands: /experiment-adopt, -init, -plan, -capture, -findings, -report"
