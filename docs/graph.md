# Experiment Skill — Graph Hub

<!-- template-version: 1.0 -->

Single source of truth for command relationships, canonical definitions, and navigation across the experiment skill suite.

---

## Command Overview

| Command | Purpose | Output Location | Sections |
|---------|---------|----------------|----------|
| [[experiment-init]] | Scaffold project structure | `01-documentation/` tree | 3-phase (context, create, report) |
| [[experiment-plan]] | Define objectives, phases, success criteria | `01-documentation/plans/` | 6 sections |
| [[experiment-capture]] | Record process artifact from session | `01-documentation/process/` | 8 sections |
| [[experiment-findings]] | Synthesize results into findings | `06-reports/findings/` | 5 sections |
| [[experiment-report]] | Compile comprehensive report | `06-reports/` | 7 sections |

---

## Lifecycle Diagram

```
init -> plan -> [execute work] -> capture -> findings -> report
                                    ^                      |
                                    \--- next phase ------/
```

Each cycle through `capture -> findings` corresponds to one plan phase/tier. The report integrates all findings into a single deliverable.

### Phase Transitions

| From | To | Trigger |
|------|----|---------|
| init | plan | Project structure exists |
| plan | execute | Plan is `active` |
| execute | capture | Phase work is complete or at a checkpoint |
| capture | findings | Process artifact written, results curated in `05-results/` |
| findings | report | All scoped findings complete |
| findings | execute | Next phase begins (loop back) |

---

## Data Flow and Downstream Dependencies

```
                    +-----------+
                    |   init    |  creates: directory tree, INDEX.md, CLAUDE.md
                    +-----+-----+
                          |
                    +-----v-----+
                    |   plan    |  creates: {workstream}_plan.md
                    +-----+-----+
                          |
                    +-----v-----+
                    |  capture  |  reads: plan (phases, success criteria)
                    |           |  creates: {workstream}_process_{qualifier}.md
                    +-----+-----+
                          |
                    +-----v-----+
                    | findings  |  reads: plan (success criteria), process (methods,
                    |           |         measurements), result files (05-results/)
                    |           |  creates: {workstream}_findings_{scope}.md
                    +-----+-----+
                          |
                    +-----v-----+
                    |  report   |  reads: plan (objectives), process (methods, lineage),
                    |           |         findings (results, interpretations)
                    |           |  creates: {workstream}_report.md
                    +-----------+
```

### What Each Command Reads from Upstream Artifacts

| Consumer | Source | Sections Read |
|----------|--------|---------------|
| capture | plan | Phase definitions (scope, outputs, checkpoint triggers, success criteria) |
| findings | plan | Success criteria tables (Section 5, per-phase Section 3 criteria) |
| findings | process | Methods (Section 3), Measurements (Section 6), Decisions (Section 5) |
| findings | result files | CSVs, summary tables, figures in `05-results/` |
| report | plan | Objectives (Section 1), overall success criteria (Section 5) |
| report | process | Methods (Section 3), data lineage (Section 3), decisions (Section 5) |
| report | findings | Results (Section 2), cross-analysis (Section 3), assessment (Section 4) |

---

## Canonical Definitions

### Naming Convention

<!-- anchor: naming-convention -->

All artifacts follow the pattern:

```
{workstream}_{type}_{qualifier}.md
```

**Workstream validation pattern:** `[a-z][a-z0-9_]{1,38}[a-z0-9]`
- Lowercase letters, digits, and underscores only
- Must start with a letter
- Must end with a letter or digit
- Length: 3-40 characters

**Type values:**

| Type | Command | Example |
|------|---------|---------|
| `plan` | experiment-plan | `rna_folding_plan.md` |
| `process` | experiment-capture | `rna_folding_process_phase1.md` |
| `findings` | experiment-findings | `rna_folding_findings_phase1.md` |
| `report` | experiment-report | `rna_folding_report.md` |

**Qualifier** maps to plan phases or tiers (e.g., `phase1`, `tier2`, `validation`). Reports typically omit the qualifier.

### Status Values

<!-- anchor: status-values -->

```
pending | active | in-progress | complete | superseded
```

