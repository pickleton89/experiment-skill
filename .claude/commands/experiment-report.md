<!-- template-version: 1.0 -->
<!-- Lifecycle: init -> plan -> capture -> findings -> [REPORT] -->
<!-- see [[graph]] for canonical definitions -->
<!-- graph-edges:
  domain: research-tools
  suite: experiment-lifecycle
  feeds-into:
    - markdown-to-pdf: "Generate branded PDF output"
    - scientific-slides: "Present results at meetings or conferences"
    - paper-2-web: "Create interactive web version of report"
  extends:
    - oligon-brand: "Branded styling via --oligon flag"
-->
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


1. **Parse arguments.** Extract `workstream` and flags from `$ARGUMENTS`. If empty or help request, print usage and stop:
   ```
   Usage: /experiment-report <workstream> [--output path] [--oligon] [--scope "phases"] [--title "title"]
   Example: /experiment-report boltz2_analysis --oligon
   ```

2. **Validate workstream name.** Apply the naming convention from [[graph#naming-convention]]. If invalid, normalize and present to user for confirmation.

3. **Resolve project locations.** Apply the shared location contract above. Use legacy root discovery only when it permits fallback.

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

5. **Read and parse the sources used.** Build the per-file source-access table described below. Retained earlier content may support ancillary sources when its origin and currency are evidenced; this does not waive the required current result-content read. Build an integrated understanding:
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

Executor identity establishes who performed the action, not whether it was attended, unattended, supervised or autonomous. Do not infer those conditions without direct evidence. Apply this limit in every report section and the completion response.

Before synthesis, reopen the actual result data file with the Read tool in THIS
invocation. Hashing, directory listing, a previous session read, or parsed values in
an evidence summary do not replace this direct result-content read. Record any
failure to reopen it as incomplete verification, even when retained hashes agree.

### Report-specific source-access accounting

Before synthesis, keep one row per source file actually used, including environment
specifications and each receipt. Do not group several receipts into an all-read row.
Put this table in existing Methods 2.1 and use it as the source of access claims in
the report, WORK entry and final response; those shorter surfaces may refer to the
table or name only a supported subset instead of repeating it.

Keep the Source file cell machine-checkable: exactly one Markdown link to a local
file, or one backtick-quoted local file path, with no extra prose. Resolve relative
paths from the report's destination directory. Put qualifications such as retained
stdout, pre-edit version and outside-mapped-root read-only source in the other
columns. Instruction files follow the same rule: AGENTS.md, CLAUDE.md, SKILL.md and
each contract document require separate rows even when their access is identical.

| Source file | Content access | Hash action | Actor and supporting result/receipt |
|-------------|----------------|-------------|-------------------------------------|
| {one actual file} | {complete read in this invocation / retained content from a named earlier invocation / content unverified} | {current comparison, with named comparator / hash value read from a named receipt only / not compared} | {actor/session; actual content result and separate hash evidence} |

Classify content access and hash action independently from observed tool results.
A successful hash comparison supports byte identity to its named comparator; it
does not read the file's content, establish an earlier content read, or validate
its claims. Reading a receipt containing a source hash is not hashing that source;
hashing a receipt is not comparing every source hash recorded inside it. A partial
read cannot be labelled a complete read. If earlier content or its originating
invocation cannot be established, label content unverified and state any known
partial access; reopen it if needed for the report's conclusions.

Retained content must identify its actual earlier invocation and any evidence of
currency (for example, a current hash matching the earlier content bytes). Without
such evidence, retain that currency limitation or reopen the source if material.
Do not force unnecessary ancillary rereads merely to justify a broader fresh-read
claim. The separate requirement to reopen actual result data still applies.

At each writing boundary, check every source-access claim against these rows.
Do not say sources were reread "in this invocation", "in this run", or "all receipts"
unless each named file has the corresponding complete current content read.
Otherwise identify the current subset and retained earlier sources accurately.
Keep the report's preparation cutoff distinct from later artifact/WORK/index
readbacks. Later reads do not retroactively change the report's earlier access
table. Update the working rows for later claims only with observed new actions;
never convert an earlier hash action into a later content read.

Apply the same per-file distinctions explicitly to pipeline diagrams. Draw current
content reads, retained earlier content and current hash comparisons as separate
named actions or edges, with the invocation beside each. Do not draw a blanket
"report reads all sources/the above" edge over a mixed-access source set. A diagram
is an access claim too; an accurate Methods table does not qualify a contradictory
arrow elsewhere. Trace each source in a grouped edge to the table before saving.

Enumerate the exact member files of every current-content-read diagram node or
edge. A label such as "instruction files (Section 2.1)" is insufficient when that
section mixes access modes. Name the complete-current-read subset explicitly;
show command text supplied through prompt expansion and a hash of its on-disk
file as separate actions. Neither establishes a complete Read of that file.
If an exact grouped subset cannot be shown clearly, use individual source nodes.

### Report-specific source and capability checks

Before drafting Methods, the pipeline diagram or recommendations, trace each
artifact to the action that actually produced or saved it. Read the relevant
script and execution receipt. A program that emits stdout has not thereby written
the retained stdout file or the orchestrator's separate execution/verification
receipts. Name the program's emission and the orchestrator's file saves as separate
actions, with their own evidence. Draw separate nodes/arrows where applicable;
do not merge them into "the check writes its receipts" in prose or diagrams.

Distinguish reading bytes for hashing from parsing or using their meaning. Trace
the value used by a calculation to its actual assignment: a hardcoded expectation
is not derived from reference text even when that reference is read to hash it.
For example, say "reads the reference bytes for SHA-256; the expected ratio is
hardcoded, not parsed from that text" when the source supports both facts. Do not
shorten this to "does not read the reference." Keep the scientific program's
byte reads distinct from this reporting invocation's content-access table.

### Report-specific denied-attempt and completion accounting

Keep a compact ledger in working context, updated when each tool result returns:
tool-call ID (or unique occurrence), attempted operation, observed outcome/error,
successful replacement with its own result, and any remaining unexecuted work.
One denied compound shell tool call is one denied attempt; its constituent
operations are a separate set. A later successful call does not erase a denial.
Preserve distinct repeated attempts, but do not count a repeated display of the
same tool-call ID twice. Do not infer which constituent operations ran from the
command text alone. Report only the error cause actually established by results.

At document preparation, WORK preparation and final response, reconcile against
the tool results available at that specific boundary. Include late denials from
link, recovery and final verification checks in the final reconciliation. If a
total is useful, derive it from the unique denied attempts and enumerate them;
otherwise name the affected operations without a total. Never reconstruct a
count from a remembered prose summary or hardcode an earlier run's count.

For each unavailable operation, name what a successful permitted replacement
actually established and what remained unexecuted or unverified. Hash equality
does not mean a byte-dump command ran; manual location checks do not mean the
executable resolver ran; successful saves do not establish all-app acceptance.
Do not conclude "no check was skipped" merely because replacements succeeded.
Keep required gates blocked when their actual prerequisites did not succeed;
this ledger grants no permission to retry denied actions or switch guarded routes.

Keep these tool responsibilities distinct throughout the report and recommendations:
- scripts/locations.mjs resolves and validates locations; it never writes records
  and does not supply record revision checks.
- research-work/scripts/work-records.mjs implements revision-checked record reads
  and checkpoints. Claim that protection only when its actual use is evidenced.
- File-tool fallback can preserve exact recovery copies and perform readbacks, but
  it has no atomic revision/concurrency guarantee. Do not imply that running the
  location resolver alone upgrades those edits.

Audit every Markdown link in the saved report, including File Manifest and
References. Resolve it relative to this report and require its real target to lie
inside an authorized mapped research/code/work/reference root. A supplied host
mapping or fixture-origin note may be readable outside those roots; reading
permission does not make it a valid mapped-root link. Cite such authorized external
metadata as a plain code-formatted path with an explicit "outside mapped roots;
read-only source" label, not a Markdown link. Do not move/copy metadata, expand a
mapping or fabricate an in-root substitute to make a link pass. Keep valid links
to evidence inside other mapped roots navigable.

Apply these checks to summaries, diagrams, tables, conclusions and recommended
actions, then complete the existing final whole-file read gate after any edits.

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
{Comprehensive description of input data: provenance, format, preprocessing. Include the per-file source-access table specified above, with content access and hash actions in separate columns; identify earlier invocations and actual supporting results.}

### 2.2 Computational Methods
<!-- (150-300 words) -->
{Tools, software, algorithms used. Include versions and key parameters.
Organized by phase/tier if methods varied.}

### 2.3 Analysis Pipeline
<!-- (50-100 words + diagram) -->
{Data flow from input to output, with the actual producer/saver named for each edge. Distinguish program stdout from the orchestrator saving stdout and writing separate receipts. Reference scripts by path.}

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
{Compare only with named supplied or actually inspected prior analyses. If no comparator was supplied or inspected, state that scope literally; do not assert no prior analysis exists. This section may be one sentence when evidence is limited.}

## 5. Conclusions and Recommendations

### 5.1 Key Conclusions
{Numbered list of principal conclusions, ordered by importance.}

### 5.2 Recommendations
{Specific, actionable items supported by the inspected tools. Location resolution does not provide revision-checked record editing; do not recommend the resolver as a substitute for the record helper.}

### 5.3 Open Questions
{Questions raised by this work that warrant future investigation.}

## 6. File Manifest

{Complete inventory of files produced across the workstream. For any supplied metadata outside mapped roots, use a labelled plain path rather than a Markdown link. Do not confuse inspected sources with produced files.}

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

<!-- For a worked example, see [[examples/report-example]] -->

### Downstream Dependencies
<!-- This is the terminal command — no downstream consumers -->

This is the final command in the lifecycle. No downstream commands read from the report.

---

## Phase 2: Write and Register

Before the first report write, validate the complete draft with the candidate
suite's read-only source-table checker. Prefer the session-configured
`report_source_access_draft` tool: supply only `{"markdown":"<complete literal draft>"}`.
The companion `scripts/report-source-access-tool.mjs` adapter must be staged beside
the unchanged `scripts/report-source-access.mjs` validator and launched with a fixed
absolute report path. Verify that the returned receipt names the intended report.
The adapter accepts text directly; never encode the draft into a shell command when
using this route. Its report directory must already exist. It has a 1 MiB UTF-8 limit.

If no structured checker is configured, the original local route remains
`node <resolved-candidate-script> --stdin --base-dir <absolute-report-directory>`
with literal stdin. Locate that script beside the same resolved candidate suite.
Choose an available authorized route before attempting validation. A denied route
is a stopping condition; do not switch routes to retry a denied action.

Fix every reported row and repeat the chosen check before saving. Do not modify
source files to satisfy it. Require `pass:true`, no issues and nonempty rows; for
the structured route retain its receipt and ensure its SHA-256 matches the exact
UTF-8 text to be saved. Any draft edit requires a new draft check. The checker
requires one resolvable local file per row and rejects duplicate canonical files.
It does not verify actual reads, source completeness, source hashes or mapped-root
scope; the source-access ledger and existing provenance/link checks still apply.

After the report's final edit and complete saved read, call
`report_source_access_saved` with `{}` on the structured route (or use the original
checker's `--report <absolute-saved-report-path>` route) before registration or a
completion claim. Require the same successful result and retain the saved receipt;
its hash must identify the final read-back bytes. Any later report edit requires
another complete read and saved check before registration. An unavailable, denied
or failed execution leaves the gate unverified or failed: stop before the next
dependent save/registration action. Do not describe manual inspection or host-only
helper tests as successful native executions. Report a native error's stated
possible causes as possible; do not select a definite cause without evidence.

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

Before composing the WORK entry or final response, reconcile its source-access wording with the Methods 2.1 per-file table and any later observed actions. Retained content plus a current hash remains retained content. A saved-file readback is a separate action on the saved target.

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
   Target section: "## Reports"
   Row format: | {date} | {workstream} | [{filename}]({path}) | md |
   If PDF was generated, add a second row: | {date} | {workstream} | [{filename}]({path}) | pdf |
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

### Bounded final response

Apply these limits to the opening sentence as well as the detailed summary and
WORK entry. Name verified outcomes: report saved, final source-table check passed,
index registered and WORK checkpoint read back, only as supported by the actual
receipts. Name any unexecuted check and its permitted replacement separately.
Do not conclude that "nothing required was left undone", "all checks passed" or
"nothing was skipped" from a successful replacement or artifact save.

For the required source summary, link to Methods 2.1 and name the principal
scientific/documentary sources. Do not add a grouped instruction-file full-read
claim. If instruction access matters, name the exact files completely read in
this invocation and separately identify retained earlier content, prompt-expanded
text and hash-only access. A correct detailed table does not qualify a broader
claim in the opening or final response.

Describe navigation indexes and recovery/lock bookkeeping as outputs of the
authorized helper route when that route was requested; do not infer missing
authorization solely because its individual side-effect paths were not enumerated.

5. **Report to user.** Print:
   - The output file path(s)
   - Summary of sources integrated
   - Scope covered and any unassessed phases; include word count only if requested and measured
   - If `--oligon` PDF was generated, note the PDF path

6. **Suggest next steps.** Based on the report produced, print a "Suggested next steps" block:
   - If `--oligon` was not used and branded output is desired: `/experiment-report {workstream} --oligon` — generate branded PDF version
   - For PDF output without branding: `/markdown-to-pdf` — convert markdown report to PDF
   - If results need presentation: `/scientific-slides` — build presentation from report
   - If report should be shared online: `/paper-2-web` — create interactive web version

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
