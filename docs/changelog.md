## 2026-09-30 — Skills for Claude Science import

- Claude Science rejected the plugin ("no skills/ dirs with SKILL.md") because it imports skills, not commands. Add generated `skills/<name>/SKILL.md` for all six commands via `scripts/build-skills.mjs`; commands remain canonical and a test fails on drift.
- Drop the `commands` map from `plugin.json` so the plugin exposes the skills once; descriptions now come from the generator.
- Not verified: an actual import into Claude Science, `$ARGUMENTS` handling there, and Node availability for the resolver.

## 2026-09-30 — Plugin and marketplace packaging

- Add `.claude-plugin/plugin.json` and a single-plugin `.claude-plugin/marketplace.json`; commands stay in `.claude/commands/` and are mapped one by one in the manifest with descriptions, so existing symlink installs are unaffected and listings do not show the template-version comment.
- Document `research-work` as an optional, unbundled companion; untrack `.claude/settings.local.json` and gitignore it.
- Add a plugin-path note above the shared location-contract block in each command so `scripts/` resolves through `${CLAUDE_PLUGIN_ROOT}`. The shared block is unchanged, keeping it byte-identical with the research-work package.
- Add manifest tests. `install.sh` and `uninstall.sh` remain as a legacy development route.
- Not verified: an actual command invocation from an installed plugin (expansion of `${CLAUDE_PLUGIN_ROOT}` in the command body, namespaced command names). The earlier promotion deferral for the location-contract candidate still applies.

## 2026-09-11 — Proposed release; not promoted

- Assemble the frozen repair-12 candidate for the accepted Mac workflow, including guarded history, source-access evidence, and consistent adoption/plan instructions.
- Stage 3 and the single-project Stage 4 pilot are complete within their final acceptance records; historical failures remain retained.
- Keep adoption-directory wording under manual review against init’s actual table. No full scientific run or general release is claimed.

## 2026-09-10 — Isolated repair 6: preserve dated history

- Route existing WORK checkpoints through the revision-checked research-work helper; unavailable routes leave the record unchanged and report a blocked checkpoint.
- Reject removal or rewriting of stored dated-history bytes before replacement; preserve original line endings and trailing whitespace when appending.
- Keep file-tool index recovery separate and recognize helper checkpoints in final readback checks. Live promotion and remaining acceptance failures stay deferred.

## 2026-09-08 — isolated milestone-2 repair candidate

## 2026-09-09 — Repair 5 refinement after fresh failures

- Put the complete post-edit read and claim reconciliation gate beside every final response step.
- Require named target/recovery pairs and distinguish criterion output sets, review versus issue sets, and unchanged versus baseline files.
- Scope next-step suggestions to assessed phases and omit optional aggregate counts from closing responses.
- Preserve first-round candidate and failed native evidence; rerun the refined candidate on fresh fixtures before acceptance.

## 2026-09-09 — Isolated repair 5 candidate

- Apply evidence reconciliation to adoption and planning as well as capture, findings and report, including WORK entries and final responses.
- Distinguish target-specific recovery, literal output fields, unavailable evidence, review scope and the exact artifact corrected.
- Require saved-artifact evidence links and reconcile summaries with their underlying items before delivery.

Candidate-only changes; native acceptance and promotion remain separate gates.

## 2026-09-09 — Isolated repair 4 candidate

- Require a separate full target reread after recovery verification and before each file-tool write.
- Reconcile initialization and recovery counts with enumerated snapshots; distinguish observations, fixed labels and declared expectations.
- Keep all document claims at their preparation cutoff, leave unexercised criteria untested and constrain durations to evidenced intervals.

Candidate-only repair; fresh native lifecycle and Desktop discovery acceptance remain separate gates.

- Require verified original recovery copies before every file-tool record/index edit, with stop conditions and per-edit readback.
- Clarify adoption documentation and recovery writes without granting source changes.

# Changelog

## 2026-09-08 — Isolated location-contract candidate

- Add portable project identity and explicit host mapping with a dependency-free resolver; retain legacy discovery and reject broken split locations.
- Apply shared research/index routing to all six commands, preserve existing init files, and capture actual execution identity across locations.
- Add examples and executable contract checks; prompt execution and app promotion remain separate gates.

## 2026-02-20 — Per-project install and update mechanism

