# Experiment Skill — Analysis and Next Steps

**Date:** 2026-02-20
**Status:** Analysis complete, next steps identified
**Skill location:** `/Users/jeffkiefer/Documents/projects/experiment-skill/`

---

## 1. What the Experiment Skill Is

A 6-command Claude Code skill suite for managing the complete lifecycle of computational science documentation. Pure markdown — no runtime dependencies. Installable per-project via symlinks.

### The Commands

| Command | Purpose | Output |
|---------|---------|--------|
| `/experiment-adopt` | Audit existing project for lifecycle onboarding (read-only) | `{workstream}_adoption.md` |
| `/experiment-init` | Scaffold project structure and documentation registry | Directory tree + INDEX.md |
| `/experiment-plan` | Define objectives, phases, success criteria | `{workstream}_plan.md` |
| `/experiment-capture` | Record process artifact from session (lab notebook) | `{workstream}_process_{qualifier}.md` |
| `/experiment-findings` | Synthesize results against plan criteria | `{workstream}_findings_{scope}.md` |
| `/experiment-report` | Compile comprehensive IMRAD-style report | `{workstream}_report.md` |

### The Lifecycle

```
[existing project] → adopt → init (overlay) → plan → [execute] → capture → findings → report
                                                                    ↑                     |
                                                                    \--- next phase ------/
```

Each `capture → findings` cycle corresponds to one plan phase. The report integrates all findings into a single deliverable. For new projects, start at `init`. For existing projects, start at `adopt`.

### Origin

Designed from experiences on the M9A9/Del 60 structural biology project, where 8 process artifacts were captured across 2 workstreams with inconsistent naming, placement, and plan linkage. The skill generalizes the patterns that worked and fixes the gaps that didn't.

---

## 2. What's Already Well-Designed

### 2.1 Graph Principles Already Present

The experiment skill has organically adopted several knowledge graph principles:

**The `graph.md` hub file functions as a MOC.** It provides canonical definitions, a lifecycle diagram, data flow dependencies, wiki-link resolution tables, and an example index. Every command file references it. It is the single source of truth for the suite.

**Wiki-link syntax for inter-command navigation.** Commands use `[[experiment-capture]]`, `[[graph#naming-convention]]`, `[[examples/capture-example]]` — propositional links with an explicit resolution table. HTML comment hints (`<!-- see [[graph#naming-convention]] -->`) guide the LLM during execution.

**Downstream dependency declarations.** Each command explicitly documents what downstream commands read from it and which sections they consume. For example, `experiment-capture` declares:

```
- experiment-findings reads: Methods (Section 3), Measurements (Section 6), Decisions (Section 5)
- experiment-report reads: Methods (Section 3), Data lineage (Section 3), Decisions (Section 5)
```

These are `feeds-into` edges with section-level granularity — more precise than most graph implementations.

**Naming convention as unique address.** The `{workstream}_{type}_{qualifier}.md` pattern ensures every artifact has a predictable, unique address. This is the filesystem-as-graph-database primitive.

**INDEX.md as a living registry.** Updated by every command via a canonical 8-step protocol. Functionally equivalent to a topic MOC that maintains links to all nodes.

**Worked examples as graph nodes.** The `examples/` directory provides complete synthetic examples (rna_folding workstream, protein_docking adoption) that trace data across the full lifecycle. Each is linked from graph.md and from within commands via `[[examples/capture-example]]`.

### 2.2 Design Quality

**Science-aware templates.** Sections for data lineage, tool/method documentation, quantitative measurements, and artifact manifests — concepts absent from generic documentation tools.

**Linked lifecycle.** Every artifact connects to its parent: process artifacts link to plan phases, findings link to process artifacts, reports link to findings. The naming convention enforces these links.

**Three-tier detection in init.** Detects project-scaffold fingerprints (Tier A), existing experiment structure (Tier B), and bare directory overlap (Tier C). Non-destructive overlay for scaffold-generated projects.

**Embedded templates.** Each command contains its full output template, making commands self-contained. No external template dependencies.

**Stateless operation.** No state files beyond INDEX.md. Any command can be run independently given the right arguments.

---

## 3. What the Graph Approach Would Add

### 3.1 Cross-Suite Edges (The Primary Gap)

The experiment commands form a closed graph — they reference each other but nothing else. In practice, the experiment lifecycle frequently transitions to and from other skills:

