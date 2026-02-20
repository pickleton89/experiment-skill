# `/experiment` Skill — Design Document

**Date:** 2026-02-20
**Origin:** Brainstorming session during M9A9/Del 60 structural comparison project
**Status:** Design phase — ready for dedicated project setup and implementation

---

## 1. Problem Statement

When working on computational science projects (bioinformatics, structural biology, data science) with Claude Code, there is no standardized workflow for capturing the narrative of what happens during a session. The conversation itself serves as a de facto lab notebook, but it is too raw — buried in tool calls, debugging output, and back-and-forth iteration. What's needed is a structured, human-readable record of the scientific work: what was done, what was observed, what decisions were made, and what artifacts were produced.

The current `/research-product-synthesizer` command was developed as a general-purpose process artifact generator. It works but has gaps for scientific use:

- **Not domain-aware.** No concept of data lineage, experimental parameters, quantitative measurements, or tool/method documentation.
- **No lifecycle integration.** It captures a snapshot but doesn't connect to a plan, track phases, or accumulate across checkpoints.
- **No project scaffolding.** Each project reinvents its directory structure, naming conventions, and documentation standards.
- **Placement ambiguity.** Process artifacts end up in inconsistent locations because there's no standard for where they belong.

### The triggering experience

During the M9A9/Del 60 project, we executed a multi-phase analysis pipeline (6 Python scripts, 5 ChimeraX visualization phases) guided by two plan documents. Process artifacts were captured using `/research-product-synthesizer` at some milestones but not others. The result:

- 3 process docs in `01-documentation/process/` (Boltz-2 prep, execution, analysis)
- 5 process docs misplaced in `06-reports/` (ChimeraX phases 1-5)
- 2 intermediate findings reports in `06-reports/` (tier 1, tier 2)
- Inconsistent naming (`boltz2_*_process.md` vs `phase*_visualization_process.md`)
- No formal link between plan phases and their corresponding process artifacts
- ChimeraX measurement logs placed in reports rather than results

The process docs themselves were high quality — but their creation, naming, and placement were ad hoc.

---

## 2. Vision

A self-contained, project-installable skill called `/experiment` that manages the full lifecycle of computational science documentation:

```
/experiment init      — scaffold project structure and install templates
/experiment plan      — create a structured plan with phases and checkpoints
/experiment capture   — generate a process artifact from current session context
/experiment findings  — generate a findings document from analysis results
/experiment report    — compile comprehensive research report
```

The skill lives in the project's `.claude/commands/` directory (not globally), making it portable and project-specific. When you start a new computational science project, you install the experiment framework and it brings the full documentation lifecycle with it.

---

## 3. Design Principles

1. **Process artifacts are research outputs.** They are the computational equivalent of a lab notebook — not administrative overhead, but primary documentation of what was done and why.

2. **Semi-automated capture at natural checkpoints.** Plans define phases; each phase completion is a natural capture point. But manual capture must be easy for unplanned situations (debugging sessions, mid-phase pivots, context window limits).

3. **Linked lifecycle.** Every artifact connects to its parent: process artifacts link to their plan phase, findings link to their process artifacts, reports link to their findings. Naming conventions enforce these links.

4. **Personal-first, collaborator-readable.** Optimized for the user + Claude workflow (context recovery, institutional memory across sessions), but structured enough that a collaborator could follow the work narrative.

5. **Science-aware.** The templates understand data lineage (input → transformation → output), tool/method documentation, quantitative measurements, and artifact manifests — concepts absent from generic documentation.

---

## 4. Artifact Lifecycle

### The five artifact types

| Artifact | Question it answers | When created | Location |
|----------|-------------------|--------------|----------|
| **Plan** | What will we do and why? | Before starting a workstream | `01-documentation/plans/` |
| **Process** | What did we actually do? | After completing a plan phase (or manually) | `01-documentation/process/` |
| **Findings** | What did we observe? | After an analysis tier/phase produces interpretable results | `06-reports/findings/` |
| **Report** | What does it all mean? | After integrating across tiers/phases | `06-reports/` |
| **Publication** | What's the polished narrative? | When ready for external audience | `07-publication/` |

