<!-- template-version: 1.0 -->
<!-- Lifecycle: init -> plan -> capture -> [FINDINGS] -> report -->
<!-- see [[graph]] for canonical definitions -->
<!-- graph-edges:
  domain: research-tools
  suite: experiment-lifecycle
  feeds-into:
    - experiment-report: "Integrate findings into comprehensive report"
    - scientific-writing: "Draft manuscript sections from synthesized results"
    - scientific-slides: "Present findings at meetings or conferences"
    - peer-review: "Self-review findings before reporting"
-->
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

2. **Validate workstream name.** Apply the naming convention from [[graph#naming-convention]]. If invalid, normalize and present to user for confirmation.

3. **Locate project root.** Find `INDEX.md` or `01-documentation/`.

4. **Discover source documents.** In order of priority for each:

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

5. **Read source documents.** Read and parse:
   - The plan document (extract success criteria for this scope)
   - The process artifact(s) (extract methods, measurements, observations)
   - Key result files (CSVs, summary tables, figure descriptions)
   - If result files are binary (images, PDFs), note their existence and path but focus on any text-based summaries or the process artifact's description of results

6. **Gather additional context.** If the current conversation contains analysis discussion, incorporate those observations and interpretations.

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
<!-- (80-150 words) -->

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
<!-- (100-200 words per analysis unit) -->

### 2.2 {Next Analysis Unit}

{Same structure. Repeat for each distinct analysis within the scope.}

## 3. Cross-Analysis Integration
<!-- (150-300 words across all subsections) -->

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
<!-- (80-150 words) -->

## 5. Recommendations
<!-- (100-200 words across all subsections) -->

### For Subsequent Phases
{What should be done next based on these findings? Adjustments to the plan?}

### Methodological Notes
{What worked well and what should be done differently? Lessons for process.}

### Open Questions
{Questions raised by the findings that warrant investigation.}
````

<!-- For a worked example, see [[examples/findings-example]] -->

### Downstream Dependencies
<!-- What downstream commands read from this document -->

- **[[experiment-report]]** reads: Results by Analysis (Section 2 — for Results chapter), Cross-Analysis Integration (Section 3 — for Discussion), Assessment (Section 4 — for Assessment Against Objectives).

---

## Phase 2: Write and Register

1. **Determine output path.** Use `--output` if provided, otherwise:
   ```
   06-reports/findings/{workstream}_findings_{scope}.md
   ```
   Create the directory if it does not exist.

2. **Write the file.** Save the findings document to the output path.

3. **Update INDEX.md.** <!-- see [[graph#indexmd-protocol]] -->
   If `INDEX.md` exists:

   ```
   Execute the canonical INDEX.md Update Protocol from [[graph#indexmd-protocol]].
   Target section: "## Findings"
   Row format: | {date} | {workstream} | {scope} | [{filename}]({path}) | complete |
   ```

4. **Report to user.** Print:
   - The output file path
   - A one-line summary of the key finding
   - List of source documents used

5. **Suggest next steps.** Based on the findings produced, print a "Suggested next steps" block:
   - If all plan phases have findings: `/experiment-report {workstream}` — compile integrated report
   - If plan has remaining phases: `/experiment-capture {workstream} {next_phase}` — continue to next phase
   - If findings are ready for manuscript drafting: `/scientific-writing` — draft manuscript sections from synthesized results
   - If findings warrant methodological review: `/peer-review` — self-review methodology and results before reporting
   - If results need presentation: `/scientific-slides` — build slide deck from findings

---

## Formatting Standards

- Use `#` for the document title, `##` for numbered sections, `###` for analysis units
- Quantitative results must include units and appropriate precision
- Tables for structured comparisons; prose for interpretation
- Reference figures and data files by their relative paths
- Success criteria assessment must map one-to-one from the plan — never skip criteria
- Bold the key finding in Section 1

### Do Not

- Do not invent results or metrics not present in the source documents or session context
- Do not add sections beyond the 5-section template
- Do not repeat methods in detail — reference the process artifact instead
- Do not include raw data dumps — summarize and interpret
- Do not skip any success criteria from the plan in Section 4 — every criterion must be assessed even if the answer is "not evaluated"

---

## Handling Incomplete Context

- If no plan exists: skip Section 4 (Assessment Against Success Criteria) and note "No plan document found — success criteria not evaluated."
- If no process artifacts exist: note this in the frontmatter and rely on conversation context and result files.
- If result files are sparse: focus on what is available. Note gaps explicitly ("Expected output X was not found at Y").
- If `$ARGUMENTS` is incomplete: ask for missing workstream and scope interactively.

---

$ARGUMENTS
