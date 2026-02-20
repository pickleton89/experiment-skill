# CLAUDE.md

## What This Is

A Claude Code skill suite for computational science documentation. Six slash commands manage the full lifecycle from project onboarding through final report:

| Command | Purpose |
|---------|---------|
| `/experiment-adopt` | Audit existing project for lifecycle onboarding (read-only) |
| `/experiment-init` | Scaffold project directory structure |
| `/experiment-plan` | Define objectives, phases, and success criteria |
| `/experiment-capture` | Record process artifact from session context |
| `/experiment-findings` | Synthesize results into findings document |
| `/experiment-report` | Compile comprehensive report from findings |

The skill is pure markdown — no Python runtime. Each command is a `.md` file in `.claude/commands/` that Claude Code executes as a prompt template.

## Common Commands

```bash
./install.sh               # install into current project (default: local)
./install.sh --global      # install to ~/.claude/commands/ (all sessions)
.claude/update-experiment-skill.sh   # update project from skill repo
./uninstall.sh             # remove from current project
./uninstall.sh --global    # remove from ~/.claude/commands/
```

Both scripts are idempotent and safe (won't overwrite non-symlink files). Local installs create `.claude/update-experiment-skill.sh` (wrapper that re-runs install from the saved source path). There is no build step, linter, or test suite — validation is manual by invoking commands in Claude Code.

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

- **Stateless** — no state files; `INDEX.md` is the only shared registry
- **Embedded templates** — each command contains its full output template
- **Read-only adopt** — never moves files; produces advisory report only
- **Opt-in branding** — only `/experiment-report --oligon` triggers branded PDF

## Key Files

| Path | Purpose |
|------|---------|
| `.claude/commands/experiment-*.md` | The 6 command files (the product) |
| `docs/graph.md` | Single source of truth: command relationships, naming convention, status enum, INDEX.md update protocol, wikilinks |
| `docs/design.md` | Full design rationale and architecture decisions |
| `examples/` | Synthetic examples: `rna_folding` (lifecycle), `protein_docking` (adoption) |
| `install.sh` / `uninstall.sh` | Symlink management scripts |

## Editing Commands

When modifying a command file, preserve:

- The `<!-- template-version: 1.0 -->` tag on line 1 and lifecycle comment on line 2
- The Phase 0/1/2 structure and `$ARGUMENTS` variable reference
- The workstream naming validation block (pattern: `[a-z][a-z0-9_]{1,38}[a-z0-9]`)
- The canonical INDEX.md update protocol (8-step block copied from `docs/graph.md`)
- The "Downstream Dependencies", "Do Not", and "Handling Incomplete Context" sections

The embedded template in Phase 1 defines the output contract — section numbering, YAML frontmatter fields, and table schemas. Downstream commands depend on these (e.g., `/experiment-findings` reads process artifact tables).

**Propagation rule:** When updating the INDEX.md protocol, update `docs/graph.md` first (canonical source), then propagate the identical block to all 5 lifecycle commands (adopt, plan, capture, findings, report).

## Gotchas

- In bash under `set -e`, `((var++))` exits with code 1 when incrementing from 0 to 1. Use `var=$((var + 1))` instead.
