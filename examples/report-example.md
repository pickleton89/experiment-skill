---
title: "RNA Secondary Structure Prediction Benchmark Report"
type: report
workstream: rna_folding
project: rna_structure_prediction
date: 2026-02-20
template: scientific
source_documents:
  plans:
    - rna_folding_plan.md
  process_artifacts:
    - rna_folding_process_phase1.md
    - rna_folding_process_phase2.md
    - rna_folding_process_phase3.md
  findings:
    - rna_folding_findings_phase1.md
    - rna_folding_findings_phase2.md
    - rna_folding_findings_phase3.md
---

# RNA Secondary Structure Prediction Benchmark Report

## Executive Summary

This report presents results from a systematic benchmark of three RNA secondary structure prediction tools — RNAfold 2.6.4, LinearFold 1.0, and EternaFold 1.2 — evaluated against 50 experimentally determined structures from the RNA STRAND database.

EternaFold achieved the highest overall sensitivity (0.82) and PPV (0.79), outperforming RNAfold (sensitivity 0.76, PPV 0.74) and LinearFold (sensitivity 0.74, PPV 0.72) with statistical significance (Wilcoxon signed-rank test, Bonferroni-corrected p < 0.01 for both comparisons). The advantage was most pronounced for riboswitches and long rRNA sequences (> 200 nt), where EternaFold's learned parameters captured non-canonical interactions missed by thermodynamic-only models.

LinearFold's runtime was 12x faster than RNAfold on sequences > 300 nt, with only a modest accuracy trade-off (2 percentage points in sensitivity). For high-throughput applications where speed matters, LinearFold remains competitive.

All 50 sequences were successfully processed by all three tools within the 48 CPU-hour budget (actual: 31.2 CPU-hours). The benchmark dataset, scripts, and results are fully reproducible from the raw data in `03-data/raw/`.

**Principal finding:** EternaFold is the recommended tool for RNA secondary structure prediction in this project, offering the best accuracy across RNA families with acceptable runtime.

## 1. Introduction

### 1.1 Background and Motivation

Accurate prediction of RNA secondary structure is a prerequisite for tertiary structure modeling and functional annotation of non-coding RNAs. Multiple prediction tools exist, each using different algorithmic approaches — minimum free energy (MFE), linear-time approximation, and machine-learning-augmented thermodynamics. Selecting the most appropriate tool requires systematic benchmarking against experimentally validated structures.

### 1.2 Objectives

This workstream aimed to:
1. Curate a benchmark dataset of 50 RNA sequences with experimentally determined secondary structures
2. Run three prediction tools (RNAfold, LinearFold, EternaFold) on all sequences
3. Compare prediction accuracy using sensitivity and PPV metrics
4. Produce a statistically rigorous tool recommendation for downstream tertiary modeling

### 1.3 Approach Overview

The work proceeded in three phases: data preparation (Phase 1), structure prediction (Phase 2), and accuracy validation (Phase 3). Each phase produced a process artifact and findings document, which this report integrates.

## 2. Methods

### 2.1 Data Sources

Fifty RNA sequences were curated from the RNA STRAND database (v2.0), filtered to include only entries with experimental validation at resolution <= 3.5 angstroms, sequence lengths between 60 and 450 nucleotides, and no ambiguous bases. The dataset spans 6 RNA families: tRNA (15), rRNA (12), ribozyme (9), riboswitch (8), SRP RNA (4), and tmRNA (2).

### 2.2 Computational Methods

| Tool | Version | Algorithm | Key Parameters |
|------|---------|-----------|---------------|
| RNAfold | 2.6.4 | MFE (Zuker algorithm) | `--noLP` (no lonely pairs) |
| LinearFold | 1.0 | Linear-time approximate MFE | Beam size 100 |
| EternaFold | 1.2 | Learned thermodynamic parameters | CONTRAfold-style parameters |

Accuracy metrics followed the Mathews et al. (2004) definitions:
- **Sensitivity:** TP / (TP + FN) — fraction of true base pairs correctly predicted
- **PPV:** TP / (TP + FP) — fraction of predicted base pairs that are correct

Statistical comparisons used the Wilcoxon signed-rank test (paired by sequence) with Bonferroni correction for 3 pairwise comparisons.

### 2.3 Analysis Pipeline

```
rna_strand_50.fasta -> [02_run_predictions.sh] -> predictions_{tool}.csv (x3)
predictions_{tool}.csv + reference_structures.csv -> [03_evaluate_accuracy.py]
  -> accuracy_comparison.csv -> accuracy_boxplot.png, family_heatmap.png
```

## 3. Results

### 3.1 Phase 1: Data Preparation

The curated dataset comprises 50 sequences with mean length 187.4 nt (median 156 nt, range 60-423 nt). All sequences passed validation: dot-bracket notation matches sequence length, parentheses are balanced, and no ambiguous bases remain. Six RNA families are represented, with tRNA (30%) and rRNA (24%) being the most prevalent.

### 3.2 Phase 2: Structure Prediction

All 150 predictions (50 sequences x 3 tools) completed successfully. Total runtime: 31.2 CPU-hours (budget: 48).

| Tool | Mean runtime/sequence | Max runtime | Failed predictions |
|------|--------------------|-------------|-------------------|
| RNAfold | 37.4 s | 412 s (423 nt) | 0 |
| LinearFold | 3.1 s | 34 s (423 nt) | 0 |
| EternaFold | 28.6 s | 298 s (423 nt) | 0 |

LinearFold was 12x faster than RNAfold on the longest sequence and showed linear scaling with sequence length, compared to the cubic scaling of RNAfold.

### 3.3 Phase 3: Accuracy Validation

