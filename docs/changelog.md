# Changelog

## 2026-02-20 — Wikilinks, Examples, Determinism

- Created `docs/graph.md` — hub document with command overview, lifecycle diagram, data flow map, canonical definitions (naming convention, status enum, INDEX.md 8-step update protocol), and wikilink resolution convention
- Created 4 example files in `examples/` using `rna_folding` workstream:
  - `plan-example.md` — 3-phase plan (data prep, prediction, validation)
  - `capture-example.md` — full 8-section process artifact for phase 1
  - `findings-example.md` — findings with 2 analysis units and success criteria assessment
  - `report-example.md` — IMRAD report integrating all 3 phases
- Refactored `experiment-init.md`: consolidated Phases 0-6 into 3 phases (Context Discovery, Create All Files, Report), added `template-version` tag, lifecycle diagram, workstream naming validation, negative constraints ("Do Not" section), wikilinks to graph.md
- Updated all 4 lifecycle commands (plan, capture, findings, report) with:
  - `<!-- template-version: 1.0 -->` tag on line 1
  - Lifecycle diagram with current command highlighted
  - Workstream naming validation (pattern: `[a-z][a-z0-9_]{1,38}[a-z0-9]`)
  - Status enum comment in YAML frontmatter template
  - Canonical 8-step INDEX.md update protocol (from graph.md)
  - Section length guidance as word-count ranges in template comments
  - "Do Not" negative constraints under Formatting Standards
  - "Downstream Dependencies" section documenting consumer commands
  - Inline abbreviated example + wikilink to full example
  - Wikilinks cross-referencing adjacent commands and graph concepts
- Removed `<project_description>` tag from `experiment-capture.md`
- Updated `CLAUDE.md` with graph hub, examples, and expanded editing conventions
- Updated `README.md` with "Graph and Examples" section

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
