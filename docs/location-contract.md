# Shared project locations

Canonical protocol: [graph.md](graph.md).

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
Configured roots must exist; only scaffold creation may allow its new code root to
be absent, after validating the research and working roots.

For split layouts, directory names elsewhere in these templates are logical roles:
01-documentation -> paths.documentation; INDEX.md -> paths.index;
03-data -> paths.data; 05-results -> paths.results; 06-reports -> paths.reports;
06-reports/findings -> paths.findings; 07-publication -> paths.publication.
Plans/process go under paths.documentation. Scripts, tests and environments belong
to code; 04-analysis and scratch belong to work. Never duplicate a numbered research
tree or WORK.md in code. Resolve input/output overrides to a role first: relative
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
