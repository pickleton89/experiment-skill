---
title: "RNA Folding Plan"
type: plan
workstream: rna_folding
project: rna_structure_prediction
date: 2026-02-15
status: active
---

# RNA Folding Plan

## 1. Objective

This workstream aims to evaluate the accuracy of computational RNA secondary structure prediction methods against experimentally determined structures. We will benchmark three prediction tools (RNAfold, LinearFold, and EternaFold) on a curated set of 50 non-coding RNA sequences with known crystal or cryo-EM structures.

The expected outcome is a ranked comparison of prediction accuracy across RNA families, with quantified sensitivity and positive predictive value (PPV) for base pair prediction. This will inform tool selection for downstream tertiary structure modeling in later workstreams.

"Done" means: accuracy metrics computed for all 50 sequences across all 3 tools, with statistical significance testing and a recommendation for tool selection.

## 2. Background

- **Available data:** 50 RNA sequences from the RNA STRAND database (v2.0), filtered to include only entries with crystallographic or cryo-EM validation at resolution < 3.5 A. Sequences range from 60-450 nucleotides.
- **Tools:**
  - RNAfold 2.6.4 (ViennaRNA package) — minimum free energy prediction
  - LinearFold 1.0 — linear-time approximate MFE prediction
  - EternaFold 1.2 — deep-learning-augmented thermodynamic model
- **Reference:** Mathews et al. (2004) benchmark methodology for secondary structure comparison. We use their definition of sensitivity (TP / (TP + FN)) and PPV (TP / (TP + FP)).
- **Constraints:** Maximum compute budget of 48 CPU-hours. No GPU required for secondary structure prediction.

## 3. Phases

### Phase 1: Data Preparation

**Scope:** Download, validate, and format the 50 RNA sequences. Extract reference secondary structures in dot-bracket notation. This phase does not include any prediction runs.

**Expected Outputs:**
- `03-data/raw/rna_strand_50.fasta` — curated FASTA file
- `03-data/reference/reference_structures.csv` — sequence ID, length, RNA family, dot-bracket structure
- `02-scripts/01_prepare_data.py` — download and formatting script

**Methods and Tools:**
- Python 3.12 with Biopython 1.84 for sequence handling
- RNA STRAND REST API for structure retrieval

**Checkpoint Trigger:** All 50 sequences validated (no ambiguous bases, dot-bracket length matches sequence length).

**Success Criteria:**

| Criterion | Metric | Target | Priority |
|-----------|--------|--------|----------|
| Sequence count | Number of valid sequences | 50 | must-have |
| Format validation | Sequences with matching dot-bracket length | 100% | must-have |
| Family coverage | Distinct RNA families represented | >= 5 | nice-to-have |

---

### Phase 2: Structure Prediction

**Scope:** Run all three prediction tools on the 50 sequences. Collect predicted secondary structures and runtime metrics. This phase does not include accuracy analysis.

**Expected Outputs:**
- `05-results/predictions_rnafold.csv` — predictions with runtime per sequence
- `05-results/predictions_linearfold.csv`
- `05-results/predictions_eternafold.csv`
- `02-scripts/02_run_predictions.sh` — batch prediction runner

**Methods and Tools:**
- RNAfold 2.6.4: default parameters, `--noLP` flag for no lonely pairs
- LinearFold 1.0: beam size 100 (default)
- EternaFold 1.2: CONTRAfold-style parameters

**Checkpoint Trigger:** All 150 predictions (50 sequences x 3 tools) complete with no errors.

**Success Criteria:**

| Criterion | Metric | Target | Priority |
|-----------|--------|--------|----------|
| Prediction coverage | Sequences with predictions from all 3 tools | 50 | must-have |
| Runtime budget | Total CPU time | < 48 hours | must-have |
| Output format | All predictions in valid dot-bracket notation | 100% | must-have |

---

### Phase 3: Accuracy Validation

**Scope:** Compare predicted structures to reference structures. Compute per-sequence and aggregate accuracy metrics. Perform statistical testing and generate comparison figures.

**Expected Outputs:**
- `05-results/accuracy_comparison.csv` — per-sequence metrics for all tools
- `05-results/figures/accuracy_boxplot.png` — tool comparison boxplot
- `05-results/figures/family_heatmap.png` — accuracy by RNA family
- `02-scripts/03_evaluate_accuracy.py` — comparison and visualization script

**Methods and Tools:**
- Python 3.12 with scikit-learn for metrics, matplotlib/seaborn for visualization
- Wilcoxon signed-rank test for pairwise tool comparisons (paired by sequence)
- Bonferroni correction for multiple comparisons (3 pairwise tests)

**Checkpoint Trigger:** All accuracy metrics computed and figures generated.

**Success Criteria:**

| Criterion | Metric | Target | Priority |
|-----------|--------|--------|----------|
| Metric computation | Sequences with sensitivity and PPV computed | 50 | must-have |
| Statistical testing | Pairwise comparisons with p-values | 3 tests | must-have |
| Visualization | Comparison figures generated | 2 figures | must-have |
| Tool recommendation | Clear ranking with effect sizes | documented | must-have |

## 4. Execution Order

```
Phase 1 (data prep) -> Phase 2 (prediction) -> Phase 3 (validation)
```

Strictly sequential. Phase 2 requires Phase 1 outputs. Phase 3 requires Phase 2 outputs.

## 5. Overall Success Criteria

| Criterion | Metric | Target | Assessment Method |
|-----------|--------|--------|------------------|
| Complete benchmark | All 150 predictions evaluated | 150/150 | Count rows in accuracy_comparison.csv |
| Statistical rigor | Pairwise tests with corrections | 3 tests, Bonferroni-corrected | Review p-values in findings |
| Actionable recommendation | Tool ranking with effect sizes | Documented in report | Review conclusions section |
| Reproducibility | All scripts runnable from raw data | End-to-end pipeline | Re-run from 03-data/raw/ |

## 6. Risk and Contingencies

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| RNA STRAND API downtime | Medium | Delays Phase 1 | Cache downloaded data; use local mirror if available |
| EternaFold installation issues | Medium | Blocks Phase 2 | Fall back to 2-tool comparison; document gap |
| Sequences too long for RNAfold | Low | Incomplete predictions | Set timeout per sequence; exclude outliers > 400 nt |
| Insufficient family diversity | Low | Weak generalization claims | Relax inclusion criteria to add more families |