### Naming convention

All artifacts use a linked naming scheme:

```
{workstream}_{artifact_type}[_{qualifier}].md
```

Examples:
```
boltz2_analysis_plan.md
boltz2_analysis_process_tier1.md
boltz2_analysis_process_tier2.md
boltz2_analysis_findings_tier1.md
boltz2_analysis_findings_tier2.md
boltz2_analysis_report.md

chimerax_visualization_plan.md
chimerax_visualization_process_phase1.md
chimerax_visualization_process_phase2.md
chimerax_visualization_findings_phase4.md
```

The workstream prefix ties related artifacts together. The qualifier maps to the plan's phase/tier structure.

### When to capture

**Planned checkpoints** (defined in the plan document):
- After each phase/tier completes
- Natural boundaries where scope changes

**Manual triggers** (user invokes `/experiment capture`):
- Mid-phase when significant decisions or pivots occur
- When a debugging session resolves a non-trivial problem
- Before running out of context window
- After any session where substantial work was done but no phase boundary was crossed

---

## 5. Template Designs

### 5.1 Plan Template

```yaml
---
title: "Plan Title"
type: plan
workstream: workstream-id
project: project-name
date: YYYY-MM-DD
status: active | complete | superseded
---
```

Sections:
1. **Objective** — What we're trying to accomplish and why
2. **Background** — Context, prior work, dependencies
3. **Phases** — Each phase as a subsection:
   - Scope: What this phase covers
   - Expected outputs: Files, figures, data with paths
   - Methods/tools: Scripts, software, parameters
   - Checkpoint: What triggers process capture
   - Success criteria: How we know it worked
4. **Execution order** — Dependencies between phases
5. **Overall success criteria** — Project-level evaluation

### 5.2 Process Artifact Template (the core deliverable)

```yaml
---
title: "Process Artifact Title"
type: process-artifact
workstream: workstream-id
plan: plan-filename.md
phase: Phase N / Tier N
project: project-name
date: YYYY-MM-DD
status: complete | in-progress
---
```

Sections:
1. **Overview** — What this phase was about, linking to the plan
2. **Execution Summary** — What was done and produced (numbered deliverables, final state)
3. **Data & Methods**
   - Input data: source, format, path
   - Tools & parameters: software versions, key settings
   - Scripts written or executed: with paths
   - Output data: format, path, description
4. **Process Narrative** — Chronological walkthrough of what happened
   - Turning points, pivots, course corrections
   - Debugging episodes and resolutions
5. **Key Decisions**
   - Decision / Context / Rationale / Impact format (proven effective in current project)
6. **Observations & Measurements**
   - Quantitative results (RMSD values, confidence scores, etc.)
   - Unexpected findings
   - Quality assessments
7. **Issues & Resolutions**
   - Problems encountered
   - How they were resolved
   - Workarounds applied
8. **Artifact Manifest**
   - Table: File | Location | Description | Format

### 5.3 Findings Template

```yaml
---
title: "Findings Title"
type: findings
workstream: workstream-id
plan: plan-filename.md
scope: Tier N / Phase N
project: project-name
date: YYYY-MM-DD
---
```

Sections:
1. **Summary** — Key takeaways (2-3 sentences)
2. **Results by Analysis** — One subsection per analysis unit
   - Method (brief)
   - Results (tables, figures, quantitative)
   - Interpretation
3. **Cross-Analysis Integration** — How findings connect
4. **Assessment Against Success Criteria** — Mapping results to plan criteria
5. **Recommendations** — What to do next

### 5.4 Report Template

```yaml
---
title: "Report Title"
type: report
workstream: workstream-id
project: project-name
date: YYYY-MM-DD
template: scientific
brand: oligon
---
```

Sections follow the existing research report pattern (executive summary, introduction, methods, results by tier, integrated discussion, file manifest, conclusions). This template is already well-established from the M9A9 project.

---

## 6. Subcommand Design

### `/experiment init`

**Purpose:** Scaffold a new computational science project or add the experiment framework to an existing project.

