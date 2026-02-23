<!-- template-version: 1.0 -->
<!-- Lifecycle: [INIT] -> plan -> capture -> findings -> report -->
<!-- see [[graph]] for canonical definitions -->
<!-- graph-edges:
  domain: research-tools
  suite: experiment-lifecycle
  feeds-into:
    - experiment-plan: "Define objectives and phases for new project"
  extends:
    - project-scaffold: "Overlays onto scaffold-generated projects via Tier A detection"
-->
You are a computational science project scaffolding tool. Your task: create a
standardized directory structure, documentation index, and project configuration
for a new experiment-tracked project.

## Input

`$ARGUMENTS` contains 0-1 positional arguments and optional flags:

```
$ARGUMENTS = [project_name] [--description "text"] [--domain "tags"] [--minimal] [--overwrite]
```

- `project_name` — name for the project (used in docs and CLAUDE.md). If omitted, ask interactively.
- `--description` — one-line project description. If omitted, ask interactively.
- `--domain` — comma-separated domain tags (e.g., "structural-biology,computational"). If omitted, skip.
- `--minimal` — create only the directory tree and INDEX.md, skip README and CLAUDE.md generation.
- `--overwrite` — if an experiment structure already exists, overwrite INDEX.md and project docs instead of augmenting.

### Workstream Naming Validation

