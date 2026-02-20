# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A Claude Code skill suite for computational science documentation. Six slash commands (`/experiment-adopt`, `-init`, `-plan`, `-capture`, `-findings`, `-report`) manage the full lifecycle from existing project onboarding through final report. The skill is pure markdown — no Python runtime. Each command is a `.md` file in `.claude/commands/` that Claude Code executes as a prompt template.

## Installation and Testing

```bash
./install.sh     # symlinks .claude/commands/*.md -> ~/.claude/commands/
./uninstall.sh   # removes only symlinks, never regular files
```

Both scripts are idempotent and safe (won't overwrite non-symlink files). To test changes, re-run `./install.sh` — it updates existing symlinks in place.

There is no build step, no linter, and no test suite. Validation is manual: invoke each command in a Claude Code session and verify the output structure matches the embedded template.

## Architecture

### Command files (`.claude/commands/experiment-*.md`)

Each file is a self-contained prompt with this structure:
1. **Role statement** — first line sets Claude's persona
2. **Input section** — parses `$ARGUMENTS` (positional args + flags)
3. **Phase 0: Context Discovery** — locates project root, finds related artifacts, reads conversation context
4. **Phase 1: Generate** — produces the document using an embedded markdown template
5. **Phase 2: Write and Register** — saves the file and appends a row to `INDEX.md`

All commands share these behaviors:
- Locate project root by searching for `INDEX.md` or `01-documentation/`
- Auto-discover related artifacts by workstream name glob (e.g., `{workstream}_*plan*.md`)
- Auto-maintain `INDEX.md` — append rows to the correct table section and update timestamps
- Print usage and stop if `$ARGUMENTS` is empty or a help request
- Handle missing context gracefully (no plan? skip plan linkage; no results? note the gap)

### Lifecycle flow and artifact linkage

```
[existing project] -> adopt -> init (overlay) -> plan -> [execute work] -> capture -> findings -> report
                                                                            ^                      |
                                                                            \--- next phase ------/
```

For new projects, start with `init`. For existing mid-stream projects, start with `adopt` to audit and plan onboarding.

Artifacts link via naming convention: `{workstream}_{type}_{qualifier}.md`. The workstream prefix ties a plan to its process artifacts, findings, and report. The qualifier maps to plan phases/tiers.

### Target project structure (created by `/experiment-init`)

```
01-documentation/plans/      <- plans
01-documentation/process/    <- process artifacts (the core output)
05-results/                  <- curated results (findings reads these)
06-reports/findings/         <- per-phase findings
06-reports/                  <- comprehensive reports
```

`04-analysis/` is gitignored (intermediate working outputs). `03-data/raw/` is immutable.

## Key Design Decisions

- **Stateless** — no state files; `INDEX.md` is the only shared registry. Phase detection works by reading the plan + scanning existing process artifacts to infer what's next.
- **Embedded templates** — each command file contains its full output template. No external template files to manage.
- **Opt-in branding** — only `/experiment-report --oligon` triggers Oligon PDF generation via pandoc. Default output is plain markdown.
- **Coexists with `/research-product-synthesizer`** — that skill stays for non-science contexts; `/experiment-capture` is the science-aware evolution.

## Graph Hub and Examples

- **`docs/graph.md`** — Single source of truth for command relationships, canonical definitions (naming convention, status enum, INDEX.md update protocol), wikilink resolution convention, and data flow dependencies. All commands reference this file via `[[graph]]` wikilinks.
- **`examples/`** — Full synthetic examples — `rna_folding` for lifecycle stages (plan, capture, findings, report), `protein_docking` for adoption. Commands reference these via inline abbreviated examples + wikilinks to the full versions.

## Editing Commands

When modifying a command file, preserve:
- The `<!-- template-version: 1.0 -->` tag on line 1
- The lifecycle diagram comment on line 2
- The `$ARGUMENTS` variable reference (Claude Code substitutes user input here)
- The Phase 0/1/2 structure — discovery, generation, write+register
- The workstream naming validation block in Phase 0
- The "Handling Incomplete Context" section at the bottom (graceful degradation)
- The canonical INDEX.md update protocol (8-step block from `docs/graph.md`)
- The "Downstream Dependencies" section documenting which commands consume the output
- The "Do Not" subsection under Formatting Standards

The embedded template (inside the fenced code block in Phase 1) defines the output document structure. Section numbering, YAML frontmatter fields, and table schemas are the contract — downstream commands depend on them (e.g., `/experiment-findings` reads process artifact tables; `/experiment-report` reads findings structure).

When updating the INDEX.md protocol, update it in `docs/graph.md` first (the canonical source), then propagate the identical block to all 5 lifecycle commands (adopt, plan, capture, findings, report).

## Shell Script Gotcha

In bash under `set -e`, `((var++))` exits with code 1 when incrementing from 0 to 1. Use `var=$((var + 1))` instead. Both `install.sh` and `uninstall.sh` use this pattern.