| Status | Meaning | Used By |
|--------|---------|---------|
| `pending` | Defined but not started | plans |
| `active` | Currently the governing document | plans |
| `in-progress` | Work underway | process artifacts |
| `complete` | Finished | process artifacts, findings |
| `superseded` | Replaced by a newer version | plans, findings |

### INDEX.md Update Protocol

<!-- anchor: indexmd-protocol -->

Every lifecycle command (plan, capture, findings, report) updates INDEX.md using this canonical 8-step protocol. Copy this block verbatim — do not paraphrase or abbreviate.

```
INDEX.md Update Protocol:

1. LOCATE: Find INDEX.md at project root or in 01-documentation/.
2. READ: Read the entire file content.
3. FIND SECTION: Find the target section heading (## Plans, ## Process Artifacts,
   ## Findings, or ## Reports). If the section does not exist, create it with
   the appropriate table header.
4. FIND TABLE: Locate the markdown table under that section heading.
5. CHECK DUPLICATES: Scan existing rows for a row matching this workstream +
   qualifier + filename. If found, update the row's date and status instead
   of appending.
6. APPEND ROW: Add a new row to the table with the format specified for that
   section type:
   - Plans:    | {date} | {workstream} | [{filename}]({path}) | {status} |
   - Process:  | {date} | {workstream} | {qualifier} | [{filename}]({path}) | {status} |
   - Findings: | {date} | {workstream} | {scope} | [{filename}]({path}) | {status} |
   - Reports:  | {date} | {workstream} | [{filename}]({path}) | {format} |
7. UPDATE TIMESTAMP: Update the "Last Updated: {YYYY-MM-DD}" line at the top
   of INDEX.md to today's date.
8. WRITE: Write the modified content back to INDEX.md.
```

---

## Wikilink Resolution Convention

Wikilinks use `[[ ]]` syntax for graph navigation between and within files.

### Resolution Rules

| Wikilink | Resolves To |
|----------|-------------|
| `[[experiment-init]]` | `.claude/commands/experiment-init.md` |
| `[[experiment-plan]]` | `.claude/commands/experiment-plan.md` |
| `[[experiment-capture]]` | `.claude/commands/experiment-capture.md` |
| `[[experiment-findings]]` | `.claude/commands/experiment-findings.md` |
| `[[experiment-report]]` | `.claude/commands/experiment-report.md` |
| `[[graph]]` | `docs/graph.md` (this file) |
| `[[graph#naming-convention]]` | `docs/graph.md` Section: Naming Convention |
| `[[graph#status-values]]` | `docs/graph.md` Section: Status Values |
| `[[graph#indexmd-protocol]]` | `docs/graph.md` Section: INDEX.md Update Protocol |
| `[[examples/plan-example]]` | `examples/plan-example.md` |
| `[[examples/capture-example]]` | `examples/capture-example.md` |
| `[[examples/findings-example]]` | `examples/findings-example.md` |
| `[[examples/report-example]]` | `examples/report-example.md` |

### Placement Convention

- **In HTML comments** (`<!-- see [[graph#naming-convention]] -->`) — navigation hints for the LLM during command execution
- **In visible markdown** (`See [[graph]] for canonical definitions.`) — documentation for human readers

---

## Example File Index

All examples use the `rna_folding` workstream (3 phases: data preparation, structure prediction, validation) so readers can trace data across the full lifecycle.

| Example | Lifecycle Stage | File |
|---------|----------------|------|
| Plan | plan | [[examples/plan-example]] |
| Process artifact | capture | [[examples/capture-example]] |
| Findings | findings | [[examples/findings-example]] |
| Report | report | [[examples/report-example]] |

---

## Target Project Structure

Created by [[experiment-init]], consumed by all subsequent commands:

```
01-documentation/           Plans, process artifacts, reference docs
  plans/                    Structured plan documents
  process/                  Process artifacts (session records)
  reference/                External protocols, standards
  templates/                Document templates
  notes/                    Informal working notes
  INDEX.md                  Documentation registry (shared state)
02-scripts/                 Analysis scripts (numbered)
03-data/                    Input data
  raw/                      Immutable raw data
  reference/                Reference datasets
04-analysis/                Intermediate working outputs (gitignored)
05-results/                 Final curated results
06-reports/                 Reports and findings
  findings/                 Per-phase/tier findings
07-publication/             Manuscripts, final PDFs, presentation figures
config/                     Project configuration
```
