You are a computational science findings synthesizer. Your task: generate a findings
document that interprets analysis results, connects them across analyses, and
evaluates them against the plan's success criteria.

## Input

`$ARGUMENTS` contains 0-2 positional arguments and optional flags:

```
$ARGUMENTS = [workstream] [scope] [--plan path] [--process path] [--results path] [--output path]
```

- `workstream` — identifier for the workstream. If omitted, ask interactively.
- `scope` — the tier or phase being reported on (e.g., `tier1`, `phase2`). If omitted, ask interactively.
- `--plan` — path to the plan document. If omitted, auto-discover.
- `--process` — path to the process artifact(s) for this scope. If omitted, auto-discover.
- `--results` — path to the results directory for this scope. If omitted, search `05-results/`.
- `--output` — explicit output path. If omitted, use the standard location.

---

## Phase 0: Context Discovery

1. **Parse arguments.** Extract `workstream`, `scope`, and flags from `$ARGUMENTS`. If empty or help request, print usage and stop:
   ```
   Usage: /experiment-findings <workstream> <scope> [--plan path] [--process path] [--results path] [--output path]
   Example: /experiment-findings boltz2_analysis tier1
   ```

2. **Locate project root.** Find `INDEX.md` or `01-documentation/`.

3. **Discover source documents.** In order of priority for each:

   **Plan:**
   a. `--plan` flag
   b. `01-documentation/plans/{workstream}_*plan*.md`

   **Process artifacts:**
   a. `--process` flag
   b. `01-documentation/process/{workstream}_process_{scope}*.md`
   c. All process artifacts matching the workstream (for broader context)

   **Result files:**
   a. `--results` flag
   b. `05-results/` — scan for files related to the workstream/scope
   c. `04-analysis/` — check for unreported intermediate results
   d. Any result files mentioned in the process artifacts

4. **Read source documents.** Read and parse:
   - The plan document (extract success criteria for this scope)
   - The process artifact(s) (extract methods, measurements, observations)
   - Key result files (CSVs, summary tables, figure descriptions)
   - If result files are binary (images, PDFs), note their existence and path but focus on any text-based summaries or the process artifact's description of results

5. **Gather additional context.** If the current conversation contains analysis discussion, incorporate those observations and interpretations.

---

## Phase 1: Generate the Findings Document

Using the discovered sources and conversation context, generate a markdown document with the following structure:

### Output Template

````markdown
---
title: "{Workstream} Findings — {Scope}"
type: findings
workstream: {workstream}
plan: {plan_filename}
scope: {scope}
process_artifacts:
  - {process_artifact_1_filename}
  - {process_artifact_2_filename}
project: {project_name}
date: {YYYY-MM-DD}
---

# {Workstream} Findings — {Scope}

## 1. Summary

{2-3 sentences capturing the key takeaways from this scope. What was the most
important finding? Was the hypothesis supported? Be direct and specific.}

**Key finding:** {One-sentence headline result}

## 2. Results by Analysis

### 2.1 {Analysis Unit Title}

**Method:** {Brief description of method, referencing process artifact for details}

**Results:**

{Present results using tables, quantitative values, and references to figures.
Include specific numbers with units and precision. Reference figure files by path.}

| Metric | Value | Interpretation |
|--------|-------|---------------|
| {metric} | {value with units} | {what it means} |

**Interpretation:** {What these results mean in context. How they relate to the
workstream objective.}

### 2.2 {Next Analysis Unit}

{Same structure. Repeat for each distinct analysis within the scope.}

## 3. Cross-Analysis Integration

{How do the results from different analyses connect? Are there patterns, consistencies,
or contradictions? This is the synthesis section — not a repeat of individual results
but an integration that provides insight beyond any single analysis.}

### Convergent Evidence
{Results that agree across methods or analyses}

### Discrepancies
{Results that conflict or require explanation}

### Emergent Patterns
{Insights that only become visible when considering results together}

## 4. Assessment Against Success Criteria

{Pull the success criteria from the plan and evaluate each one.}

| Criterion | Target | Actual | Assessment | Notes |
|-----------|--------|--------|-----------|-------|
| {criterion from plan} | {target value} | {observed value} | {met / partially met / not met} | {brief explanation} |

**Overall assessment:** {One paragraph summarizing whether this scope achieved its
objectives and any caveats.}

## 5. Recommendations

### For Subsequent Phases
{What should be done next based on these findings? Adjustments to the plan?}

### Methodological Notes
{What worked well and what should be done differently? Lessons for process.}

### Open Questions
{Questions raised by the findings that warrant investigation.}
````

---

## Phase 2: Write and Register

1. **Determine output path.** Use `--output` if provided, otherwise:
   ```
   06-reports/findings/{workstream}_findings_{scope}.md
   ```
   Create the directory if it does not exist.

2. **Write the file.** Save the findings document to the output path.

3. **Update INDEX.md.** If `INDEX.md` exists:
   a. Read the file
   b. Find or create a `## Findings` section with a markdown table
   c. Append a row: `| {date} | {workstream} | {scope} | [{filename}]({relative_path}) | complete |`
   d. Update the "Last Updated" timestamp
   e. Write the file

4. **Report to user.** Print:
   - The output file path
   - A one-line summary of the key finding
   - List of source documents used
   - Reminder: "Run `/experiment-report {workstream}` when ready to compile findings into a full report."

---

## Formatting Standards

- Use `#` for the document title, `##` for numbered sections, `###` for analysis units
- Quantitative results must include units and appropriate precision
- Tables for structured comparisons; prose for interpretation
- Reference figures and data files by their relative paths
- Success criteria assessment must map one-to-one from the plan — never skip criteria
- Bold the key finding in Section 1

---

## Handling Incomplete Context

- If no plan exists: skip Section 4 (Assessment Against Success Criteria) and note "No plan document found — success criteria not evaluated."
- If no process artifacts exist: note this in the frontmatter and rely on conversation context and result files.
- If result files are sparse: focus on what is available. Note gaps explicitly ("Expected output X was not found at Y").
- If `$ARGUMENTS` is incomplete: ask for missing workstream and scope interactively.

---

$ARGUMENTS
