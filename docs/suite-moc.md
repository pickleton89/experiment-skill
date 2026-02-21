# Experiment Lifecycle Suite

<!-- template-version: 1.0 -->

Linked documentation lifecycle for computational science projects. Six commands manage the full arc from project audit through structured planning, session capture, findings synthesis, and integrated reporting. Pure markdown — no runtime dependencies.

---

## Entry Points

- **New projects:** `/experiment-init` to scaffold, then `/experiment-plan` to define phases
- **Existing projects:** `/experiment-adopt` to audit, then `/experiment-init` to overlay

## Lifecycle Sequence

```
adopt -> init -> plan -> [execute] -> capture -> findings -> report
                                        ^                      |
                                        \--- next phase ------/
```

## Commands

| Command | Purpose |
|---------|---------|
| `/experiment-adopt` | Audit existing project for lifecycle onboarding (read-only) |
| `/experiment-init` | Scaffold project directory structure |
| `/experiment-plan` | Define objectives, phases, and success criteria |
| `/experiment-capture` | Record process artifact from session context |
| `/experiment-findings` | Synthesize results into findings document |
| `/experiment-report` | Compile comprehensive IMRAD-style report |

## Domain

`research-tools`, `scientific-communication`

## Cross-Suite Edges

| Direction | External Skill | Relationship |
|-----------|---------------|--------------|
| adopt -> | project-scaffold | Suggest scaffolding when project needs structure |
| plan -> | statistical-analysis | Analysis design, power calculations |
| plan -> | hypothesis-generation | Formalize research questions |
| capture -> | plotting-libraries | Visualize quantitative measurements |
| capture -> | reproducible-research | Environment and data lineage capture |
| findings -> | scientific-writing | Draft manuscript sections |
| findings -> | scientific-slides | Present findings |
| findings -> | peer-review | Self-review before reporting |
| report -> | markdown-to-pdf | PDF output |
| report -> | scientific-slides | Presentation from report |
| report -> | paper-2-web | Interactive web version |
| <- | project-scaffold | Init overlays onto scaffold projects |
| <- | oligon-brand | Branded styling via --oligon |

## Gaps / Demand Signals

- Cross-workstream comparison (report covers one workstream only)
- Workstream status dashboard (no at-a-glance project state)
- Automated figure generation (manual step between capture and findings)
- Context recovery for interrupted work (capture handles single sessions)
- Retrospective plan creation (adopt identifies phases but plan requires manual input)

## Key Files

| File | Purpose |
|------|---------|
| `docs/graph.md` | Canonical definitions, data flow, wikilinks |
| `docs/design.md` | Architecture decisions and rationale |
| `docs/suite-moc.md` | This file — suite-level discovery |
| `examples/` | Synthetic lifecycle examples |
| `install.sh` / `uninstall.sh` | Symlink management |
