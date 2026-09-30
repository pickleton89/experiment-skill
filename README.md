# experiment-skill

A [Claude Code](https://docs.anthropic.com/en/docs/claude-code) skill suite for managing the full lifecycle of computational science documentation: adopt, plan, capture, findings, report. Each command is a markdown prompt template that Claude Code executes as a slash command.

## Isolated location-contract candidate (2026-09-08)

This candidate supports a portable research-project.json plus an explicit host location
mapping across all six command definitions. See [the canonical contract](docs/graph.md)
and [examples](examples/README.md). Use scripts/locations.mjs with --start and --locations
to resolve the code, research and work folders before command execution. No shell exports
or live installation changes are implied. Node 20+ is required for the resolver; the
commands document a file-tool fallback for hosts without Node.

Run node --test tests/*.test.mjs for local contract checks. Actual prompt execution and
Codex/Claude/Cowork/Chat acceptance remain unverified; defer installation/promotion.
The installation examples below describe the existing release mechanism, not permission
to replace live command links with this candidate.

## Prerequisites

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) CLI installed and configured

## Install

### As a Claude Code plugin (recommended)

> **Status:** packaging only. The location-contract candidate described above is still unverified in live app runs, and promotion remains deferred. Install the plugin from a branch or release you have decided to promote.

This repo is its own single-plugin marketplace:

```
/plugin marketplace add pickleton89/experiment-skill
/plugin install experiment-skill@experiment-skill
```

Per the Claude Code plugin docs, plugin commands are namespaced by plugin name, for example `/experiment-skill:experiment-init`. The commands resolve the location-contract scripts through `${CLAUDE_PLUGIN_ROOT}/scripts/`. Update with `/plugin marketplace update experiment-skill`.

**Optional companion:** the commands checkpoint `WORK.md` through the separate `research-work` skill (its `work-records.mjs` helper), which is not bundled here. Without it, the checkpoint step is reported as blocked and the `WORK.md` record is left unchanged; all other commands work normally.

If you previously used the symlink install below, remove those links (`./uninstall.sh --global`, or `./uninstall.sh` in each project) to avoid duplicate commands.

### In Claude Science (skill import)

Claude Science imports `skills/<name>/SKILL.md` directories, not slash commands. The `skills/` folder in this repo is generated from `.claude/commands/` by `scripts/build-skills.mjs`, so the importer can read it. In **Skills → Import from GitHub**, paste `https://github.com/pickleton89/experiment-skill`, preview, select the six skills, and import. Imports are copied as-is and do not update automatically; re-import to pick up changes.

Not yet verified in Claude Science: whether `$ARGUMENTS` is filled in for imported skills, and whether Node is available for `scripts/locations.mjs`. The commands document a file-tool fallback for hosts without Node, and `${CLAUDE_PLUGIN_ROOT}` is only defined when installed as a Claude Code plugin.

### Legacy: symlink install (development)

Use this when editing the commands in place. Clone the skill repo once, then install into any project:

```bash
git clone https://github.com/pickleton89/experiment-skill.git ~/projects/experiment-skill

# Install into your project (from the project directory)
cd /path/to/my-project
~/projects/experiment-skill/install.sh
```

This creates symlinks in your project's `.claude/commands/` so the commands are available when working in that project. Verify by running `/experiment-init --help` in a Claude Code session.

### Updating

When the skill repo gets new commands or updates:

```bash
cd ~/projects/experiment-skill && git pull            # pull latest
cd /path/to/my-project && .claude/update-experiment-skill.sh   # update project
```

The update script is created during install and remembers where the skill repo lives.

### Other options

```bash
~/projects/experiment-skill/install.sh --global       # install to ~/.claude/commands/ (all sessions)
~/projects/experiment-skill/uninstall.sh              # remove from current project
~/projects/experiment-skill/uninstall.sh --global     # remove from ~/.claude/commands/
```

## Commands

| Command | Purpose | Output Location |
|---------|---------|----------------|
| `/experiment-adopt` | Audit existing project for lifecycle onboarding | `01-documentation/` or project root |
| `/experiment-init` | Scaffold project directory structure | `01-documentation/`, `02-scripts/`, ... |
| `/experiment-plan` | Create structured plan with phases & success criteria | `01-documentation/plans/` |
| `/experiment-capture` | Generate process artifact from session context | `01-documentation/process/` |
| `/experiment-findings` | Synthesize results into findings document | `06-reports/findings/` |
| `/experiment-report` | Compile comprehensive report from findings | `06-reports/` |

## Usage

### 0. Adopt an existing project (optional)

```bash
/experiment-adopt ./my-existing-project --deep
```

Scans an existing project directory, classifies artifacts, identifies documentation gaps, and produces a read-only adoption report with a prioritized onboarding roadmap. Use this before `init` when adopting a mid-stream project.

### 1. Initialize a project

```bash
/experiment-init my_project --description "Structural comparison of aptamer variants"
```

Adds missing lifecycle files at the resolved research/code/work locations. Existing legacy trees remain supported; new split projects keep their scientific index in research, use canonical AGENTS.md with a CLAUDE.md import, and preserve existing files.

### 2. Create a plan

```bash
/experiment-plan boltz2_analysis
```

Interactive: walks through objectives, phases, expected outputs, and success criteria. Writes to `01-documentation/plans/boltz2_analysis_plan.md`.

### 3. Capture process artifacts

```bash
/experiment-capture boltz2_analysis tier1
```

Extracts commands, scripts, data lineage, measurements, decisions, and issues from the current conversation. Writes an 8-section process artifact to `01-documentation/process/boltz2_analysis_process_tier1.md`.

### 4. Generate findings

```bash
/experiment-findings boltz2_analysis tier1
```

Reads result files, process artifacts, and plan success criteria. Produces a 5-section findings document at `06-reports/findings/boltz2_analysis_findings_tier1.md`.

### 5. Compile report

```bash
/experiment-report boltz2_analysis
```

Integrates all findings into an IMRAD-style report at `06-reports/boltz2_analysis_report.md`. Optional `--oligon` flag generates branded PDF via pandoc.

## Lifecycle

```
[existing project] -> Adopt -> Init -> Plan -> Execute -> Capture -> Findings -> Report
                                                            ^                      |
                                                            \--- next phase ------/
```

For new projects, start with `init`. For existing mid-stream projects, start with `adopt` to audit and plan onboarding.

Each command reads and updates `01-documentation/INDEX.md` to maintain a documentation registry across the project.

## Naming Convention

All artifacts use a linked naming scheme:

```
{workstream}_{type}_{qualifier}.md
```

Examples: `boltz2_analysis_plan.md`, `boltz2_analysis_process_tier1.md`, `boltz2_analysis_findings_tier1.md`, `boltz2_analysis_report.md`

## Graph and Examples

- **[docs/graph.md](docs/graph.md)** — Hub document with command relationships, data flow map, canonical definitions (naming convention, status enum, INDEX.md update protocol), and wikilink resolution convention.
- **[examples/](examples/)** — Full synthetic examples — `rna_folding` for lifecycle stages, `protein_docking` for adoption:
  - `adopt-example.md` — adoption report for a mid-stream docking benchmark
  - `plan-example.md` — 3-phase plan (data prep, prediction, validation)
  - `capture-example.md` — 8-section process artifact for phase 1
  - `findings-example.md` — findings with 2 analysis units
  - `report-example.md` — IMRAD report integrating all phases

## Design

See [docs/design.md](docs/design.md) for the full design document.

## Changelog

See [docs/changelog.md](docs/changelog.md).

## License

[MIT](LICENSE)
