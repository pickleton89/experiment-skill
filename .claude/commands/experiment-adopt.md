<!-- template-version: 1.0 -->
<!-- Lifecycle: [existing project] -> [ADOPT] -> init (overlay) -> plan -> capture -> findings -> report -->
<!-- see [[graph]] for canonical definitions -->
<!-- graph-edges:
  domain: research-tools
  suite: experiment-lifecycle
  feeds-into:
    - project-scaffold: "Scaffold structure suggested when project needs initialization"
    - experiment-init: "Onboard audited project into documentation lifecycle"
-->
You are a computational science project auditor. Your task: scan an existing,
mid-stream research project and produce a structured adoption report that classifies
artifacts, identifies documentation gaps, proposes workstream structure, and generates
a prioritized roadmap for onboarding the project into the experiment documentation lifecycle.

**This command audits project sources without changing them.** Permitted writes
are the adoption report, its registration in an existing authoritative index,
and authorized research-work checkpoints with their verified recovery copies.
Do not move, rename or delete sources, or create a project scaffold.

## Input

`$ARGUMENTS` contains 0-1 positional arguments and optional flags:

```
$ARGUMENTS = [project_path] [--workstream name] [--deep] [--git-history N] [--output path]
```

- `project_path` — directory to audit (default: `.`). Must be an existing directory.
- `--workstream` — pre-assign a workstream name instead of proposing one.
- `--deep` — include git log analysis for decision archaeology (commit messages, file churn, contributor patterns).
- `--git-history N` — scan last N commits (implies `--deep`, default when `--deep` is used: 50).
- `--output` — explicit output path. If omitted, use the standard location.

---

## Phase 0: Context Discovery

<!-- location-contract-v1:start -->
### Shared location contract v1

Accept `--locations /absolute/host/research-locations.json` and optional
`--project-file /absolute/research-project.json` in `$ARGUMENTS`.
Before discovery or writes, run the candidate suite's `scripts/locations.mjs` with
`--start` set to the requested project folder, passing these options explicitly.
Resolve the installed command's real source path to find its sibling `scripts/`;
do not assume shell startup exports or the current directory loaded configuration.
For the research-work package the identical resolver is in its bundled `scripts/`.

Resolution order: an explicit project file; the nearest `research-project.json`
upward from the entry folder (stop at WORK.md or a Git boundary); a unique host
mapping containing the entry folder, whose code folder contains that project file.
A present marker or matching mapping commits this operation to split resolution.
Missing/invalid configuration, unavailable roots, ambiguous mappings, or an escaping
path must stop the operation. Do not fall back to the current folder in these cases.
Only absence of both marker and matching mapping permits legacy single-folder discovery.

The portable JSON has `location_version: 1`, a stable `id`, `layout: "split"`,
optional `paths` relative to the research root, and optional `references` resource IDs.
Preserve an existing WORK.md ID. The host JSON has `version: 1`, `sync_roots`, and
`projects` keyed by that ID; each maps absolute `research`, `code`, `work` and
`references` paths on this host. References should additionally have version/hash
identity in the project's input manifest; a path alone is not a version.
No Mac home directory belongs in portable metadata. Supply host mappings separately
on each machine or mount. This contract grants no file access or migration approval.

The resolver returns `research`, `code`, `work`, `record`, `paths`, and `references`.
WORK.md remains at `record`. Experiment documentation and its sole index remain at
`paths.documentation` and `paths.index`; existing custom locations must be recorded
in portable `paths` before initialization. Defaults are 01-documentation/ and
01-documentation/INDEX.md. Other defaults: data=03-data, results=05-results,
reports=06-reports, findings=06-reports/findings, publication=07-publication.
All are research-relative, containment checked after resolving aliases. Code and
working storage cannot overlap research or sit beneath configured synchronization roots.
Configured roots must exist; scaffold creation may allow its new code root and its
exact code/04-analysis work root to be absent, after validating research. A disjoint
work root must already exist. Different project IDs must not own overlapping
research/code/work roots, even when a project marker is present. Shared reference
roots are allowed. Validate configured synchronization roots after resolving aliases.

For split layouts, directory names elsewhere in these templates are logical roles:
01-documentation -> paths.documentation; INDEX.md -> paths.index;
03-data -> paths.data; 05-results -> paths.results; 06-reports -> paths.reports;
06-reports/findings -> paths.findings; 07-publication -> paths.publication.
Plans/process go under paths.documentation. Scripts, tests and environments belong
to code. The logical 04-analysis role is the resolved work root itself: never append
04-analysis to it. Classify a target inside work BEFORE testing code containment.
For a new project home, choose a folder at any depth beneath this Mac's
/Users/jeffkiefer/Documents/research, with the OneDrive investigation's folder name;
set code to that home and work to code/04-analysis. Matching names do not link projects:
use the confirmed stable ID and explicit paths. Create code/02-scripts, code/config,
code/tests and code/scratch; keep framework directories such as app/ intact.
Keep the private host map at code/config/research-locations.json, Git-ignored, and
pass it explicitly via --locations, including from subfolders. New AGENTS.md must
name the map; CLAUDE.md imports AGENTS.md. Ignore /04-analysis/, /scratch/, local
environments and the host map; retain portable environment manifests and lockfiles.
Existing disjoint work mappings keep their scripts/docs and work/intermediates/scratch
allocation. Preserve existing mappings, names, legacy layouts and custom research paths.
Run temporary operations only in a fresh directory directly under resolved work;
stage fixture/input copies there and publish curated research outputs only explicitly.
Never duplicate a numbered research tree or WORK.md in code. Resolve input/output overrides to a role first: relative
research artifact paths use research; explicit external overrides require a mapped,
authorized location and must not silently redirect the authoritative index.

