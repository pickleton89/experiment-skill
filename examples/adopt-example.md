---
title: "Protein Docking Adoption Report"
type: adoption
workstream: protein_docking
project: docking_benchmark
date: 2026-02-18
status: active
source_directory: ./docking-benchmark
---

# Protein Docking Adoption Report

## 1. Project Audit Summary

This project benchmarks protein-protein docking tools (HADDOCK, ClusPro, AlphaFold-Multimer) against a curated set of 25 complexes from the Docking Benchmark 5.5. The work appears to have progressed through initial data preparation and partial docking runs, but lacks structured documentation and organized results. Scripts exist for running predictions and computing DockQ scores, though several appear to be one-off variations rather than a clean pipeline.

The project is a strong candidate for experiment lifecycle adoption: the core scientific work is underway, data and scripts exist, but there is no formal plan, no process documentation, and results are scattered across multiple directories with inconsistent naming.

**Project at a Glance:**

| Attribute | Value |
|-----------|-------|
| Source directory | `./docking-benchmark` |
| Total files | 87 |
| Active period | 2026-01-10 — 2026-02-15 |
| Primary language(s) | Python (34 files), Shell (8 files) |
| Existing documentation | minimal (README only) |
| Experiment structure | none |
| Git repository | yes (142 commits) |

## 2. Artifact Inventory

### Data Files

| File | Current Location | Format | Size | Proposed Location | Action |
|------|-----------------|--------|------|------------------|--------|
| benchmark_complexes.csv | `data/benchmark_complexes.csv` | CSV | 12 KB | `03-data/reference/benchmark_complexes.csv` | move |
| receptor PDB files (25) | `data/pdbs/receptors/` | PDB | 45 MB | `03-data/raw/receptors/` | move |
| ligand PDB files (25) | `data/pdbs/ligands/` | PDB | 38 MB | `03-data/raw/ligands/` | move |
| native complex PDBs (25) | `data/pdbs/native/` | PDB | 82 MB | `03-data/reference/native/` | move |

### Scripts

| File | Current Location | Language | Description | Proposed Location | Action |
|------|-----------------|----------|-------------|------------------|--------|
| prepare_inputs.py | `scripts/prepare_inputs.py` | Python | Formats PDB inputs for each tool | `02-scripts/01_prepare_inputs.py` | move + rename |
| run_haddock.sh | `scripts/run_haddock.sh` | Shell | Submits HADDOCK jobs | `02-scripts/02_run_haddock.sh` | move + rename |
| run_cluspro.py | `scripts/run_cluspro.py` | Python | ClusPro API submission | `02-scripts/03_run_cluspro.py` | move + rename |
| run_af_multimer.py | `scripts/run_af_multimer.py` | Python | AlphaFold-Multimer runner | `02-scripts/04_run_af_multimer.py` | move + rename |
| compute_dockq.py | `scripts/compute_dockq.py` | Python | DockQ scoring | `02-scripts/05_compute_dockq.py` | move + rename |
| plot_results.py | `scripts/plot_results.py` | Python | Visualization | `02-scripts/06_plot_results.py` | move + rename |
| run_haddock_v2.sh | `scripts/run_haddock_v2.sh` | Shell | Modified HADDOCK script (unclear changes) | `02-scripts/` | archive |
| quick_test.py | `scripts/quick_test.py` | Python | One-off test script | `04-analysis/` | archive |

### Results

| File | Current Location | Format | Description | Proposed Location | Action |
|------|-----------------|--------|-------------|------------------|--------|
| haddock_scores.csv | `output/haddock_scores.csv` | CSV | HADDOCK DockQ scores for 25 complexes | `05-results/haddock_scores.csv` | move |
| cluspro_scores.csv | `output/cluspro_scores.csv` | CSV | ClusPro DockQ scores for 20 complexes | `05-results/cluspro_scores.csv` | move |
| comparison_boxplot.png | `output/figures/comparison_boxplot.png` | PNG | Tool comparison (partial — missing AF-Multimer) | `05-results/figures/comparison_boxplot.png` | move |
| dockq_heatmap.png | `output/figures/dockq_heatmap.png` | PNG | Heatmap by complex difficulty | `05-results/figures/dockq_heatmap.png` | move |

### Documentation

| File | Current Location | Content | Proposed Location | Action |
|------|-----------------|---------|------------------|--------|
| README.md | `README.md` | Brief project description, no methods | `README.md` | keep |
| notes.txt | `notes.txt` | Informal run notes with dates | `01-documentation/notes/run_notes.md` | move + convert |

