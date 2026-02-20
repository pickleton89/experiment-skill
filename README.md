# experiment-skill

A Claude Code skill (`/experiment`) for managing the full lifecycle of computational science documentation.

## Overview

`/experiment` provides standardized project scaffolding, plan creation, process artifact capture, findings synthesis, and report compilation for computational science workflows.

### Subcommands

| Command | Purpose |
|---------|---------|
| `/experiment init` | Scaffold project structure and install templates |
| `/experiment plan` | Create a structured plan with phases and checkpoints |
| `/experiment capture` | Generate a process artifact from current session context |
| `/experiment findings` | Generate a findings document from analysis results |
| `/experiment report` | Compile comprehensive research report |

## Development

```bash
uv sync
uv run python main.py
```

## Design

See [experiment-skill-design.md](experiment-skill-design.md) for the full design document.