### Links across mapped roots

Documentation and its authoritative index stay in their configured research paths.
Cited evidence may live in any authorized mapped research, code, work or reference
root. Write navigable Markdown links relative to the containing document, including
cross-root ../ segments when needed; encode spaces or enclose destinations in angle
brackets. A link is resolved from its document, not from the code working directory.
Check each existing target after resolving aliases: it must exist and remain inside
its authorized mapped root. Reject escaping aliases and unmapped targets. A relative
path crossing the research boundary is valid when its resolved target is in another
authorized mapped root; link criteria must not require every target inside research.
Use role labels and reference IDs for clarity. Do not replace valid evidence links
with plain code paths just to keep links inside research. Mark future outputs as
planned paths, not verified links, until they exist. Record unavailable targets as
unverified. Link availability does not grant write access or relocate an index.

For legacy layouts only, locate existing INDEX.md at the project root or in
01-documentation. If both exist and authority is unclear, stop for a choice.
Retain existing paths. These location rules precede the legacy example paths below.
When Node is unavailable, apply this same contract with the host's JSON/file tools;
report that the executable resolver was not used. If either required location is
inaccessible, stop dependent work. Direct reading of an accessible research record
remains possible and must be described as limited record access, not split execution.

Before a write: name the actual target; check resolved containment and existing
contents; reject symbolic/hard-linked output files and escaping parent aliases;
retain history for approved record/index edits; reread and reconcile intervening changes.
Existing instructions, source files, config and indexes are preserved during init.
Migration, source replacement, and repair require their own reviewed scope.
Zero discovered inputs, unavailable results, or read errors mean incomplete verification.
Report expected and observed coverage; never call a zero-input run a successful check.

### Existing WORK.md checkpoints

Only when a checkpoint is authorized, use the candidate research-work connector or
bundled scripts/work-records.mjs: research_work_read, then research_work_checkpoint
with that exact revision and only the new entry, optional Resume here body and
approved metadata. Do not submit a regenerated full record. The helper constructs
the update from stored bytes and rejects removal, rewriting or reordering of the
existing dated-history section before replacement. It also preserves an exact
pre-edit recovery copy. Verify the returned revision and complete saved content
with a fresh read; name only recovery paths actually observed.

Do not replace or edit an EXISTING WORK.md using Write, Edit or shell file writes.
If the candidate helper/connector cannot run, permission is denied, or the record
is unsupported, leave the record unchanged and report CHECKPOINT_BLOCKED with the
observed reason. A full Read, exact backup or promised preservation does not waive
this requirement. Do not bypass it through another skill, a new record in code,
or a regenerated file. Authorized artifact/index work can finish independently;
report its actual outcome separately from the unsaved checkpoint. A failed or
uncertain helper response requires a fresh record/history read before any retry.
This rule does not grant checkpoint permission to directory-only init.

### Recovery prerequisite for file-tool index edits

When the connector/helper cannot run (including permission denial), apply this
sequence to EACH existing index that needs an authorized edit. This is
a mandatory write prerequisite, not a final reporting suggestion.

1. Read the complete current file, without truncation. Verify its resolved path
   and regular-file status; reject symbolic/hard links and escaping parent paths.
   If the available tools cannot establish a safe target, stop the dependent edit.
2. Before editing the target, create an exact copy of those original bytes at a
   NEW, collision-checked path in a real adjacent .research-work-history directory:
   <basename>.<UTC timestamp>.<unique suffix>.md. Never overwrite a history file.
   Recovery directories/copies are permitted documentation bookkeeping; they are
   not a project scaffold or source reorganization.
3. Read the recovery copy back and verify it against the entire original,
   including its final newline. Use a byte comparison or SHA-256 when available;
   otherwise report full-text comparison only. A planned path, summary, or copy
   made after the target edit does not satisfy this prerequisite. If backup
   creation or verification fails, leave the existing target untouched and stop.
4. After step 3 has returned successfully, issue a SEPARATE full Read of the
   target. Wait for its result, compare it with the verified recovery bytes,
   then write that target before doing work on another file. A target read or
   cmp performed during backup verification does not satisfy this later reread.
   Do not batch this Read with the verification or the Write: their order depends
   on each preceding result. If bytes differ, stop and reconcile, then back up
   the newly agreed version. Retain all existing dated history, source links and
   unrelated index sections.