| Tool | Sensitivity (mean +/- SD) | PPV (mean +/- SD) | F1 Score |
|------|--------------------------|-------------------|----------|
| EternaFold | 0.82 +/- 0.11 | 0.79 +/- 0.13 | 0.80 |
| RNAfold | 0.76 +/- 0.14 | 0.74 +/- 0.15 | 0.75 |
| LinearFold | 0.74 +/- 0.15 | 0.72 +/- 0.16 | 0.73 |

Pairwise comparisons (Wilcoxon signed-rank, Bonferroni-corrected):

| Comparison | Sensitivity p-value | PPV p-value |
|------------|-------------------|-------------|
| EternaFold vs. RNAfold | 0.003 | 0.007 |
| EternaFold vs. LinearFold | 0.001 | 0.002 |
| RNAfold vs. LinearFold | 0.312 | 0.284 |

EternaFold significantly outperformed both alternatives. RNAfold and LinearFold were not significantly different from each other.

## 4. Integrated Discussion

### 4.1 Cross-Phase Synthesis

The accuracy advantage of EternaFold was consistent across phases and analyses. Family-stratified analysis revealed that the advantage was most pronounced for riboswitches (sensitivity: EternaFold 0.78 vs. RNAfold 0.64) and long rRNA sequences (> 200 nt), where learned parameters appear to capture structural motifs missed by purely thermodynamic models.

For tRNA sequences, all three tools performed similarly (sensitivity > 0.90), consistent with the well-conserved and compact nature of tRNA secondary structures.

### 4.2 Assessment Against Objectives

| Objective | Target | Outcome | Assessment |
|-----------|--------|---------|-----------|
| Complete benchmark | 150/150 predictions evaluated | 150/150 | met |
| Statistical rigor | 3 tests, Bonferroni-corrected | Completed | met |
| Tool recommendation | Ranking with effect sizes | EternaFold recommended | met |
| Reproducibility | End-to-end pipeline from raw data | Verified | met |

### 4.3 Limitations and Caveats

- The dataset over-represents tRNA (30%), which may inflate aggregate accuracy metrics since tRNA structures are well-predicted by all tools.
- The benchmark does not assess pseudoknot prediction, which is relevant for some RNA families.
- EternaFold's advantage may partly reflect training data overlap with RNA STRAND entries.

### 4.4 Comparison to Prior Work

Our results are consistent with the EternaFold publication (Wayment-Steele et al., 2022), which reported similar accuracy advantages over ViennaRNA on independent test sets. The magnitude of improvement we observed (6 percentage points in sensitivity) is slightly larger than their reported 4 percentage points, possibly due to our dataset's inclusion of more challenging riboswitch sequences.

## 5. Conclusions and Recommendations

### 5.1 Key Conclusions

1. EternaFold 1.2 achieves the highest accuracy for RNA secondary structure prediction across all tested RNA families (sensitivity 0.82, PPV 0.79).
2. The accuracy advantage is statistically significant compared to both RNAfold and LinearFold (Bonferroni-corrected p < 0.01).
3. LinearFold provides a 12x speed advantage over RNAfold with minimal accuracy loss (2 percentage points), making it suitable for high-throughput screening.
4. All three tools perform comparably on tRNA sequences, suggesting that tool selection matters most for structurally complex RNAs.

### 5.2 Recommendations

- Use EternaFold as the primary prediction tool for downstream tertiary structure modeling.
- For preliminary screening of large sequence sets (> 500 sequences), use LinearFold for speed, then re-predict top candidates with EternaFold.
- Investigate pseudoknot-capable tools (e.g., pKiss, IPknot) in a follow-up workstream if pseudoknot detection becomes relevant.

### 5.3 Open Questions

- Does EternaFold's accuracy advantage extend to RNA sequences longer than 450 nt?
- How do the tools compare on synthetic or engineered RNA sequences not represented in structural databases?
- Would ensemble methods (combining predictions from multiple tools) outperform any single tool?

## 6. File Manifest

| File | Location | Description | Phase | Format |
|------|----------|-------------|-------|--------|
| 01_prepare_data.py | `02-scripts/` | Data download and validation | 1 | py |
| 02_run_predictions.sh | `02-scripts/` | Batch prediction runner | 2 | sh |
| 03_evaluate_accuracy.py | `02-scripts/` | Accuracy comparison and visualization | 3 | py |
| rna_strand_50.fasta | `03-data/raw/` | Curated RNA sequences | 1 | fasta |
| reference_structures.csv | `03-data/reference/` | Experimentally determined structures | 1 | csv |
| predictions_rnafold.csv | `05-results/` | RNAfold predictions | 2 | csv |
| predictions_linearfold.csv | `05-results/` | LinearFold predictions | 2 | csv |
| predictions_eternafold.csv | `05-results/` | EternaFold predictions | 2 | csv |
| accuracy_comparison.csv | `05-results/` | Per-sequence accuracy metrics | 3 | csv |
| accuracy_boxplot.png | `05-results/figures/` | Tool comparison boxplot | 3 | png |
| family_heatmap.png | `05-results/figures/` | Accuracy by RNA family heatmap | 3 | png |

## 7. References and Source Documents

| Document | Type | Location |
|----------|------|----------|
| rna_folding_plan.md | Plan | `01-documentation/plans/` |
| rna_folding_process_phase1.md | Process artifact | `01-documentation/process/` |
| rna_folding_process_phase2.md | Process artifact | `01-documentation/process/` |
| rna_folding_process_phase3.md | Process artifact | `01-documentation/process/` |
| rna_folding_findings_phase1.md | Findings | `06-reports/findings/` |
| rna_folding_findings_phase2.md | Findings | `06-reports/findings/` |
| rna_folding_findings_phase3.md | Findings | `06-reports/findings/` |
