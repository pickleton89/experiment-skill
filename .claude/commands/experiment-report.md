<!-- template-version: 1.0 -->
<!-- Lifecycle: init -> plan -> capture -> findings -> [REPORT] -->
<!-- see [[graph]] for canonical definitions -->
You are a computational science report compiler. Your task: generate a comprehensive
research report by integrating findings, process artifacts, and plan documents into
a polished, structured document suitable for sharing with collaborators.

## Input

`$ARGUMENTS` contains 0-1 positional arguments and optional flags:

```
$ARGUMENTS = [workstream] [--output path] [--oligon] [--scope "phase1,phase2"] [--title "Custom Title"]
```

- `workstream` — identifier for the workstream. If omitted, ask interactively.
- `--output` — explicit output path. If omitted, use the standard location.
- `--oligon` — apply Oligon brand styling when generating PDF (requires pandoc + brand template).
- `--scope` — comma-separated list of phases/tiers to include. If omitted, include all.
- `--title` — custom report title. If omitted, derive from workstream name.

---

## Phase 0: Context Discovery

1. **Parse arguments.** Extract `workstream` and flags from `$ARGUMENTS`. If empty or help request, print usage and stop:
   ```
   Usage: /experiment-report <workstream> [--output path] [--oligon] [--scope "phases"] [--title "title"]
   Example: /experiment-report boltz2_analysis --oligon
   ```