5. Apply only the authorized edit, read the complete saved target back, and
   report both target and verified recovery paths. Do this again before EACH
   later edit of the same file, even within this session. An original-session
   backup alone does not preserve an intermediate version.

For an index, prepare all row/timestamp changes together. Finish original Read ->
recovery Write -> verification result -> separate complete target Read and byte
comparison -> ONE target Write -> complete saved-target Read before another edit.
A later index correction requires its own new verified recovery copy.

### Complete saved-file reads

After saving each existing WORK.md or index, use the Read tool to reopen its ENTIRE
saved contents. Do not substitute a frontmatter excerpt, grep match, heading count,
hash alone, Write tool echo, or remembered proposed content. If a complete read is
unavailable, report the checkpoint as not fully verified. Also read each newly saved
lifecycle document completely before registering it. At command close, confirm that
the artifact, WORK and index each have a complete successful saved-file read after
their last write. Only then report those readbacks as completed.

File-tool fallback has no atomic concurrency guarantee; use one writer and state
this limitation. Never claim a helper revision check ran when it did not. A
permission-denied helper is unavailable for this invocation, not proof that Node
is absent. If an earlier helper response is uncertain, read the current record
and history before deciding whether a helper retry is still needed. Existing WORK
updates have no file-tool fallback.

<!-- location-contract-v1:end -->


1. **Parse arguments.** Extract `project_path`, `--workstream`, `--deep`, `--git-history`, and `--output` from `$ARGUMENTS`. If `$ARGUMENTS` contains only a help request (`--help`, `help`), print a usage summary and stop:
   ```
   Usage: /experiment-adopt [project_path] [--workstream name] [--deep] [--git-history N] [--output path]
   Example: /experiment-adopt ./docking-benchmark --workstream protein_docking --deep
   ```
   If `$ARGUMENTS` is empty, use `.` as the project path and proceed with default settings.

2. **Validate project path.** Confirm the directory exists and is accessible. If not, report the error and stop.