**What it does:**
- Creates the numbered directory structure (01-documentation/ through 07-publication/)
- Installs template files into `01-documentation/templates/`
- Creates `.claude/commands/experiment.md` (the skill itself)
- Generates initial README.md and CLAUDE.md with project-specific configuration
- Creates `01-documentation/INDEX.md` as a documentation registry

**Input:** Project name, description, domain tags

### `/experiment plan`

**Purpose:** Create a structured plan document from the plan template.

**What it does:**
- Interactively builds a plan by asking about objectives, phases, expected outputs
- Writes the plan to `01-documentation/plans/{workstream}_plan.md`
- Defines checkpoints where process capture should occur
- Registers the plan in the documentation index

**Input:** Workstream name, objectives, phase descriptions (interactive or argument-driven)

### `/experiment capture`

**Purpose:** Generate a process artifact from the current conversation context. This is the core scientific documentation tool — the replacement/evolution of `/research-product-synthesizer` for scientific work.

**What it does:**
- Reads the active plan to identify current phase/tier
- Extracts from conversation context:
  - Commands executed, scripts written, files created/modified
  - Data transformations (input → processing → output chains)
  - Measurements and quantitative results
  - Decisions made and their rationale
  - Problems encountered and resolutions
- Generates a structured process artifact using the template
- Saves to `01-documentation/process/{workstream}_process_{phase}.md`
- Updates the documentation index

**Key difference from `/research-product-synthesizer`:**
- Science-aware sections (Data & Methods, Observations & Measurements, Artifact Manifest)
- Linked to parent plan and phase
- Standardized naming and placement
- Captures data lineage, not just narrative

**Input:** Phase identifier (optional — can auto-detect from plan), additional context notes

### `/experiment findings`

**Purpose:** Generate a findings document synthesizing results from analysis outputs.

**What it does:**
- Reads result files (CSVs, PNGs, etc.) from the relevant analysis tier
- Reads the corresponding process artifact for context
- Generates an interpretive findings document
- Maps results against success criteria from the plan
- Saves to `06-reports/findings/{workstream}_findings_{scope}.md`

**Input:** Scope (tier/phase), pointer to result files

### `/experiment report`

**Purpose:** Compile a comprehensive research report from accumulated findings.

**What it does:**
- Reads all findings documents for the workstream
- Reads the plan for overall success criteria
- Generates integrated report with figures, legends, tables, file manifest
- Saves markdown to `06-reports/{workstream}_report.md`
- Optionally generates PDF via pandoc + brand template

**Input:** Workstream name, report scope, whether to generate PDF

---

## 7. Directory Structure Standard

The `/experiment init` command scaffolds this structure:

```
project-root/
├── .claude/
│   └── commands/
│       └── experiment.md          ← the skill itself
├── 01-documentation/
│   ├── plans/                     ← plan documents
│   ├── process/                   ← process artifacts (lab notebook entries)
│   ├── reference/                 ← external protocols, standards
│   ├── templates/                 ← document templates
│   ├── notes/                     ← informal working notes
│   └── INDEX.md                   ← documentation registry
├── 02-scripts/                    ← numbered analysis scripts
├── 03-data/
│   ├── raw/                       ← immutable input data
│   └── reference/                 ← reference datasets
├── 04-analysis/                   ← intermediate working outputs (gitignored)
├── 05-results/                    ← final curated results
├── 06-reports/
│   ├── findings/                  ← intermediate findings per tier/phase
│   └── (comprehensive reports at root level)
├── 07-publication/                ← manuscript, final PDFs, presentation figures
└── config/                        ← project configuration
```

---

## 8. What Exists to Build On

### Current `/research-product-synthesizer`
- **Location:** `~/.claude/commands/research-product-synthesizer.md`
- **Strengths:** Clean 6-section structure, handles incomplete inputs gracefully, enforces traceability (decisions must link to conversation evidence)
- **Gaps:** No science-specific sections, no plan linkage, no naming/placement standards, no data lineage tracking
- **Relationship to new skill:** The `/experiment capture` subcommand evolves this concept. The original can remain for non-science contexts.