## 3. Workstream Decomposition

### Workstream: protein_docking

**Scope:** Benchmark three protein-protein docking tools against Docking Benchmark 5.5 complexes using DockQ as the primary quality metric.

**Evidence:** All scripts share the same input data (25 complexes from DB5.5), produce comparable outputs (DockQ scores per complex per tool), and follow a sequential pipeline pattern (prepare → predict → score → compare). The project has a single scientific question: which docking tool performs best across difficulty categories.

**Included Artifacts:**
- All 25 receptor/ligand/native PDB sets
- All 6 pipeline scripts (prepare, 3 runners, score, plot)
- All output score CSVs and figures
- benchmark_complexes.csv reference file

**Inferred Phases:**

| Phase | Label | Evidence | Status |
|-------|-------|----------|--------|
| 1 | Data Preparation | `prepare_inputs.py` exists, PDB files organized by type | complete |
| 2 | Docking Predictions | HADDOCK complete (25/25), ClusPro partial (20/25), AF-Multimer not started | in-progress |
| 3 | Accuracy Evaluation | `compute_dockq.py` exists, scores computed for HADDOCK only | not started |
| 4 | Comparative Analysis | `plot_results.py` exists, partial figures generated | not started |

## 4. Documentation Gap Analysis

### Current Documentation State

The project has a README with a one-paragraph description and install instructions. The `notes.txt` file contains dated entries about individual runs but lacks structure. No formal methodology documentation exists. Script docstrings are minimal (1-2 lines each). No data provenance documentation for the benchmark complexes.

### Documentation Gaps

| Gap | Impact | Priority | Recommended Action |
|-----|--------|----------|-------------------|
| No experiment plan | Cannot assess progress against objectives | P1-critical | Create retroactive plan with `/experiment-plan protein_docking` |
| No process artifacts | Completed work is undocumented and unreproducible | P1-critical | Backfill Phase 1 capture with `/experiment-capture protein_docking phase1` |
| Undocumented HADDOCK parameters | Cannot reproduce predictions | P2-high | Document in process artifact: HADDOCK version, restraints, sampling parameters |
| No data provenance | Unclear which DB5.5 subset was selected and why | P2-high | Document selection criteria, download date, any filtering applied |
| Missing ClusPro failure analysis | 5 complexes failed without explanation | P2-high | Investigate and document in process artifact or issue log |
| No success criteria defined | Cannot evaluate whether results are meaningful | P3-medium | Define in plan: target DockQ thresholds, statistical tests |
| Script versioning unclear | `run_haddock_v2.sh` exists without changelog | P3-medium | Consolidate scripts; document changes in process artifact |
| No .gitignore | Large PDB files may be tracked unnecessarily | P4-low | Add .gitignore for intermediate outputs |

### Decision Archaeology

#### Decision: Switched from ZDOCK to ClusPro
- **Evidence:** Commits `a3f21bc` ("remove zdock scripts"), `b7e9c01` ("add cluspro runner"), dated 2026-01-18
- **Inferred context:** ZDOCK was initially planned as the second docking tool but was replaced by ClusPro early in the project
- **Impact:** Changed the benchmark composition; any ZDOCK results from early runs are no longer relevant
- **Documentation need:** Capture rationale in plan or process artifact — was it a licensing issue, performance concern, or API availability?

#### Decision: Reduced benchmark from 50 to 25 complexes
- **Evidence:** Commit `d4a8f3e` ("filter to 25 complexes, remove duplicates"), `benchmark_complexes.csv` has 25 rows
- **Inferred context:** Original data download likely included more complexes; filtering criteria are not documented
- **Impact:** Halved the statistical power of the benchmark; selection criteria may introduce bias
- **Documentation need:** Record filtering criteria and rationale in data provenance documentation

#### Decision: Modified HADDOCK parameters mid-run
- **Evidence:** `run_haddock_v2.sh` differs from `run_haddock.sh` in restraint distance cutoff (8A vs 12A); 3 commits between the two versions
- **Inferred context:** Initial HADDOCK runs may have used suboptimal parameters; results may be a mix of v1 and v2 parameters
- **Impact:** Score consistency is uncertain — need to verify which parameter set produced the final scores
- **Documentation need:** Critical — document which parameters produced which results; may need to re-run

## 5. Adoption Roadmap

### P1: Foundation (do first)

