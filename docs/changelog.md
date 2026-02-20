# Changelog

## 2026-02-20 — Initial Implementation

- Created 5 command files in `.claude/commands/`:
  - `experiment-init.md` — project scaffolding
  - `experiment-plan.md` — structured plan creation
  - `experiment-capture.md` — process artifact generation (8-section, science-aware)
  - `experiment-findings.md` — findings synthesis from results
  - `experiment-report.md` — IMRAD-style report compilation with opt-in `--oligon` branding
- Added `install.sh` / `uninstall.sh` for symlink-based installation to `~/.claude/commands/`
- Moved design doc to `docs/design.md`
- Removed `main.py` (skill is markdown-based, no Python runtime needed)
- Updated README with install instructions and usage for all 5 commands
- All commands share: `$ARGUMENTS` input parsing, INDEX.md auto-maintenance, embedded templates, stateless operation
