You are a computational science documentation specialist. Your task: generate a
structured process artifact that captures what was done during this session, with
science-aware sections for data lineage, measurements, and artifact tracking.

## Input

`$ARGUMENTS` contains 0-2 positional arguments and optional flags:

```
$ARGUMENTS = [workstream] [qualifier] [--plan path/to/plan.md] [--output path/to/output.md]
```

- `workstream` — identifier for the workstream (e.g., `boltz2_analysis`). If omitted, ask interactively.
- `qualifier` — phase or tier label (e.g., `tier1`, `phase2`). If omitted, auto-detect from the active plan or ask.
- `--plan` — explicit path to the plan document. If omitted, search `01-documentation/plans/` for a plan matching the workstream.
- `--output` — explicit output path. If omitted, use the standard location.

---

## Phase 0: Context Discovery

1. **Parse arguments.** Extract `workstream`, `qualifier`, and any flags from `$ARGUMENTS`. If `$ARGUMENTS` is empty or contains only a help request, print a usage summary and stop:
   ```
   Usage: /experiment-capture <workstream> [qualifier] [--plan path] [--output path]
   Example: /experiment-capture boltz2_analysis tier1
   ```

2. **Locate project root.** Look for an `INDEX.md` file or `01-documentation/` directory to identify the project root. If not found, use the current working directory and note that no experiment project structure was detected.

3. **Find the active plan.** In order of priority:
   a. Use `--plan` flag if provided
   b. Search `01-documentation/plans/` for `{workstream}_*plan*.md`
   c. If no plan found, proceed without plan linkage and note this in the output

4. **Auto-detect phase/qualifier.** If `qualifier` was not provided:
   a. Read the plan document and list its phases
   b. Check `01-documentation/process/` for existing process artifacts matching this workstream
   c. Infer the current phase as the next uncaptured phase
   d. Present the inference to the user and ask for confirmation

5. **Read conversation context.** From the current session, identify:
   - Commands executed (bash, scripts, tool invocations)
   - Files created, modified, or read
   - Data transformations (input files -> processing -> output files)
   - Quantitative results and measurements mentioned
   - Decisions made and their rationale
   - Problems encountered and how they were resolved
   - Tools, software, and versions used

---

## Phase 1: Generate the Process Artifact

Using the conversation context gathered in Phase 0, generate a markdown document with the following structure. Every section must contain specific, concrete details extracted from the session. Do not use placeholders or generic text.

### Output Template

````markdown
---
title: "{Workstream} Process — {Qualifier}"
type: process-artifact
workstream: {workstream}
plan: {plan_filename or "none"}
phase: {qualifier}
project: {project_name}
date: {YYYY-MM-DD}
status: complete
---

# {Workstream} Process — {Qualifier}

## 1. Overview

{2-3 paragraphs: What this phase was about, its objectives, and how it connects to the
broader plan. If a plan document exists, reference the specific phase definition and
success criteria. State the scope boundary — what this phase covers and does not cover.}

## 2. Execution Summary

**Deliverables produced:**
1. {Concrete deliverable with file path}
2. {Next deliverable}
...

**Current state:** {complete | in-progress | blocked}
**Duration:** {Approximate session time if discernible}

## 3. Data and Methods

### Input Data

| Source | Format | Location | Description |
|--------|--------|----------|-------------|
| {name} | {format} | `{path}` | {what it contains} |

### Tools and Parameters

| Tool | Version | Key Parameters |
|------|---------|---------------|
| {tool} | {version} | {relevant settings} |

### Scripts and Commands

{List scripts written or executed, with paths and brief descriptions. Include
key command-line invocations in fenced code blocks.}

### Output Data

| Output | Format | Location | Description |
|--------|--------|----------|-------------|
| {name} | {format} | `{path}` | {what it contains} |

### Data Lineage

```
{input_file} -> [{script/tool}] -> {intermediate} -> [{script/tool}] -> {output_file}
```