- Removed unused `BREADCRUMB` variable from `install.sh`
- Fixed README uninstall commands to use full paths (matching install pattern)
- Clarified CLAUDE.md common commands: split into "from skill repo" vs "from project" groups
- Rewrote `install.sh` — default is now local install to `$PWD/.claude/commands/` (per-project)
  - `--global` flag preserves old behavior (install to `~/.claude/commands/`)
  - `--help` flag for usage
  - Creates `.claude/update-experiment-skill.sh` wrapper during local install for easy updates
  - Writes `.claude/.experiment-skill-source` breadcrumb recording skill repo path
- Rewrote `uninstall.sh` — default is now local uninstall from `$PWD/.claude/commands/`
  - `--global` flag for old behavior
  - Cleans up breadcrumb and update wrapper on local uninstall
- Updated `README.md` install section with per-project workflow and update instructions
- Updated `CLAUDE.md` common commands section

## 2026-02-20 — README and CLAUDE.md improvements

- Rewrote `CLAUDE.md` (94 → 81 lines) following best practices:
  - Replaced inline command list with scannable table
  - Added "Common Commands" and "Key Files" sections for fast onboarding
  - Removed duplicated content (target project structure, shared behaviors list)
  - Fixed stale "stop on empty args" bullet (not true for adopt)
  - Consolidated design decisions and gotchas
- Improved `README.md`:
  - Added Prerequisites section linking to Claude Code docs
  - Fixed placeholder clone URL to actual GitHub repo
  - Added install verification step
  - Added `bash` language specifier to all code blocks
  - Added License section
- Added MIT `LICENSE` file

## 2026-02-20 — Add `/experiment-adopt` command

- Created `.claude/commands/experiment-adopt.md` — pre-lifecycle command for onboarding existing mid-stream research projects
  - 6-section adoption report: audit summary, artifact inventory, workstream decomposition, gap analysis, adoption roadmap, file migration plan
  - Read-only: never moves, renames, or creates project files (only writes the adoption report)
  - Supports `--deep` flag for git history decision archaeology and `--git-history N` for commit depth
  - On-demand `## Adoptions` INDEX.md section (created by adopt, not pre-baked into init)
  - Follows Phase 0/1/2 pattern with embedded template, naming validation, and graceful degradation
- Created `examples/adopt-example.md` — `protein_docking` workstream (hypothetical docking benchmark with scripts, data, results, no docs)
- Updated `docs/graph.md`:
  - Added adopt to command overview table, lifecycle diagram, phase transitions, data flow, naming types, INDEX.md protocol row formats, wikilink resolution table, and example index
- Updated `install.sh` and `uninstall.sh` — added `experiment-adopt.md` to COMMANDS array
- Updated `CLAUDE.md` — updated command count, lifecycle diagram, and examples description to include adopt
- Updated `README.md` — added adopt to commands table, usage section, lifecycle diagram, and examples list
- Fixed Phase 0 step 1 contradiction: empty `$ARGUMENTS` now proceeds with `.` as default project path (consistent with Handling Incomplete Context)
- Fixed `docs/graph.md` INDEX.md protocol: added "adopt" to intro text and "## Adoptions" to step 3 section enumeration

## 2026-02-20 — Scaffold Detection in experiment-init

- Added three-tier detection in Phase 0 step 3 to detect `project-scaffold` projects:
  - **Tier A** — Scaffold fingerprints: `- **Type**:` line in CLAUDE.md, `.gitkeep` files, subdirectory READMEs
  - **Tier B** — Existing experiment structure: INDEX.md in `01-documentation/` or project root
  - **Tier C** — Bare directory overlap: `01-documentation/` without INDEX.md or scaffold markers
- When scaffold detected: skip redundant directory creation, append `## Experiment Lifecycle` section to existing CLAUDE.md (idempotent), create only INDEX.md and missing dirs (typically `06-reports/findings/`)
- Phase 1c now branches: scaffold path appends to `scaffold_claude_path` (root or `.claude/`); non-scaffold path writes fresh `.claude/CLAUDE.md`
- Phase 2 report distinguishes "Added" vs "Pre-existing (preserved)" when scaffold detected, with dynamic CLAUDE.md status line
- `--overwrite` flag explicitly noted as ignored for scaffold projects (overlay is non-destructive)
- Added scaffold overlay as first bullet in Handling Edge Cases section

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
