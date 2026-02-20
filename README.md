# experiment-skill

A [Claude Code](https://docs.anthropic.com/en/docs/claude-code) skill suite for managing the full lifecycle of computational science documentation: adopt, plan, capture, findings, report. Each command is a markdown prompt template that Claude Code executes as a slash command.

## Prerequisites

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) CLI installed and configured

## Install

Clone the skill repo once, then install into any project:

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
~/projects/experiment-skill/install.sh --global   # install to ~/.claude/commands/ (all sessions)
./uninstall.sh            # remove from current project (run from skill repo)
./uninstall.sh --global   # remove from ~/.claude/commands/
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

Creates the numbered directory tree (`01-documentation/` through `07-publication/`), `INDEX.md`, project `CLAUDE.md`, and `README.md`.

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