### Process artifacts from M9A9 project (good examples)
- `01-documentation/process/boltz2_yaml_preparation_process.md` — Good example of methods documentation
- `01-documentation/process/boltz2_analysis_process.md` — Good example of tier-organized process narrative
- `06-reports/phase1_visualization_process.md` through `phase5_visualization_process.md` — Excellent consistency across 5 phases, strong Key Decisions format (Decision/Context/Rationale/Impact)

### Templates from M9A9 project
- `01-documentation/templates/pandoc_header.tex` — Oligon brand LaTeX template for PDF generation
- `01-documentation/reference/ChimeraX_Reproducibility_Protocol.md` — Example of a well-structured reference protocol

### Existing plan documents (structural examples)
- `01-documentation/plans/boltz2_analysis_plan.md` — Comprehensive, tier-organized, with success criteria matrix
- `01-documentation/plans/structural_visualization_plan.md` — Phase-organized with priority-ordered deliverables

---

## 9. Implementation Approach

### Phase 1: Design the skill definition
- Write the main `experiment.md` command file with subcommand routing
- Design the argument parsing for each subcommand
- Define the template variables and conversation context extraction

### Phase 2: Create the templates
- Plan template (YAML frontmatter + standardized sections)
- Process artifact template (science-aware, linked)
- Findings template
- Report template
- CLAUDE.md template for new projects

### Phase 3: Build `/experiment init`
- Directory scaffolding logic
- Template installation
- README/CLAUDE.md generation

### Phase 4: Build `/experiment capture`
- This is the highest-value subcommand — prioritize it
- Conversation context extraction
- Plan phase detection
- Science-aware section generation
- Artifact manifest compilation

### Phase 5: Build `/experiment plan`, `/experiment findings`, `/experiment report`
- Plan generation (interactive or argument-driven)
- Findings synthesis from result files
- Report compilation from findings

### Phase 6: Test against M9A9 project
- Retroactively apply the framework to the existing project
- Verify templates produce documents consistent with the best existing artifacts
- Validate naming conventions and directory placement

---

## 10. Open Design Questions

1. **Single file or multiple files?** Should the skill be one `.claude/commands/experiment.md` file with subcommand routing, or separate files (`experiment-init.md`, `experiment-capture.md`, etc.)? Single file is cleaner but may be complex.

2. **Template storage:** Should templates live in the skill file itself (embedded), in `01-documentation/templates/` (project-local), or in a separate templates package?

3. **Documentation index:** Should `INDEX.md` be auto-maintained by the skill, or manually curated? Auto-maintenance adds complexity but ensures consistency.

4. **Plan phase tracking:** How does `/experiment capture` know which phase is current? Options: explicit argument, read plan + infer from conversation, maintain a state file.

5. **Relationship to existing `/research-product-synthesizer`:** Keep the original globally for non-science work? Or deprecate it once `/experiment capture` is mature?

6. **Brand integration:** Should `/experiment report` automatically apply Oligon branding via the pandoc template, or should branding be a separate concern?

7. **Cross-project learning:** Should the skill accumulate patterns across projects (e.g., "this type of analysis typically needs these sections"), or stay stateless?

---

## 11. Context from the Originating Project

The M9A9/Del 60 project that spawned this design has these characteristics worth preserving as reference:

- **Domain:** Structural biology / computational aptamer analysis
- **Tools:** Boltz-2 (complex modeling), SeedFold/RhoFold+ (RNA 3D), EternaFold (2D), ChimeraX (visualization)
- **Pipeline:** 6 Python scripts (Tiers 1-2), 5 ChimeraX phases (Tier 3)
- **Key finding:** Pharmacophore NOT preserved between Del 60 and M9A9 (25 A cross-variant RMSD)
- **Documentation produced:** 2 plans, 8 process artifacts, 2 findings reports, 1 comprehensive research report, 1 manuscript, 1 branded PDF
- **Total artifacts:** ~225 files across scripts, data, results, figures, sessions, reports

The M9A9 project serves as both the inspiration and the test case for this skill.

---

*This document captures the design discussion from the M9A9/Del 60 project session on 2026-02-20. It should be taken to a new project folder for dedicated development and implementation.*
