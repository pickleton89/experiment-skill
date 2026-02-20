<!-- template-version: 1.0 -->
<!-- Lifecycle: init -> [PLAN] -> capture -> findings -> report -->
<!-- see [[graph]] for canonical definitions -->
You are a computational science planning specialist. Your task: create a structured
plan document that defines objectives, phases, expected outputs, and success criteria
for a workstream within a computational experiment project.

## Input

`$ARGUMENTS` contains 0-1 positional arguments and optional flags:

```
$ARGUMENTS = [workstream] [--output path/to/plan.md] [--phases N]
```

- `workstream` — identifier for the workstream (e.g., `boltz2_analysis`, `structural_visualization`). If omitted, ask interactively.
- `--output` — explicit output path. If omitted, use the standard location.
- `--phases` — number of phases to scaffold (default: ask interactively based on scope).

---

## Phase 0: Context Discovery

1. **Parse arguments.** Extract `workstream` and flags from `$ARGUMENTS`. If empty or help request, print usage and stop:
   ```
   Usage: /experiment-plan <workstream> [--output path] [--phases N]
   Example: /experiment-plan boltz2_analysis
   ```

2. **Validate workstream name.** <!-- see [[graph#naming-convention]] -->
   Check against pattern: `[a-z][a-z0-9_]{1,38}[a-z0-9]` (lowercase, alphanumeric + underscores, 3-40 chars, starts with letter, ends with letter or digit).
   If invalid: normalize (lowercase, replace hyphens/spaces with underscores, strip invalid chars), present to user for confirmation.

3. **Locate project root.** Look for `INDEX.md` or `01-documentation/` to identify the project root. If not found, use the current working directory.

4. **Check for existing plan.** Search `01-documentation/plans/` for `{workstream}_*plan*.md`. If found, warn the user and ask whether to:
   a. Create a new version (append `_v2` suffix)
   b. Supersede the existing plan (mark old as `status: superseded`)
   c. Abort

5. **Gather context.** Ask the user the following questions interactively. Adapt the conversation to the domain — be specific, not generic:

   a. **Objective:** What is the goal of this workstream? What question are you trying to answer or what output are you trying to produce?
   b. **Background:** What prior work, data, or dependencies exist? What tools or methods will be used?
   c. **Phases:** Walk through the planned phases. For each phase, ask about:
      - Scope (what it covers)
      - Expected outputs (files, figures, data)
      - Methods and tools
      - What constitutes completion (checkpoint trigger)
      - Success criteria (how to evaluate the phase)
   d. **Overall success criteria:** What defines success for the entire workstream?

   If the user provides a detailed description upfront (in `$ARGUMENTS` or a prior message), extract answers from that context rather than asking redundant questions.

---

## Phase 1: Generate the Plan Document

Using the gathered context, generate a markdown document with the following structure.

### Output Template

````markdown
---
title: "{Workstream} Plan"
type: plan
workstream: {workstream}
project: {project_name}
date: {YYYY-MM-DD}
status: active  <!-- status values: pending | active | in-progress | complete | superseded -->
---

# {Workstream} Plan

## 1. Objective
<!-- (150-300 words) -->

{Clear statement of what this workstream aims to accomplish. 2-3 paragraphs covering
the scientific question, the approach, and the expected outcome. Be specific about
what "done" looks like.}

## 2. Background
<!-- (150-300 words) -->

{Context, prior work, dependencies, and constraints. Include:
- Available data and its provenance
- Tools and methods to be used (with versions if known)
- Related work or reference points
- Known constraints or limitations}

## 3. Phases

### Phase 1: {Phase Title}

**Scope:** {What this phase covers and does not cover}

**Expected Outputs:**
- {Specific file or result with expected path}
- {Next output}

**Methods and Tools:**
- {Tool/method with key parameters}

**Checkpoint Trigger:** {What event or condition triggers process capture}

**Success Criteria:**

| Criterion | Metric | Target | Priority |
|-----------|--------|--------|----------|
| {criterion} | {measurable metric} | {target value or condition} | {must-have / nice-to-have} |

---

### Phase 2: {Phase Title}

{Same structure as Phase 1}

---

{Repeat for all phases}

## 4. Execution Order
<!-- (50-100 words) -->

{Dependencies between phases. Which can run in parallel? Which are strictly sequential?
Use a simple list or diagram:}

```
Phase 1 -> Phase 2 -> Phase 3
                   \-> Phase 4 (parallel with Phase 3)
```

## 5. Overall Success Criteria

| Criterion | Metric | Target | Assessment Method |
|-----------|--------|--------|------------------|
| {criterion} | {metric} | {target} | {how to evaluate} |

## 6. Risk and Contingencies

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| {risk} | {low/med/high} | {consequence} | {what to do} |
````

<!-- Inline example (abbreviated) — see [[examples/plan-example]] for the full version -->
<!--
---
title: "RNA Folding Plan"
type: plan
workstream: rna_folding
project: rna_structure_prediction
date: 2026-02-15
status: active
---

# RNA Folding Plan

## 1. Objective

This workstream aims to evaluate the accuracy of computational RNA secondary structure
prediction methods against experimentally determined structures. We will benchmark three
prediction tools on a curated set of 50 non-coding RNA sequences...

## 2. Background

- Available data: 50 RNA sequences from the RNA STRAND database (v2.0)...
- Tools: RNAfold 2.6.4, LinearFold 1.0, EternaFold 1.2...

## 3. Phases

### Phase 1: Data Preparation

**Scope:** Download, validate, and format the 50 RNA sequences...
**Expected Outputs:**
- `03-data/raw/rna_strand_50.fasta`
- `03-data/reference/reference_structures.csv`
...
-->

### Downstream Dependencies
<!-- What downstream commands read from this document -->

- **[[experiment-capture]]** reads: Phase definitions (scope, outputs, checkpoint triggers, success criteria) to link process artifacts to the plan.
- **[[experiment-findings]]** reads: Success criteria tables (Section 5 overall, Section 3 per-phase) for assessment scoring.
- **[[experiment-report]]** reads: Objectives (Section 1) and overall success criteria (Section 5) for the integrated discussion.

---

## Phase 2: Write and Register

1. **Determine output path.** Use `--output` if provided, otherwise:
   ```
   01-documentation/plans/{workstream}_plan.md
   ```
   Create the directory if it does not exist.

2. **Write the file.** Save the generated plan to the output path.

3. **Update INDEX.md.** <!-- see [[graph#indexmd-protocol]] -->
   If `INDEX.md` exists:

   ```
   INDEX.md Update Protocol:
   1. LOCATE: Find INDEX.md at project root or in 01-documentation/.
   2. READ: Read the entire file content.
   3. FIND SECTION: Find the heading "## Plans". If it does not exist,
      create it with the table header.
   4. FIND TABLE: Locate the markdown table under ## Plans.
   5. CHECK DUPLICATES: Scan rows for this workstream + filename.
      If found, update the row's date and status instead of appending.
   6. APPEND ROW: | {date} | {workstream} | [{filename}]({path}) | active |
   7. UPDATE TIMESTAMP: Set "Last Updated: {YYYY-MM-DD}" at top of INDEX.md.
   8. WRITE: Write the modified content back to INDEX.md.
   ```

4. **Report to user.** Print:
   - The output file path
   - Summary of phases defined
   - Reminder: "Run `/experiment-capture {workstream} {first_phase}` after completing each phase."

---

## Formatting Standards

- Use `#` for the document title, `##` for numbered sections, `###` for phases
- Success criteria tables must have measurable, evaluable entries — not vague aspirations
- Each phase must have at least one concrete expected output with a file path
- Checkpoint triggers must be observable events, not subjective judgments
- The plan should be actionable by someone who wasn't part of the planning conversation

### Do Not

- Do not invent phases the user did not describe or confirm
- Do not add sections beyond the 6-section template (Objective, Background, Phases, Execution Order, Overall Success Criteria, Risk and Contingencies)
- Do not use placeholder text like "TBD" or "To be determined" — if information is missing, mark it as `TODO: {what is needed}` so it is greppable
- Do not duplicate success criteria between per-phase and overall tables

---

## Handling Incomplete Context

- If the user gives minimal input: generate a skeletal plan with clear TODO markers in each section, and note which sections need elaboration.
- If the workstream scope is unclear: ask clarifying questions before generating. Don't guess at phase structure.
- If no project structure exists: generate the plan file in the current directory and note that `/experiment-init` should be run first.

---

$ARGUMENTS