3. **Validate workstream name (if provided).** Apply the naming convention from [[graph#naming-convention]]. If invalid, normalize and present to user for confirmation.

4. **Detect existing experiment structure.** Check whether the project already has:
   - `INDEX.md` (at root or in `01-documentation/`)
   - `01-documentation/` directory tree
   - Any `*_plan*.md`, `*_process*.md`, `*_findings*.md`, `*_report*.md` files

   If experiment structure is detected, note this — the adoption report will focus on gap analysis rather than full onboarding.

5. **Scan the project directory.** Collect a comprehensive inventory:

   a. **File tree:** Recursively list all files and directories (exclude `.git/`, `__pycache__/`, `node_modules/`, `.venv/`, `04-analysis/` if present). Record file counts by extension.

   b. **File classification:** Categorize each file into one of these framework categories:

   | Category | Heuristic |
   |----------|-----------|
   | `data` | Files in `data/`, `raw/`, `03-data/`; CSV, TSV, FASTA, PDB, JSON data files |
   | `scripts` | `.py`, `.R`, `.sh`, `.jl`, `.m` files; Jupyter notebooks (`.ipynb`) |
   | `results` | Files in `results/`, `output/`, `05-results/`; figures (`.png`, `.svg`, `.pdf`), summary CSVs |
   | `docs` | `.md`, `.rst`, `.txt` documentation; README files; anything in `docs/` |
   | `config` | `.yaml`, `.yml`, `.toml`, `.json` config files; `Makefile`, `Snakefile`, `Dockerfile` |
   | `other` | Everything else |

   c. **Active period:** Determine the project's time span from file modification dates (earliest → latest).

   d. **Size estimate:** Total file count and approximate total size.

6. **Git analysis (if `--deep`).** If the project is a git repository and `--deep` or `--git-history` was specified:

   a. Read the last N commit messages (default 50)
   b. Identify files with highest churn (most commits)
   c. Look for decision-like commit messages (keywords: "switch", "change", "fix", "revert", "try", "replace", "remove", "add", "refactor")
   d. Note contributor patterns (number of contributors, activity windows)
   e. Identify significant transitions (large commits, merge commits, tag points)

7. **Propose workstream name.** If `--workstream` was not provided:
   - Infer from: project directory name, README title, dominant file naming patterns, git remote name
   - Validate against [[graph#naming-convention]]
   - Present the proposal to the user for confirmation

---

### Split assessment

Establish whether the intended work is reading/documenting or maintaining/executing code.
Active cloud Git, maintained/repeated code, persistent execution environments, or extending
an analysis trigger split assessment. An old script, missing historic code, reading papers,
or bench planning alone does not. Prepare an exact scope, preservation manifest, meaningful
check and rollback route before seeking approval for a migration. File timestamps do not
establish scientific priority. Do not copy, move, rerun or reconstruct work during assessment.

## Phase 1: Generate the Adoption Report

Using the inventory and analysis from Phase 0, generate a markdown document with the following structure. Every section must contain specific, concrete details from the scan. Do not use placeholders or generic text.

Before writing any inventory count, reconcile it against the enumerated source set.
State the counting boundary and time: files in mapped roots before this operation,
external host configuration, and newly generated documentation are separate sets.
Category subtotals must sum to the stated total for that same set; count each file
once. Derive index-section counts from the exact headings in the pre-edit index,
and list those headings alongside the count. A section added during registration
must not be described as present at scan time. If a count cannot be verified, report
it as unverified instead of estimating. Recheck every repeated count in the summary,
inventory tables and gap analysis before saving.

The YAML status must be exactly one of: pending, active, in-progress, complete,
or superseded. Keep explanations outside frontmatter; never append an HTML comment
to a status value. Check the saved enum value before registering the document.

<!-- evidence-provenance-v1:start -->
### Preserve execution and verification provenance

Use the same evidence ledger for adopt, plan, capture, findings and report,
including their WORK entries and final responses. For each executed
action or verification claim, retain: the named actor/session or tool that performed
it; the action and exact source/result files; the evidence supporting the claim;
what was checked and by which method; and when/how often that check actually ran.
Name the executor separately from the documenting assistant. An external orchestrator
may itself be assistant-driven: "not run by this Claude session" must not become
"not run by an assistant." If the executor is unknown, retain that uncertainty.

Separate observed runs from plans, reported runs and inspection. Preserve runtime
identity only for the action that used it; an inspected environment specification
does not prove that environment executed. A check of seeded outputs does not establish
their historical generating pipeline. Keep missing historical provenance unknown.

Verification scope and timing must remain literal: selected-file hashes at recorded
points, recovery-copy comparisons before record edits, and full snapshots after a
command are different checks. Do not broaden these into all files after every write,
continuous verification or a completed future check. Cite the supporting artifact or
observed tool result. If only a planned check is known, say planned/unverified.

An evidence artifact or check absent from the supplied receipt is not proven absent
from the project. Inspect the available mapped roots and named receipts first. State
"not supplied here" or "not verified by this session" when that is all the evidence
supports; do not change those limits into "does not exist", "not retained", or
"cannot be verified" or "not executed". Missing evidence and known non-execution
are separate states; never join them as "not executed / not supplied". A planned
run may be called not yet executed only when that state is independently known.
Retain receipt timestamps and their as-of scope. Later receipts
may add completed checks without changing earlier immutable receipts.

For stdout hashes, inspect the execution receipt for a retained stdout artifact and
compare that file's SHA-256 with stdout_sha256 before declaring a verification gap.
An evidence JSON file may itself contain the original stdout bytes. Attribute checks
performed by an orchestrator separately from checks repeated by this session.

Only a complete post-save file read establishes a readback. Record which actor read
which files, not "every target" unless every target is evidenced. Keep protected
source preservation distinct from authorized edits to pre-existing WORK/index files.
Do not say "no pre-existing files changed" when those records changed.

The document's evidence ledger is as of its preparation, before its own final save.
Describe this operation's remaining save/register/checkpoint checks as pending there;
report their actual completion in the final command response after they run. Never
invent completed checks or recovery filenames for pending actions. Use actual paths
from observed writes; omit unavailable filenames rather than leaving placeholders.

Before saving, trace each execution, preservation and completion claim back to its
evidence and retain all qualifiers. Report contradictions or gaps rather than silently
upgrading certainty during synthesis. This applies to summaries as well as methods,
tables and conclusions. Use existing template sections; no extra numbered section
is required for the ledger.

### Claim timing, counts and criterion assessments

Apply the preparation cutoff to the ENTIRE document, including summaries, status,
methods, decisions, tables and conclusions. At preparation, this command's own
save, registration, checkpoint and final verification are pending. Do not describe
their outcomes as completed in another section. Describe corrections to an earlier
procedure as intended until this invocation actually performs them. The final
command response may report completed outcomes only after the observed checks.
For each final-response count or claim, use evidence available at that later cutoff;
do not silently reinterpret the document's earlier snapshot as the final state.

Observed unchanged bytes and exact recovery comparisons support preservation at
those checked points. They do not establish that files were never at risk, that
all possible races were prevented or that preservation was continuous.

For every aggregate count, define the object counted, included roots, exclusions
and snapshot boundary, enumerate the items at that boundary and count the distinct
paths. Refresh mutable inventories (especially recovery copies) before reporting
their current count; do not copy a stale count from an upstream artifact. Keep
existing, newly created, modified and pending items separate. If a count cannot be
reconciled with its own table or current inventory, omit the aggregate and report
the verified items and limitation. For hash claims, list each artifact, who hashed
it, source receipt and whether this session compared it; count those ledger rows.
Distinguish hash fields emitted by a checker from hashes of stdout/receipts saved
by an orchestrator. Do not turn multiple roles for one artifact into extra files.

Classify checker fields by their actual source: observed file contents/hashes,
runtime observations, declared expectations/parameters, fixed actor/provenance
labels, or literal output fields. Inspect how each field is assigned: a hardcoded
count or empty error array remains a literal even if named "observed" or printed
by a successful run. Describe actual successful reads separately from those literals. A successful comparison does not make every printed field empirical or
prove how seeded results were generated. Name only the comparisons the code ran.

For each plan criterion, identify the scenario actually executed and its evidence.
Use met or not met only when that criterion's scenario was exercised. Mark an
unexecuted branch not exercised (or unknown when execution cannot be established).
A nonzero-input run with no read errors does not test zero-input or error behavior;
an absence of failure does not establish an unexecuted branch passed. Keep each
criterion's assessment distinct from overall workflow completion.

Report a duration only for a named activity with supported start/end timestamps
and time zone. Do not extend an interval to include later documentation or checks.
When the endpoint or activity boundary is unavailable, state duration unknown;
do not estimate a whole-session duration from a narrower coverage-check interval.

### Reconcile claims at each writing boundary

Use a compact working ledger with one row per material claim:
subject file or criterion; action/value; actor; supporting source/tool result;
evidence time; state (observed, reported, inferred, planned, unknown).
Keep the ledger in existing relevant template sections or working context, without
adding numbered sections. Do not invent another output artifact for bookkeeping.

Use one authoritative enumeration for each group of criteria, issues, files or
sections. Give rows stable names, reconcile their membership and status, and derive
any total from that same set. Check repeated totals in summaries, tables, WORK and
the final response. A changed snapshot must be labelled and counted separately.
Do not volunteer a section count or repeat an aggregate when it adds no useful
information. If a necessary count cannot be reconciled, list the items without it.

For each target separately, distinguish new-file creation, existing-file update,
pre-edit recovery, hash comparison and complete saved-file read. A new document
does not inherit the recovery copy made for an existing WORK or index. Each
recovery claim must identify the existing target it actually protects. A hash
printed in a receipt, reading that receipt, and rehashing the receipt file are
three different actions; name only the action actually evidenced for each file.

Assess each criterion from its evidence. A review's passed-check list supports
only the named checks, not additional plan criteria inferred by the author. Label
such new assessments as this document's assessment, with their supporting evidence.
Do not turn a successful document save into lifecycle or all-app acceptance.

Keep corrections artifact-specific. A later correcting WORK entry or downstream
report can explain an earlier error while preserving history. It does not repair
the original artifact unless that exact file was authorized, changed and verified.
Name what was corrected and what remains unchanged or unresolved. At preparation,
proposed corrections and this document's own save/checkpoint remain pending in
every section, including issue tables, conclusions and status prose. Do not say
"accuracy restored", "closed" or "resolved" for a pending operation.

Before each artifact or WORK write, reconcile its complete draft against the
ledger. After saved-file reads, reconcile the final response against the actual
saved text and completed tool results. If an assertion is unsupported, narrow or
omit it before delivering that surface; do not rely on a later command to correct it.

Use exact sets, not nearby totals. A criterion's output set is the files that
criterion names; an adoption document does not substitute for a required report.
A review receipt and an issue within it are different objects: one review can
contain several issues. For preservation, unchanged files exclude authorized
modified files even when both were in the baseline. Do not report a baseline's
total as the unchanged total. A receipt has an overall pass verdict only if it
actually supplies that field; named preservation checks do not imply full acceptance.

In each WORK entry, name each existing target beside its actual recovery path.
Avoid relative phrases such as "both edits above" that can refer to a new document.
Mention only the current command's observed record/index updates. Directory-only
init does not acquire a checkpoint or registration through a lifecycle summary.
Do not carry a directory-content claim forward from its creation-time snapshot.
Keep hash comparisons distinct from independent readings or reproductions of data.
<!-- evidence-provenance-v1:end -->

### Roadmap action scope

Apply the same command-specific permissions in every roadmap item and summary.
Directory-only init creates missing authorized directories; existing WORK and
INDEX stay read-only, with no checkpoint, index refresh or recovery-file creation.
Any ongoing checkpoint cadence must explicitly exclude init and remain conditional
on authorization for the document-producing command. A general phrase such as
"after each lifecycle command" is inaccurate even when a different item states
the init exception. Before saving, reconcile P1, P4 and the final recommendation
against this same scope; a roadmap never grants future write permission.

### Output Template

````markdown
---
title: "{Workstream} Adoption Report"
type: adoption
workstream: {workstream}
project: {project_name}
date: {YYYY-MM-DD}
status: active
source_directory: {absolute_or_relative_path_to_scanned_directory}
---

# {Workstream} Adoption Report

## 1. Project Audit Summary
<!-- (100-200 words) -->

{2-3 paragraphs providing a high-level overview of the project: what it appears to do,
its current state, and its readiness for structured documentation.}

**Project at a Glance:**

| Attribute | Value |
|-----------|-------|
| Source directory | `{path}` |
| Total files | {count} |
| Active period | {earliest_date} — {latest_date} |
| Primary language(s) | {languages by file count} |
| Existing documentation | {brief assessment: none / minimal / partial / extensive} |
| Experiment structure | {none / partial / complete} |
| Git repository | {yes (N commits) / no} |

## 2. Artifact Inventory

{Classified tables for each non-empty category. Include proposed target location
within the experiment framework for each artifact.}

### Data Files

| File | Current Location | Format | Size | Proposed Location | Action |
|------|-----------------|--------|------|------------------|--------|
| {filename} | `{current_path}` | {format} | {size} | `{proposed_path}` | {move / keep / archive} |

### Scripts

| File | Current Location | Language | Description | Proposed Location | Action |
|------|-----------------|----------|-------------|------------------|--------|
| {filename} | `{current_path}` | {lang} | {brief purpose} | `{proposed_path}` | {move / keep / rename} |

### Results

| File | Current Location | Format | Description | Proposed Location | Action |
|------|-----------------|--------|-------------|------------------|--------|
| {filename} | `{current_path}` | {format} | {what it contains} | `{proposed_path}` | {move / keep} |

### Documentation

| File | Current Location | Content | Proposed Location | Action |
|------|-----------------|---------|------------------|--------|
| {filename} | `{current_path}` | {summary} | `{proposed_path}` | {move / keep / integrate} |

### Configuration

| File | Current Location | Purpose | Proposed Location | Action |
|------|-----------------|---------|------------------|--------|
| {filename} | `{current_path}` | {what it configures} | `{proposed_path}` | {keep / move} |

{Omit empty category tables. If a category has no files, skip it entirely.}

## 3. Workstream Decomposition

{Propose one or more workstreams that represent the logical units of work in this project.
For each workstream, describe its scope, the evidence for why it should be a separate
workstream, and the artifacts that belong to it.}

### Workstream: {workstream_name}

**Scope:** {What this workstream covers}

**Evidence:** {Why this is a coherent unit of work — file naming patterns, shared data,
sequential processing steps}

**Included Artifacts:**
- {artifact_1}
- {artifact_2}

**Inferred Phases:**

| Phase | Label | Evidence | Status |
|-------|-------|----------|--------|
| 1 | {phase_title} | {files/commits that indicate this phase} | {complete / in-progress / not started} |
| 2 | {phase_title} | {evidence} | {status} |

{Repeat ### Workstream block if multiple workstreams are proposed.}

## 4. Documentation Gap Analysis

### Current Documentation State

{Summary of what IS documented: READMEs, inline comments, docstrings, any existing
reports or notes.}

### Documentation Gaps

| Gap | Impact | Priority | Recommended Action |
|-----|--------|----------|-------------------|
| {what is missing} | {consequence of the gap} | {P1-critical / P2-high / P3-medium / P4-low} | {specific action to close the gap} |

### Decision Archaeology
<!-- Populated when --deep flag is used; otherwise note that git analysis was not requested -->

{Undocumented decisions inferred from the git history or file evolution. Each entry
traces a decision from its evidence.}

#### Decision: {Short title}
- **Evidence:** {Commit messages, file renames, code changes that reveal the decision}
- **Inferred context:** {What was likely happening at the time}
- **Impact:** {How this decision shaped the current project state}
- **Documentation need:** {What should be captured retroactively}

{Repeat for each inferred decision. If --deep was not used, write:
"Git history analysis was not performed. Re-run with `--deep` to enable decision archaeology."}

## 5. Adoption Roadmap

{Prioritized checklist organized by urgency. Each item maps to a specific experiment
skill command or manual action.}

### P1: Foundation (do first)

- [ ] Run `/experiment-init {workstream}` to create project structure
- [ ] {Organize raw data into `03-data/raw/`}
- [ ] {Move scripts to `02-scripts/` with numbered prefixes}
- [ ] {other foundation items}

### P2: Retroactive Documentation (backfill)

- [ ] Run `/experiment-plan {workstream}` to create retroactive plan
- [ ] {Capture completed phases with `/experiment-capture`}
- [ ] {other backfill items}

### P3: Gap Closure (address missing pieces)

- [ ] {Document undocumented decision X}
- [ ] {Create missing data lineage documentation}
- [ ] {other gap items}

### P4: Going Forward (ongoing practices)

- [ ] {Establish an authorized WORK checkpoint cadence for document-producing commands; explicitly exclude directory-only init, which leaves existing WORK/INDEX unchanged and creates no checkpoint, index refresh or recovery file}
- [ ] {Set up data management conventions}
- [ ] {other going-forward items}

## 6. File Migration Plan

{Complete mapping of current files to proposed locations. This is guidance only —
no files are moved by this command.}

**Legend:** `move` = relocate to new path, `rename` = change filename only, `keep` = leave in place, `archive` = move to `04-analysis/` or similar

| Current Path | Proposed Path | Action | Notes |
|-------------|--------------|--------|-------|
| `{current}` | `{proposed}` | {move/rename/keep/archive} | {any context} |

**Migration notes:**
{Any caveats about the migration plan — files that need manual review, potential
conflicts, files that may need splitting or merging.}
````

<!-- For a worked example, see [[examples/adopt-example]] -->

### Downstream Dependencies
<!-- What downstream commands read from this document -->

- **[[experiment-init]]** reads: nothing directly, but the adoption report guides the user on which init flags and options to use.
- **[[experiment-plan]]** reads: nothing directly, but the workstream decomposition (Section 3) and inferred phases inform plan creation.
- **[[experiment-capture]]** reads: nothing directly, but the gap analysis (Section 4) identifies which retroactive captures are needed.

The adoption report is advisory — downstream commands do not parse it programmatically.

---

## Phase 2: Write and Register

<!-- artifact-close-v1:start -->
### Saved artifact, checkpoint and response gate

Apply this gate within Phase 2. Before registration, read the complete saved
artifact and check the claims against the evidence ledger. Validate links from
the directory of EACH file that contains them: artifact, WORK and index have
different bases. Resolve every local Markdown evidence link, decode spaces, and
check existence and containment in an authorized mapped root. Enumerate the actual
targets, rather than treating a directory listing or a link in another document
as proof that this artifact's links work. Planned output paths remain labelled
plain paths until they exist; readable metadata outside mapped roots remains a
labelled plain path under the shared location contract.

When capture, findings or report uses external results or working-storage evidence,
include a navigable link to the actual cited evidence file in THAT artifact. For
example, a findings document relying on a work-root execution receipt needs its
own receipt link. A report or WORK link cannot satisfy the findings requirement.
Do not require links to unrelated roots that supplied no evidence.

Correct defects in this invocation's new artifact within the authorized scope and
repeat the complete Read and link check after its final edit. Existing WORK updates
require the checkpoint helper; index edits require the full recovery protocol. Preserve earlier protected artifacts;
record their unresolved defects accurately if correction was not authorized.

Prepare the WORK entry from verified artifact/registration outcomes and the same
claim ledger. Its own save/readback is still pending when that entry is composed.
After the last writes, verify complete saved reads and all local links for the
artifact, WORK and index. If a required check is unavailable or fails, report the
specific incomplete outcome and leave acceptance unmet.

Then write a concise final response from completed tool results: output path,
supported substantive result, observed save/readback/link outcomes, and any actual
limitation. Follow this command's required summary fields, but omit extra inventory,
section counts and review verdicts. Reconcile every retained count and claim with
its named subject and snapshot. Report current checks separately from earlier
receipts. A full readback proves returned content, not that its claims are accurate.
<!-- artifact-close-v1:end -->

1. **Determine output path.** Use `--output` if provided, otherwise:
   - If `01-documentation/` exists: `01-documentation/{workstream}_adoption.md`
   - If not: `{project_root}/{workstream}_adoption.md`

   For split projects, write inside the existing resolved documentation folder, or research root if that folder is absent. Do not create project structure during adoption.

2. **Write the file.** Save the adoption report to the output path.

3. **Update INDEX.md.** <!-- see [[graph#indexmd-protocol]] -->
   If the resolved authoritative index exists:

   ```
INDEX.md Update Protocol:

1. LOCATE: Use the resolved paths.index for split projects. For legacy
   projects, retain the single existing root or 01-documentation/INDEX.md.
2. READ: Read the entire file content.
3. FIND SECTION: Find the target section heading (## Adoptions, ## Plans,
   ## Process Artifacts, ## Findings, or ## Reports). If the section does not
   exist, create it with the appropriate table header.
4. FIND TABLE: Locate the markdown table under that section heading.
5. CHECK DUPLICATES: Scan existing rows for a row matching this workstream +
   qualifier + filename. If found, update the row's date and status instead
   of appending.
6. APPEND ROW: Add a new row to the table with the format specified for that
   section type:
   - Adoptions: | {date} | {workstream} | [{filename}]({path}) | {status} |
   - Plans:    | {date} | {workstream} | [{filename}]({path}) | {status} |
   - Process:  | {date} | {workstream} | {qualifier} | [{filename}]({path}) | {status} |
   - Findings: | {date} | {workstream} | {scope} | [{filename}]({path}) | {status} |
   - Reports:  | {date} | {workstream} | [{filename}]({path}) | {format} |
7. UPDATE TIMESTAMP: Update the "Last Updated: {YYYY-MM-DD}" line at the top
   of INDEX.md to today's date.
8. WRITE: Complete the Recovery prerequisite for file-tool edits BEFORE
   replacing an existing index: create and verify an exact recovery copy,
   wait for verification, then issue a separate full target Read and compare
   its returned content before the one target Write. Do not batch dependent
   verification, reread and write calls. If any
   prerequisite fails, leave the index untouched. Read back the saved index
   and report its recovery path. All row links are relative to that index,
   never the current code directory.
   Target section: "## Adoptions"
   Row format: | {date} | {workstream} | [{filename}]({path}) | {status} |

   Note: The "## Adoptions" section may not exist yet. If it does not exist,
   create it with the table header immediately before "## Plans". If "## Plans"
   does not exist either, create "## Adoptions" after the metadata block.
   ```

<!-- final-delivery-v1:start -->
### Last action before the final response

1. Locate the LAST successful mutation for each saved artifact, WORK and index,
   including a helper checkpoint as well as Write or Edit.
   A Read before that mutation cannot verify its final contents. After an artifact
   correction, issue a NEW whole-file Read from line 1, with enough lines for the
   entire file. Check the returned startLine and numLines/totalLines, not merely
   the request or a successful tool flag. A corrected-line excerpt or tail does
   not satisfy this gate. Repeat after any further edit. Verify WORK/index full
   reads after their own final writes too, then validate each file's own links.
2. Reconcile the proposed response and the new WORK entry with these saved bytes.
   Keep the response to the command's required summary, exact output and target
   paths, target-to-recovery pairs, completed checks and actual limitations. Omit
   optional aggregate filesystem, recovery and link totals; the named paths and
   outcomes suffice. For a required count, enumerate the exact requested set and
   its snapshot. Do not infer an overall verdict from a receipt's partial checks.
3. Choose any suggested next action from the named scope and observed statuses.
   A successful findings save does not mean all phases have findings. Identify
   which phases were assessed and which remain unassessed; a progress report may
   be proposed without asserting completion. Keep suggestions unconfirmed.
4. If any gate failed or was skipped, report that specific limitation. Say that a
   document was saved only after its actual save; say that final readback passed
   only after the complete post-mutation Read returned. Do not claim acceptance
   from a successful save, a full Read, or an earlier receipt.
<!-- final-delivery-v1:end -->

4. **Report to user.** Print:
   - The output file path
   - A one-line summary of classified scope, workstream(s) proposed and gaps identified; include a file count only if reconciled to the named inventory snapshot

5. **Suggest next steps.** Print a "Suggested next steps" block:
   - If project has no directory structure: suggest `/project-scaffold` to create base structure, then `/experiment-init {workstream}` to overlay lifecycle
   - If experiment structure already exists (INDEX.md found): suggest `/experiment-plan {workstream}` to define the next phase of work
   - Otherwise: suggest `/experiment-init {workstream}` to scaffold the project structure

---

## Formatting Standards

- Use `#` for the document title, `##` for numbered sections, `###` for subsections
- Use tables for structured data (inventories, gaps, migration plans)
- Label paths by research/code/work/reference role; use navigable relative links from the document to authorized mapped roots, including cross-root links.
- Bold key terms on first use in each section
- Priority levels use the P1-P4 scale: P1 (critical), P2 (high), P3 (medium), P4 (low)
- Every table must contain at least one real row — if a category is empty, omit the table entirely
- The roadmap checklist must use markdown checkbox syntax (`- [ ]`) for actionable items
- Decision archaeology entries must cite specific evidence (commit hashes, filenames, dates)

### Do Not

- Do not move, rename or delete sources, or create a project scaffold. Only the adoption report, existing-index registration, authorized WORK checkpoints and verified recovery bookkeeping may be written.
- Do not run `/experiment-init` or any other lifecycle command — the user decides when to proceed
- Do not add sections beyond the 6-section template
- Do not fabricate file details not found during the scan
- Do not include files from `.git/`, `__pycache__/`, `node_modules/`, or `.venv/` in the inventory
- Do not make assumptions about scientific content — describe what you observe, not what you infer about the science
- Do not propose workstream names that violate the naming convention

---

## Handling Incomplete Context

- If the project directory is empty or nearly empty: produce a brief report noting the project is in its earliest stage and recommend starting with `/experiment-init` directly instead of adopt.
- If no git repository exists: skip all git-related analysis in Section 4 decision archaeology. Note "Not a git repository — decision archaeology unavailable."
- If `--deep` was not specified and the project has a git repository: note in Section 4 that git analysis is available via `--deep` flag.
- If experiment structure already exists: focus the report on gap analysis (Sections 4-5) rather than full onboarding. The artifact inventory (Section 2) should note which files are already in their correct locations.
- If the project is very large (>500 files): summarize by directory rather than listing every file. Note the truncation and suggest re-running with a narrower `project_path`.
- If `$ARGUMENTS` is empty: audit the current working directory with default settings.

---

Generate the adoption report now. Scan the project directory thoroughly, classify all
artifacts, and produce the complete 6-section document. Write it to the appropriate
location and update INDEX.md if it exists.

$ARGUMENTS
