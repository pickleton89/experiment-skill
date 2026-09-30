# CLAUDE.md

## What This Is

A Claude Code skill suite for computational science documentation. Six slash commands manage the full lifecycle from project onboarding through final report:

| Command | Purpose |
|---------|---------|
| `/experiment-adopt` | Audit existing project; write adoption documentation |
| `/experiment-init` | Scaffold project directory structure |
| `/experiment-plan` | Define objectives, phases, and success criteria |
| `/experiment-capture` | Record process artifact from session context |
| `/experiment-findings` | Synthesize results into findings document |
| `/experiment-report` | Compile comprehensive report from findings |

The six commands are Markdown prompt templates. A dependency-free Node resolver in scripts/locations.mjs implements location contract v1. The Python scaffold adapter follows the same contract; Node is required for executable resolution, with a documented file-tool fallback on restricted hosts.

## Common Commands

```bash
# Run from skill repo (targeting the current project):
./install.sh               # install into current project (default: local)
./install.sh --global      # install to ~/.claude/commands/ (all sessions)
./uninstall.sh             # remove from current project
./uninstall.sh --global    # remove from ~/.claude/commands/

# Run from any installed project:
.claude/update-experiment-skill.sh   # update project from skill repo
```

Both scripts are idempotent and safe (won't overwrite non-symlink files). Local installs create `.claude/update-experiment-skill.sh` (wrapper that re-runs install from the saved source path). Run node --test tests/*.test.mjs for protocol consistency and resolver checks. These do not execute the prompt commands. Actual command invocation in each applicable app is a separate release gate.

## Architecture

Each command file follows a consistent structure:

1. `<!-- template-version: 1.0 -->` tag + lifecycle diagram comment (lines 1-2)
2. **Role statement** — sets Claude's persona
3. **Input section** — parses `$ARGUMENTS` (Claude Code substitutes user input)
4. **Phase 0: Context Discovery** — locates project root, finds related artifacts
5. **Phase 1: Generate** — produces the document using an embedded markdown template
6. **Phase 2: Write and Register** — saves the file and appends a row to `INDEX.md`

### Lifecycle

```
[existing project] -> adopt -> init -> plan -> [execute] -> capture -> findings -> report
                                                               ^                     |
                                                               \--- next phase -----/
```

Artifacts link via naming convention: `{workstream}_{type}_{qualifier}.md`

### Key Design Decisions

- **Declarative locations** — research-project.json stores portable identity and roles; host paths remain external. INDEX.md is the scientific artifact registry.
- **Embedded templates** — each command contains its full output template
- **Source-preserving adopt** — never moves sources; writes advisory documentation, authorized continuity and verified recovery
- **Opt-in branding** — only `/experiment-report --oligon` triggers branded PDF

## Key Files

| Path | Purpose |
|------|---------|
| `.claude/commands/experiment-*.md` | The 6 command files (the product) |
| `docs/graph.md` | Single source of truth: command relationships, naming convention, status enum, INDEX.md update protocol, wikilinks |
| `docs/design.md` | Full design rationale and architecture decisions |
| `examples/` | Synthetic examples: `rna_folding` (lifecycle), `protein_docking` (adoption) |
| `install.sh` / `uninstall.sh` | Symlink management scripts (legacy dev install) |
| `.claude-plugin/plugin.json`, `marketplace.json` | Plugin + single-plugin marketplace manifests. `plugin.json` `commands` points at `./.claude/commands`, so do not move that directory without updating it. Keep `version` identical across both manifests and `pyproject.toml` (`tests/plugin-manifest.test.mjs` enforces this). Check with `claude plugin validate . --strict`. |

## Editing Commands

When modifying a command file, preserve:

- The "Plugin install" note above the `location-contract-v1` block. It lives outside the shared block on purpose: that block must stay byte-identical with `docs/graph.md`, `docs/location-contract.md`, and the external research-work package's `references/locations.md`.
- The `<!-- template-version: 1.0 -->` tag on line 1 and lifecycle comment on line 2
- The Phase 0/1/2 structure and `$ARGUMENTS` variable reference
- The workstream naming validation block (pattern: `[a-z][a-z0-9_]{1,38}[a-z0-9]`)
- The canonical INDEX.md update protocol (8-step block copied from `docs/graph.md`)
- The "Downstream Dependencies", "Do Not", and "Handling Incomplete Context" sections

The embedded template in Phase 1 defines the output contract — section numbering, YAML frontmatter fields, and table schemas. Downstream commands depend on these (e.g., `/experiment-findings` reads process artifact tables).

**Propagation rule:** When updating the INDEX.md protocol, update `docs/graph.md` first (canonical source), then propagate the identical block to all 5 lifecycle commands (adopt, plan, capture, findings, report).

## Gotchas

- In bash under `set -e`, `((var++))` exits with code 1 when incrementing from 0 to 1. Use `var=$((var + 1))` instead.