## 4. Process Narrative

{Chronological walkthrough of what happened during the session. Write in past tense.
Structure as a coherent narrative, not a log dump. Highlight:
- The sequence of operations and why each was performed
- Turning points where the approach changed
- Debugging episodes and how they were resolved
- Key observations that influenced subsequent steps}

## 5. Key Decisions

### Decision 1: {Short title}
- **Decision:** {What was decided}
- **Context:** {What information was available}
- **Rationale:** {Why this choice over alternatives}
- **Impact:** {How it affected subsequent work}

{Repeat for each significant decision}

## 6. Observations and Measurements

### Quantitative Results

{Tables or lists of measurements, scores, metrics obtained during the session.
Include units, precision, and comparison values where available.}

| Metric | Value | Reference/Expected | Notes |
|--------|-------|-------------------|-------|
| {metric} | {value} | {reference} | {notes} |

### Unexpected Findings

{Any surprising results, anomalies, or observations that were not anticipated.
Note whether they were investigated and what was concluded.}

### Quality Assessment

{Assessment of output quality: validation checks performed, confidence levels,
known limitations of the results.}

## 7. Issues and Resolutions

| Issue | Impact | Resolution | Status |
|-------|--------|-----------|--------|
| {problem} | {how it affected work} | {what was done} | {resolved/workaround/open} |

{For non-trivial issues, add narrative detail below the table.}

## 8. Artifact Manifest

| File | Location | Description | Format |
|------|----------|-------------|--------|
| {filename} | `{path}` | {purpose} | {md/py/csv/png/etc} |
````

---

## Phase 2: Write and Register

1. **Determine output path.** Use `--output` if provided, otherwise:
   ```
   01-documentation/process/{workstream}_process_{qualifier}.md
   ```
   Create the directory if it does not exist.

2. **Write the file.** Save the generated process artifact to the output path.

3. **Update INDEX.md.** If `INDEX.md` exists at the project root or in `01-documentation/`:
   a. Read the file
   b. Find or create a `## Process Artifacts` section with a markdown table
   c. Append a row: `| {date} | {workstream} | {qualifier} | [{filename}]({relative_path}) | {status} |`
   d. Update the "Last Updated" timestamp at the top of INDEX.md
   e. Write the file

4. **Report to user.** Print:
   - The output file path
   - A one-line summary of what was captured
   - Any sections that were thin due to limited context (so the user can supplement)

---

## Formatting Standards

- Use `#` for the document title, `##` for numbered sections, `###` for subsections
- Use fenced code blocks for file paths, commands, and directory trees
- Use tables for structured data (inputs, outputs, measurements, artifacts)
- Bold key terms on first use in each section
- All file paths must be relative to the project root
- Every section must contain at least one specific detail from the session — never write "N/A" or "None" for a section; if truly empty, write a brief note explaining why (e.g., "No quantitative measurements were produced in this phase — work was limited to data preparation.")
- Decisions in Section 5 must trace to evidence in the conversation
- The artifact manifest in Section 8 must be complete — every file created or modified during the session should appear

---

## Handling Incomplete Context

- If no plan exists: omit plan linkage from the YAML frontmatter and Overview, but generate all other sections normally.
- If the session had no quantitative results: Section 6 should explain what was done instead (e.g., setup, data preparation) and note that measurements will appear in subsequent phases.
- If the session was primarily debugging: emphasize Sections 4, 5, and 7 (narrative, decisions, issues). Keep Sections 3 and 6 brief but present.
- If `$ARGUMENTS` is empty: ask the user for the workstream name and qualifier interactively before proceeding.

---

<project_description>
Process artifact capture for the current session.
Workstream and qualifier from arguments: $ARGUMENTS
</project_description>

Generate the process artifact now. Extract all relevant details from the conversation
context. Write the complete document, then save it to the appropriate location and
update INDEX.md.