| From | To | Why |
|------|-----|-----|
| `/experiment-capture` | `/plotting-libraries` | Visualize quantitative results from Section 6 |
| `/experiment-findings` | `/scientific-writing` | Draft manuscript sections from synthesized findings |
| `/experiment-report` | `/markdown-to-pdf` | Generate branded PDF output |
| `/experiment-report` | `/scientific-slides` | Present results at meetings/conferences |
| `/experiment-plan` | `/statistical-analysis` | Design analysis approach, power calculations |
| `/experiment-plan` | `/hypothesis-generation` | Formalize research questions |
| `/experiment-adopt` | `/project-scaffold` | Scaffold detected — suggest init after scaffold |
| `/experiment-capture` | `/reproducible-research` | Environment capture, data deposition |
| `/experiment-findings` | `/peer-review` | Self-review findings before reporting |

None of these edges exist today. Each transition requires the user to know the full skill landscape.

### 3.2 Suggested Next Steps in Output

Each command currently ends with a "Report to user" phase that summarizes what was produced. Adding graph-aware suggestions would surface what comes next:

**After `/experiment-capture`:**
```markdown
## Next Steps
- `/experiment-findings {workstream} {qualifier}` — synthesize
  these results against plan success criteria
- `/plotting-libraries` — visualize quantitative results from
  Section 6
- If final phase: `/experiment-report {workstream}` — compile
  integrated report
```

**After `/experiment-findings`:**
```markdown
## Next Steps
- `/experiment-report {workstream}` — compile integrated report
  (if all phases complete)
- `/scientific-writing` — draft manuscript sections from these
  findings
- `/experiment-capture {workstream} {next_phase}` — continue to
  next plan phase
```

The skill already knows the lifecycle position (from plan phase tracking). Adding cross-suite edges means the suggestions extend beyond the experiment lifecycle itself.

### 3.3 Suite-Level Discovery Entry Point

From the perspective of an agent seeing 45+ skills in the system prompt, there's no way to discover that these 6 commands form a coherent lifecycle without reading each description individually. A suite-level entry in a capability MOC would solve this:

```markdown
## Experiment Lifecycle (6 commands)

Linked documentation lifecycle for computational science projects.
Manages the full arc from project audit through structured planning,
session capture, findings synthesis, and integrated reporting.

- Start with `/experiment-init` for new projects
- Start with `/experiment-adopt` for existing projects
- Run `/experiment-plan` before executing work
- Run `/experiment-capture` at each phase checkpoint
- Run `/experiment-findings` to interpret results
- Run `/experiment-report` to compile the final deliverable

Domain: scientific-communication, research-tools
Feeds into: scientific-writing, plotting-libraries, scientific-slides
```

### 3.4 Dangling Link Detection

If command files start referencing capabilities that don't exist yet, those become demand signals. Candidates already implied by the design:

- `[[experiment-visualize]]` — figure generation tied to capture measurements
- `[[experiment-compare]]` — cross-workstream comparison
- `[[experiment-archive]]` — long-term storage and retrieval of completed workstreams
- `[[experiment-resume]]` — context recovery for interrupted workstreams
- `[[experiment-status]]` — dashboard across all active workstreams

These are not feature requests — they're structural evidence from how the commands interact.

### 3.5 Observation Capture for Skill Evolution

The design.md lists 7 open design questions (some now resolved). In the graph approach, these would be captured as tensions and observations:

**Tension:** "Findings and report both read process artifacts for methods sections. Shared extraction logic would reduce drift between them."

**Observation:** "User ran `/experiment-capture` without a plan 4 times — planless workflow is common enough to optimize for."

**Observation:** "The `--oligon` flag on `/experiment-report` is the only brand integration point. Other commands produce markdown that could also benefit from branded output."

**Observation:** "INDEX.md update protocol is identical across all 6 commands (copied verbatim). A shared implementation would prevent protocol drift."

---

## 4. Concrete Next Steps

### 4.1 Add Cross-Suite Edge Metadata (Low effort, high impact)

Add HTML comment blocks to each command file declaring edges to skills outside the experiment suite:

```html
<!-- graph-edges:
  domain: research-tools
  suite: experiment-lifecycle
  feeds-into:
    - plotting-libraries: "Visualize Section 6 quantitative results"
    - scientific-writing: "Draft manuscript from findings"
    - markdown-to-pdf: "Generate branded PDF with --oligon"
  extends:
    - project-scaffold: "Overlays onto scaffold-generated projects"
  enables:
    - peer-review: "Self-review findings before reporting"
    - reproducible-research: "Environment and data lineage capture"
-->
```

**Specific edges to add per command:**