- [ ] Run `/experiment-init protein_docking --description "Benchmark protein-protein docking tools against DB5.5"` to create project structure
- [ ] Move raw PDB files to `03-data/raw/` (receptors, ligands)
- [ ] Move native complexes to `03-data/reference/native/`
- [ ] Move `benchmark_complexes.csv` to `03-data/reference/`
- [ ] Move and rename scripts to `02-scripts/` with numbered prefixes
- [ ] Add `.gitignore` for `04-analysis/` and large intermediate files
- [ ] Archive `run_haddock_v2.sh` and `quick_test.py` to `04-analysis/`

### P2: Retroactive Documentation (backfill)

- [ ] Run `/experiment-plan protein_docking` to create a retroactive plan covering all 4 phases
- [ ] Run `/experiment-capture protein_docking phase1` to document data preparation (already complete)
- [ ] Document HADDOCK run parameters, version, and restraint settings in Phase 2 capture
- [ ] Convert `notes.txt` to structured notes in `01-documentation/notes/`
- [ ] Document data provenance: DB5.5 version, download date, selection criteria

### P3: Gap Closure (address missing pieces)

- [ ] Investigate and document ClusPro failures (5/25 complexes)
- [ ] Clarify which HADDOCK parameter set (v1 vs v2) produced final scores
- [ ] Resolve `run_haddock.sh` vs `run_haddock_v2.sh` — keep one, archive the other
- [ ] Add data lineage documentation linking raw PDBs → tool inputs → scores

### P4: Going Forward (ongoing practices)

- [ ] Complete ClusPro predictions for remaining 5 complexes
- [ ] Run AlphaFold-Multimer predictions (Phase 2 completion)
- [ ] Capture each phase completion with `/experiment-capture`
- [ ] Generate findings with `/experiment-findings` after Phase 3 (scoring)
- [ ] Compile final report with `/experiment-report` after Phase 4 (comparison)

## 6. File Migration Plan

**Legend:** `move` = relocate to new path, `rename` = change filename only, `keep` = leave in place, `archive` = move to `04-analysis/`

| Current Path | Proposed Path | Action | Notes |
|-------------|--------------|--------|-------|
| `data/benchmark_complexes.csv` | `03-data/reference/benchmark_complexes.csv` | move | Reference dataset |
| `data/pdbs/receptors/` | `03-data/raw/receptors/` | move | 25 PDB files |
| `data/pdbs/ligands/` | `03-data/raw/ligands/` | move | 25 PDB files |
| `data/pdbs/native/` | `03-data/reference/native/` | move | 25 native complexes |
| `scripts/prepare_inputs.py` | `02-scripts/01_prepare_inputs.py` | move + rename | Add numbered prefix |
| `scripts/run_haddock.sh` | `02-scripts/02_run_haddock.sh` | move + rename | Primary HADDOCK runner |
| `scripts/run_cluspro.py` | `02-scripts/03_run_cluspro.py` | move + rename | ClusPro API script |
| `scripts/run_af_multimer.py` | `02-scripts/04_run_af_multimer.py` | move + rename | AF-Multimer runner |
| `scripts/compute_dockq.py` | `02-scripts/05_compute_dockq.py` | move + rename | DockQ scoring |
| `scripts/plot_results.py` | `02-scripts/06_plot_results.py` | move + rename | Visualization |
| `scripts/run_haddock_v2.sh` | `04-analysis/run_haddock_v2.sh` | archive | Resolve with v1 first |
| `scripts/quick_test.py` | `04-analysis/quick_test.py` | archive | One-off test |
| `output/haddock_scores.csv` | `05-results/haddock_scores.csv` | move | Final HADDOCK results |
| `output/cluspro_scores.csv` | `05-results/cluspro_scores.csv` | move | Partial ClusPro results |
| `output/figures/comparison_boxplot.png` | `05-results/figures/comparison_boxplot.png` | move | Partial comparison |
| `output/figures/dockq_heatmap.png` | `05-results/figures/dockq_heatmap.png` | move | By difficulty category |
| `notes.txt` | `01-documentation/notes/run_notes.md` | move + convert | Convert to markdown |
| `README.md` | `README.md` | keep | Update after init |

**Migration notes:**
- The `output/` directory will be empty after migration and can be removed.
- The `data/` and `scripts/` directories will be empty after migration and can be removed or kept as symlinks during transition.
- Verify that `haddock_scores.csv` was produced with consistent parameters (v1 or v2) before promoting to `05-results/`.
- The partial `comparison_boxplot.png` should be regenerated after all predictions are complete — consider archiving it to `04-analysis/` instead.