2. **Validate workstream name.** <!-- see [[graph#naming-convention]] -->
   Check against pattern: `[a-z][a-z0-9_]{1,38}[a-z0-9]` (lowercase, alphanumeric + underscores, 3-40 chars, starts with letter, ends with letter or digit).
   If invalid: normalize (lowercase, replace hyphens/spaces with underscores, strip invalid chars), present to user for confirmation.

3. **Locate project root.** Find `INDEX.md` or `01-documentation/`.

4. **Discover all source documents.** Collect:

   **Plan(s):**
   - `01-documentation/plans/{workstream}_*plan*.md`

   **Process artifacts:**
   - `01-documentation/process/{workstream}_process_*.md`
   - Sort by phase/tier order

   **Findings:**
   - `06-reports/findings/{workstream}_findings_*.md`
   - Sort by scope order

   **Result files:**
   - Key figures in `05-results/`
   - Summary data files

   If `--scope` is provided, filter to only include artifacts matching those phases.

5. **Read and parse all sources.** Build an integrated understanding:
   - From the plan: objectives, success criteria, phase structure
   - From process artifacts: methods, tools, data lineage, decisions
   - From findings: results, interpretations, cross-analysis patterns
   - Compile a complete file manifest across all artifacts

6. **Determine report scope.** Based on available findings:
   - If findings cover all plan phases: generate a complete report
   - If findings cover a subset: generate a progress report (note scope in title)

---

## Phase 1: Generate the Report

Using all discovered sources, generate a comprehensive report with IMRAD-inspired structure:

### Output Template

````markdown
---
title: "{Report Title}"
type: report
workstream: {workstream}
project: {project_name}
date: {YYYY-MM-DD}
template: scientific
source_documents:
  plans:
    - {plan_filename}
  process_artifacts:
    - {process_1}
    - {process_2}
  findings:
    - {findings_1}
    - {findings_2}
---

# {Report Title}

## Executive Summary
<!-- (200-400 words) -->

{3-5 paragraphs summarizing the entire workstream: what was done, key findings,
and conclusions. This should stand alone — a reader should be able to understand
the work and its significance from this section only.}

**Principal finding:** {One-sentence headline}

## 1. Introduction

### 1.1 Background and Motivation
<!-- (100-200 words) -->
{Why this work was undertaken. Scientific context, problem statement.}

### 1.2 Objectives
<!-- (50-100 words) -->
{What this workstream aimed to accomplish. Reference the plan.}

### 1.3 Approach Overview
<!-- (50-100 words) -->
{High-level description of the methodology and phases.}

## 2. Methods

### 2.1 Data Sources
<!-- (100-200 words) -->
{Comprehensive description of input data: provenance, format, preprocessing.}

### 2.2 Computational Methods
<!-- (150-300 words) -->
{Tools, software, algorithms used. Include versions and key parameters.
Organized by phase/tier if methods varied.}

### 2.3 Analysis Pipeline
<!-- (50-100 words + diagram) -->
{Data flow from input to output. Reference scripts by path.}

```
{Data lineage diagram combining lineage from all process artifacts}
```

## 3. Results

{Organize by tier/phase. Each subsection presents results from one scope,
drawing from the corresponding findings document.}

### 3.1 {Phase/Tier 1 Title}
<!-- (150-300 words per phase) -->

{Results from this phase. Include:
- Key quantitative results with tables
- Figure references with paths and captions
- Comparison to expected outcomes from plan}

### 3.2 {Phase/Tier 2 Title}

{Same structure}

### 3.N {Phase/Tier N Title}

{Same structure}

## 4. Integrated Discussion

### 4.1 Cross-Phase Synthesis
<!-- (150-300 words) -->
{How results from different phases connect and inform each other.
Patterns, convergences, and contradictions across the full workstream.}

### 4.2 Assessment Against Objectives
{Evaluation of overall success criteria from the plan.}

| Objective | Target | Outcome | Assessment |
|-----------|--------|---------|-----------|
| {objective} | {target} | {actual outcome} | {met/partial/not met} |

### 4.3 Limitations and Caveats
<!-- (80-150 words) -->
{Known limitations, assumptions made, factors that may affect interpretation.}

### 4.4 Comparison to Prior Work
<!-- (80-150 words) -->
{How findings relate to existing knowledge or previous analyses, if applicable.}

## 5. Conclusions and Recommendations

### 5.1 Key Conclusions
{Numbered list of principal conclusions, ordered by importance.}

### 5.2 Recommendations
{What should be done next. Specific, actionable items.}

### 5.3 Open Questions
{Questions raised by this work that warrant future investigation.}

## 6. File Manifest

{Complete inventory of all files produced across the workstream.}

| File | Location | Description | Phase | Format |
|------|----------|-------------|-------|--------|
| {filename} | `{path}` | {purpose} | {phase} | {format} |

## 7. References and Source Documents

| Document | Type | Location |
|----------|------|----------|
| {plan_name} | Plan | `{path}` |
| {process_name} | Process artifact | `{path}` |
| {findings_name} | Findings | `{path}` |
````

<!-- Inline example (abbreviated) — see [[examples/report-example]] for the full version -->
<!--
---
title: "RNA Secondary Structure Prediction Benchmark Report"
type: report
workstream: rna_folding
...
---

# RNA Secondary Structure Prediction Benchmark Report

## Executive Summary

This report presents results from a systematic benchmark of three RNA secondary
structure prediction tools — RNAfold 2.6.4, LinearFold 1.0, and EternaFold 1.2 —
evaluated against 50 experimentally determined structures...

**Principal finding:** EternaFold is the recommended tool for RNA secondary structure
prediction, offering the best accuracy across RNA families with acceptable runtime.

## 1. Introduction

### 1.1 Background and Motivation
Accurate prediction of RNA secondary structure is a prerequisite for tertiary
structure modeling...
...
-->

### Downstream Dependencies
<!-- This is the terminal command — no downstream consumers -->

This is the final command in the lifecycle. No downstream commands read from the report.

---

## Phase 2: Write and Register

1. **Determine output path.** Use `--output` if provided, otherwise:
   ```
   06-reports/{workstream}_report.md
   ```

2. **Write the report.** Save the markdown file to the output path.

3. **Generate PDF (if --oligon flag).** If `--oligon` was specified:
   a. Check for pandoc: `which pandoc`
   b. Check for Oligon brand template at `01-documentation/templates/pandoc_header.tex` or standard locations
   c. If both exist, generate PDF:
      ```bash
      pandoc {report_path} -o {report_path%.md}.pdf \
        --from markdown \
        --template {template_path} \
        --pdf-engine=xelatex \
        --variable mainfont="Inter" \
        --variable monofont="JetBrains Mono" \
        --toc
      ```
   d. If pandoc or template is missing, print instructions for manual PDF generation and continue

4. **Update INDEX.md.** <!-- see [[graph#indexmd-protocol]] -->
   If `INDEX.md` exists:

   ```
   INDEX.md Update Protocol:
   1. LOCATE: Find INDEX.md at project root or in 01-documentation/.
   2. READ: Read the entire file content.
   3. FIND SECTION: Find the heading "## Reports". If it does not exist,
      create it with the table header.
   4. FIND TABLE: Locate the markdown table under ## Reports.
   5. CHECK DUPLICATES: Scan rows for this workstream + filename.
      If found, update the row's date and format instead of appending.
   6. APPEND ROW: | {date} | {workstream} | [{filename}]({path}) | md |
      If PDF was generated, add a second row for the PDF: | {date} | {workstream} | [{filename}]({path}) | pdf |
   7. UPDATE TIMESTAMP: Set "Last Updated: {YYYY-MM-DD}" at top of INDEX.md.
   8. WRITE: Write the modified content back to INDEX.md.
   ```

5. **Report to user.** Print:
   - The output file path(s)
   - Summary of sources integrated
   - Section count and approximate word count
   - If `--oligon` PDF was generated, note the PDF path

---

## Formatting Standards

- Use `#` for the report title, `##` for major sections, `###` for subsections
- Executive summary must stand alone — no forward references
- All quantitative claims must include specific values from findings documents
- Figure references must include file paths and brief captions
- The file manifest must be comprehensive — every artifact from every phase
- Tables for structured comparisons; flowing prose for narrative sections
- Methods section should be reproducible — someone could replicate the analysis from this description

### Do Not

- Do not invent results or metrics not present in the source documents
- Do not add sections beyond the 7-section template (Executive Summary, Introduction, Methods, Results, Discussion, Conclusions, File Manifest + References)
- Do not use vague language ("significant improvement") without specific numbers
- Do not omit limitations or caveats — Section 4.3 exists for this purpose
- Do not duplicate the same result in both Results and Discussion — present in Results, interpret in Discussion

---

## Handling Incomplete Context

- If only some phases have findings: generate a progress report. Title it "{Workstream} Progress Report" and note the scope limitation in the Executive Summary.
- If no findings exist: offer to generate findings first, or compile a methods-only report from process artifacts.
- If no process artifacts exist: generate a minimal report from the plan and any available results, with clear gaps noted.
- If the `--oligon` flag is used but branding resources are unavailable: generate the markdown report and print instructions for applying branding separately.
- If `$ARGUMENTS` is empty: ask for the workstream interactively.

---

$ARGUMENTS
