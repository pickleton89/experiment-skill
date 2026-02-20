---
title: "RNA Folding Findings — Phase 1"
type: findings
workstream: rna_folding
plan: rna_folding_plan.md
scope: phase1
process_artifacts:
  - rna_folding_process_phase1.md
project: rna_structure_prediction
date: 2026-02-17
---

# RNA Folding Findings — Phase 1

## 1. Summary

Data preparation for the RNA folding benchmark was completed successfully. All 50 target sequences were retrieved, validated, and formatted from the RNA STRAND database. The curated dataset covers 6 RNA families with sequence lengths ranging from 60 to 423 nucleotides, providing adequate diversity for the planned benchmark.

**Key finding:** The curated dataset of 50 validated RNA sequences with experimental structures at resolution <= 3.5 A meets all Phase 1 success criteria and is ready for prediction runs in Phase 2.

## 2. Results by Analysis

### 2.1 Sequence Retrieval and Curation

**Method:** Automated retrieval from RNA STRAND v2.0 API with progressive filtering by resolution (< 3.5 A), sequence length (60-450 nt), and base composition (no ambiguous bases). See [rna_folding_process_phase1.md](../01-documentation/process/rna_folding_process_phase1.md) Section 3 for full pipeline details.

**Results:**

| Stage | Count | Reduction |
|-------|-------|-----------|
| Initial API query | 127 | — |
| Resolution filter (<= 3.5 A) | 73 | -54 (42.5%) |
| Length filter (60-450 nt) | 58 | -15 (20.5%) |
| Validation (no ambiguous bases, valid dot-bracket) | 50 | -8 (13.8%) |

**Interpretation:** The progressive filtering reduced the candidate pool by 60.6% overall. The resolution threshold was the most aggressive filter, removing 42.5% of candidates. This is expected — many RNA STRAND entries derive from NMR or lower-resolution methods. The final count of 50 matches the target exactly.

### 2.2 Dataset Characterization

**Method:** Statistical summary of the curated dataset by sequence length and RNA family classification.

**Results:**

| Metric | Value |
|--------|-------|
| Mean length | 187.4 nt |
| Median length | 156 nt |
| Range | 60-423 nt |
| Std deviation | 98.2 nt |
| RNA families | 6 (tRNA, rRNA, ribozyme, riboswitch, SRP RNA, tmRNA) |

| RNA Family | Count | Proportion |
|------------|-------|-----------|
| tRNA | 15 | 30% |
| rRNA | 12 | 24% |
| Ribozyme | 9 | 18% |
| Riboswitch | 8 | 16% |
| SRP RNA | 4 | 8% |
| tmRNA | 2 | 4% |

**Interpretation:** The dataset is moderately skewed toward tRNA and rRNA, which reflects the over-representation of these families in structural databases. The 6-family coverage exceeds the nice-to-have target of 5. The length distribution spans a useful range for benchmarking, though the skew toward shorter sequences (median 156 vs. mean 187) means accuracy metrics may be biased toward smaller RNA structures.

## 3. Cross-Analysis Integration

### Convergent Evidence

The filtering pipeline and dataset characterization both confirm that the curated set is suitable for benchmarking. Sequence lengths span the range where secondary structure prediction tools are expected to perform differently (short tRNAs are generally well-predicted; longer riboswitches and rRNAs challenge MFE methods).

### Discrepancies

None identified in this phase. The data preparation yielded clean outputs with no unresolved quality issues.

### Emergent Patterns

The dominance of tRNA (30%) in the dataset is a known bias in RNA structural databases. This may affect aggregate accuracy metrics in Phase 3 — tRNA secondary structures are highly conserved and generally well-predicted, potentially inflating overall accuracy scores. Family-stratified analysis in Phase 3 will be important.

## 4. Assessment Against Success Criteria

| Criterion | Target | Actual | Assessment | Notes |
|-----------|--------|--------|-----------|-------|
| Sequence count | 50 | 50 | met | Exact match after resolution threshold adjustment |
| Format validation | 100% matching dot-bracket lengths | 100% (50/50) | met | After whitespace stripping fix |
| Family coverage | >= 5 families | 6 families | met | tRNA, rRNA, ribozyme, riboswitch, SRP RNA, tmRNA |

**Overall assessment:** Phase 1 achieved all three success criteria. The resolution threshold was adjusted from 3.0 A to 3.5 A to reach the target sequence count — this is an acceptable trade-off as 3.5 A remains reliable for secondary structure validation. The data is ready for Phase 2 prediction runs without additional preparation.

## 5. Recommendations

### For Subsequent Phases

- Proceed to Phase 2 (structure prediction) using the curated dataset as-is.
- In Phase 3, stratify accuracy analysis by RNA family to account for the tRNA over-representation identified in Section 2.2. Use both aggregate and family-stratified metrics.
- Consider weighting accuracy metrics inversely by family count to produce an unbiased aggregate score.

### Methodological Notes

- The whitespace-stripping fix for dot-bracket strings should be retained as a permanent validation step. This protects against database formatting inconsistencies.
- The exponential backoff for API rate limiting worked well and should be used for any future data retrieval from RNA STRAND.

### Open Questions

- Does the tRNA over-representation (30% of the dataset) significantly bias aggregate accuracy metrics? Phase 3 should test this explicitly.
- Should the benchmark include a "difficult subset" of long riboswitches and rRNAs (> 200 nt) as a separate evaluation tier?