| Command | feeds-into | extends | enables |
|---------|-----------|---------|---------|
| adopt | project-scaffold, experiment-init | — | — |
| init | experiment-plan | project-scaffold | — |
| plan | statistical-analysis, hypothesis-generation | — | experiment-capture |
| capture | experiment-findings, plotting-libraries, reproducible-research | — | — |
| findings | experiment-report, scientific-writing, scientific-slides, peer-review | — | — |
| report | markdown-to-pdf, scientific-slides, paper-2-web | oligon-brand | — |

### 4.2 Add "Suggested Next Steps" to Output Templates (Medium effort)

Modify Phase 2 (Write and Register) of each command to include a context-aware suggestions section. The suggestions should be:

1. **Lifecycle-aware:** Suggest the next command in the experiment lifecycle (already implicit, make explicit)
2. **Graph-aware:** Suggest relevant skills outside the suite based on what was produced
3. **State-aware:** Adjust suggestions based on whether this is a mid-phase or final-phase artifact

Example modification to `experiment-capture.md` Phase 2:

```markdown
5. **Suggest next steps.** Based on the artifact produced:
   - If plan has remaining phases: suggest next capture
   - If Section 6 has quantitative results: suggest /plotting-libraries
   - If plan phase is complete: suggest /experiment-findings
   - If this was the final phase: suggest /experiment-report
```

### 4.3 Create Suite-Level MOC Entry (Low effort)

Write a concise suite description for inclusion in a capability MOC or as a standalone discovery document. Include:
- What the suite does (one paragraph)
- Entry points (init for new, adopt for existing)
- The lifecycle sequence
- Domain and cross-suite edges
- Gaps / demand signals

### 4.4 Update graph.md with Cross-Suite Edges (Low effort)

Extend the existing graph.md (which already documents internal relationships) with a new section:

```markdown
## Cross-Suite Relationships

| Command | External Skill | Relationship | When |
|---------|---------------|-------------|------|
| capture | plotting-libraries | feeds-into | Section 6 has measurements |
| findings | scientific-writing | feeds-into | Manuscript drafting |
| report | markdown-to-pdf | feeds-into | Branded output needed |
| plan | statistical-analysis | feeds-into | Analysis design |
| adopt | project-scaffold | extends | Scaffold detected |
```

### 4.5 Formalize Demand Signals (Low effort)

Add a "Gaps and Demand Signals" section to graph.md documenting capabilities the suite implies but doesn't provide:

```markdown
## Gaps and Demand Signals

Capabilities referenced or implied by the current commands that
do not yet exist:

| Signal | Evidence | Impact |
|--------|----------|--------|
| Cross-workstream comparison | report integrates one workstream only | Cannot compare results across projects |
| Workstream status dashboard | /next must scan INDEX.md manually | No at-a-glance project state |
| Automated figure generation | capture records measurements but doesn't visualize | Manual step between capture and findings |
| Context recovery for interrupted work | capture handles single sessions | Multi-session work loses continuity |
| Retrospective plan creation | adopt identifies phases but plan requires manual input | Existing projects need faster onboarding |
```

### 4.6 Explore Shared Protocol Extraction (Medium effort)

The INDEX.md update protocol is copied verbatim into every command (the 8-step canonical protocol). This is a maintenance liability — if the protocol changes, all 6 files must be updated identically. Options:

1. **Reference-only:** Keep the canonical definition in graph.md, have commands say "Execute the protocol from [[graph#indexmd-protocol]]" (current approach — works but relies on LLM following the reference)
2. **Shared include:** Extract to a separate file that commands include
3. **Accept duplication:** The protocol is stable and unlikely to change; duplication is acceptable for self-containment

This is an instance of the Ars Contexta tension: atomicity (self-contained commands) vs. DRY (shared logic). The current approach (canonical definition in graph.md, verbatim reference in commands) is a reasonable compromise.

---

## 5. Relationship to the Broader Skill Graph Proposal

The experiment skill is an ideal test case for the knowledge-graph-skill-architecture proposal because:

1. **It already has a graph.md hub** — proving the MOC pattern works for skills
2. **It already uses wiki-links** — the linking infrastructure exists
3. **It has clear cross-suite edges** — the transitions to plotting, writing, and presentation skills are obvious and frequent
4. **It's a closed lifecycle** — the internal DAG is well-defined, making it easy to verify that cross-suite edges add value without disrupting internal flow
5. **It's science-domain-specific** — the domain context makes edge relationships concrete rather than abstract

Implementing the next steps outlined above would serve as a proof-of-concept for the broader skill graph architecture, demonstrating whether graph metadata and capability MOCs meaningfully improve orchestration and discoverability before scaling to the full 45+ skill ecosystem.