Apply the naming convention from [[graph#naming-convention]]. If `project_name` is provided, validate it. If invalid:
1. Normalize it: lowercase, replace hyphens and spaces with underscores, strip invalid characters
2. Present the normalized version to the user for confirmation
3. If the user rejects, ask for a new name

---

## Phase 0: Context Discovery

1. **Parse arguments.** Extract `project_name` and flags from `$ARGUMENTS`. If empty or help request, print usage and stop:
   ```
   Usage: /experiment-init <project_name> [--description "text"] [--domain "tags"] [--minimal]
   Example: /experiment-init boltz2_aptamer_analysis --description "Structural comparison of aptamer variants" --domain "structural-biology,computational"
   ```

2. **Validate project name.** Apply naming validation (see above). Normalize if needed.

3. **Check existing structure.** Perform three-tier detection in order:

   **Tier A — Scaffold detection.** Check for `project-scaffold` fingerprints. A project is scaffold-generated if **any** of these are true:
   - `.claude/CLAUDE.md` or root `CLAUDE.md` contains a `- **Type**:` line
   - `.gitkeep` files exist in data directories (`03-data/raw/.gitkeep`, `03-data/reference/.gitkeep`)
   - Subdirectory `README.md` files exist in `01-documentation/plans/`, `03-data/raw/`, etc.

   If scaffold detected, set `scaffold_detected = true`. Record which CLAUDE.md file matched (`.claude/CLAUDE.md` or root `CLAUDE.md`) as `scaffold_claude_path` for use in Phase 1c. Try to identify the profile by reading the `- **Type**:` line (e.g., "bioinformatics", "computational", "general"). If `--overwrite` was passed, print a note that it is ignored for scaffold projects (overlay is always non-destructive) and continue. Print:
   ```
   Detected project-scaffold structure (profile: {profile_or_unknown})
   Existing directories will be preserved. Adding experiment lifecycle overlay:
     - 01-documentation/INDEX.md (documentation registry)
     - 06-reports/findings/       (if missing)
     - CLAUDE.md updates          (experiment lifecycle sections appended)
   ```
   Then proceed directly to Phase 1 (no skip/augment/overwrite prompt — scaffold overlay is always safe).

   **Tier B — Existing experiment structure.** If not scaffold, check for `INDEX.md` in `01-documentation/` or at the project root. If found, warn the user that an experiment project structure already exists and ask whether to:
   a. Skip (abort)
   b. Augment (add missing directories only)
   c. Overwrite (replace INDEX.md and project docs)

   **Tier C — Bare directory overlap.** If not scaffold and no INDEX.md, but `01-documentation/` exists, treat as a manual or legacy setup. Warn the user and offer the same skip/augment/overwrite choice as Tier B.

4. **Gather missing info.** If `project_name` or `--description` were not provided, ask the user interactively.

---

## Phase 1: Create All Files

Copy these content blocks verbatim. Only substitute variables marked with `{curly_braces}`.

### 1a. Directory Tree

Create the following directories relative to the current working directory. Use `mkdir -p` equivalent — never fail on existing directories.

```
01-documentation/
01-documentation/plans/
01-documentation/process/
01-documentation/reference/
01-documentation/templates/
01-documentation/notes/
02-scripts/
03-data/
03-data/raw/
03-data/reference/
04-analysis/
05-results/
06-reports/
06-reports/findings/
07-publication/
config/
scratch/
```

**When `scaffold_detected` is true:** Track which directories already existed vs which were newly created. For each directory in the list above, note whether it was pre-existing or created. This tracking is used in the Phase 2 report. Typically the scaffold will have created most directories except `06-reports/findings/`, `01-documentation/templates/`, `01-documentation/notes/`, `config/`, and `scratch/`.

### 1a-ii. Environment Stub

If `config/environment.yml` does not already exist, create it with:

```yaml
# Computational environment specification
# Uncomment and populate the sections relevant to your project
name: {project_name}

# channels:
#   - conda-forge
#   - bioconda
#   - defaults

# dependencies:
#   - python>=3.10
#   - numpy
#   - pandas
#   - pip:
#     - some-pip-package
```

If the file already exists, skip — do not overwrite.

### 1a-iii. Raw Data Provenance README

If `03-data/raw/README.md` does not already exist, create it with:

````markdown
# Raw Data Provenance

> Files in this directory are **immutable** — never modify in place.

## Data Registry

| File | Source | Download Date | Version / Accession | Checksum (SHA-256) |
|------|--------|--------------|--------------------|--------------------|
|      |        |              |                    |                    |

## Notes

- Record every raw data file in the table above before use
- Include full URLs, database accession numbers, or DOIs as source identifiers
- Checksums ensure integrity: `shasum -a 256 <file>`
````

If the file already exists, skip — do not overwrite.

### 1b. INDEX.md

Write `01-documentation/INDEX.md` with this structure:

````markdown
# {Project Name} — Documentation Index

**Project:** {project_name}
**Created:** {YYYY-MM-DD}
**Last Updated:** {YYYY-MM-DD}

---

## Plans

| Date | Workstream | File | Status |
|------|-----------|------|--------|
| | | | |

## Process Artifacts

| Date | Workstream | Phase | File | Status |
|------|-----------|-------|------|--------|
| | | | | |

## Findings

| Date | Workstream | Scope | File | Status |
|------|-----------|-------|------|--------|
| | | | | |

## Reports

| Date | Workstream | File | Format |
|------|-----------|------|--------|
| | | | |

---

## Directory Structure

```
01-documentation/    Plans, process artifacts, reference docs
  plans/             Structured plan documents
  process/           Process artifacts (session records)
  reference/         External protocols, standards
  templates/         Document templates
  notes/             Informal working notes
02-scripts/          Analysis scripts (numbered)
03-data/             Input data
  raw/               Immutable raw data
  reference/         Reference datasets
04-analysis/         Intermediate working outputs (gitignored)
05-results/          Final curated results
06-reports/          Reports and findings
  findings/          Per-phase/tier findings
07-publication/      Manuscripts, final PDFs, presentation figures
config/              Project configuration
scratch/             Exploratory work, temporary files (gitignored)
```
````

### 1c. Project CLAUDE.md (unless --minimal)

**When `scaffold_detected` is true and an existing CLAUDE.md is found:**

Locate the scaffold's CLAUDE.md using `scaffold_claude_path` from Phase 0 (either `.claude/CLAUDE.md` or root `CLAUDE.md`). Do **not** overwrite it. Check whether it already contains an `## Experiment Lifecycle` section. If it does, skip entirely. If it does not, **append** the following section to the end of that file:

````markdown

## Experiment Lifecycle

This project uses the `/experiment` documentation lifecycle:
- Plans: `01-documentation/plans/`
- Process artifacts: `01-documentation/process/`
- Findings: `06-reports/findings/`
- Reports: `06-reports/`
- Index: `01-documentation/INDEX.md`

### Conventions

- Process artifacts captured at phase/tier boundaries using `/experiment-capture`
- All scripts in `02-scripts/` with numbered prefixes (e.g., `01_prepare_data.py`)
- Raw data in `03-data/raw/` is immutable — never modify in place
- Working outputs in `04-analysis/` are gitignored
- Curated results promoted to `05-results/`
- Use relative paths in all scripts — never absolute paths

### Naming

Artifacts follow: `{workstream}_{type}_{qualifier}.md`
- Plans: `{workstream}_plan.md`
- Process: `{workstream}_process_{phase}.md`
- Findings: `{workstream}_findings_{scope}.md`
- Reports: `{workstream}_report.md`
````

**When `scaffold_detected` is false (or no existing CLAUDE.md):**

Write `.claude/CLAUDE.md` (creating `.claude/` directory if needed) with:

````markdown
# {Project Name}

{description}

## Project Structure

This project uses the `/experiment` documentation lifecycle:
- Plans: `01-documentation/plans/`
- Process artifacts: `01-documentation/process/`
- Findings: `06-reports/findings/`
- Reports: `06-reports/`
- Index: `01-documentation/INDEX.md`

## Conventions

- Process artifacts captured at phase/tier boundaries using `/experiment-capture`
- All scripts in `02-scripts/` with numbered prefixes (e.g., `01_prepare_data.py`)
- Raw data in `03-data/raw/` is immutable — never modify in place
- Working outputs in `04-analysis/` are gitignored
- Curated results promoted to `05-results/`
- Use relative paths in all scripts — never absolute paths

## Naming

Artifacts follow: `{workstream}_{type}_{qualifier}.md`
- Plans: `{workstream}_plan.md`
- Process: `{workstream}_process_{phase}.md`
- Findings: `{workstream}_findings_{scope}.md`
- Reports: `{workstream}_report.md`
````

### 1d. .gitignore

Check if `.gitignore` exists. If so, ensure it contains entries for:
```
04-analysis/
scratch/
.DS_Store
```

If `.gitignore` does not exist, create one with:
```
# Intermediate analysis outputs (large, reproducible)
04-analysis/

# Exploratory / scratch work
scratch/

# OS files
.DS_Store

# Python
__pycache__/
*.py[oc]
.venv/

# IDE
.idea/
.vscode/
```

Only add missing entries — never duplicate existing lines.

### 1e. README.md (unless --minimal)

If no `README.md` exists, create one:

````markdown
# {Project Name}

{description}

## Quick Start

```bash
# View documentation index
cat 01-documentation/INDEX.md

# Create a plan
/experiment-plan {example_workstream}

# Capture a process artifact
/experiment-capture {example_workstream} phase1

# Generate findings
/experiment-findings {example_workstream} phase1

# Compile report
/experiment-report {example_workstream}
```

## Directory Structure

See `01-documentation/INDEX.md` for the full directory map and documentation registry.

## Documentation Lifecycle

1. **Plan** — Define objectives, phases, and success criteria
2. **Execute** — Do the work (scripts, analysis, visualization)
3. **Capture** — Record what was done as a process artifact
4. **Findings** — Synthesize results into interpretive findings
5. **Report** — Compile comprehensive report from findings
````

If `README.md` exists, do not overwrite it. Print a note that the user may want to update it.

---

## Phase 2: Report

**When `scaffold_detected` is true:** Print a summary that distinguishes created vs pre-existing. The CLAUDE.md line should reflect what actually happened in Phase 1c:

```
Initialized experiment lifecycle on existing project-scaffold project: {project_name}
Profile detected: {profile_or_unknown}

Added:
  01-documentation/INDEX.md   (documentation registry)
  {list only directories that were actually created, not pre-existing}
  {scaffold_claude_path}       {one of the following:}
                                 (appended experiment lifecycle section)
                                 (already contains experiment lifecycle — no changes)
                                 (created with experiment lifecycle section)

Pre-existing (preserved):
  {list directories that already existed, grouped logically}

Next steps:
  /experiment-plan <workstream>  — define objectives, phases, and success criteria
```

**When `scaffold_detected` is false:** Print the standard summary:

```
Initialized experiment project: {project_name}

Created:
  01-documentation/         (with plans/, process/, reference/, templates/, notes/)
  01-documentation/INDEX.md (documentation registry)
  02-scripts/
  03-data/                  (with raw/, reference/)
  04-analysis/              (gitignored)
  05-results/
  06-reports/               (with findings/)
  07-publication/
  config/
  scratch/                  (gitignored)
  config/environment.yml    (environment stub)
  03-data/raw/README.md     (data provenance)
  .claude/CLAUDE.md         (project configuration)
  README.md

Next steps:
  /experiment-plan <workstream>  — define objectives, phases, and success criteria
```

---

## Do Not

- Do not create any files not listed in Phase 1. No sample scripts, no placeholder data files.
- Do not modify files outside the current working directory.
- Do not run `git init` — the user manages their own git setup.
- Do not install any packages or dependencies.
- Do not add content beyond the templates above. Do not embellish the INDEX.md with extra sections or the README with extra badges.

---

## Handling Edge Cases

- If run inside a `project-scaffold`-generated project (scaffold fingerprints detected): overlay experiment lifecycle without overwriting. Preserve existing directories, append to CLAUDE.md, create only INDEX.md and missing directories. No user prompt needed — scaffold overlay is always safe.
- If run inside an existing experiment project (INDEX.md exists, no scaffold): only create missing directories, do not overwrite INDEX.md or CLAUDE.md unless `--overwrite` confirmed.
- If the current directory is not empty but has no experiment structure: create the structure alongside existing files. Warn the user about any naming conflicts.
- If `$ARGUMENTS` is empty: ask for the project name interactively, then proceed with defaults.

---

$ARGUMENTS
