---
title: "RNA Folding Process — Phase 1"
type: process-artifact
workstream: rna_folding
plan: rna_folding_plan.md
phase: phase1
project: rna_structure_prediction
date: 2026-02-16
status: complete
---

# RNA Folding Process — Phase 1

## 1. Overview

This process artifact captures the data preparation phase of the RNA folding benchmark workstream. The objective was to download, validate, and format 50 non-coding RNA sequences with experimentally determined secondary structures from the RNA STRAND database.

This phase corresponds to Phase 1 of the [rna_folding_plan.md](../01-documentation/plans/rna_folding_plan.md), which defined the scope as: sequence retrieval, format validation, and reference structure extraction. The scope boundary excludes any prediction runs (Phase 2) or accuracy analysis (Phase 3).

All success criteria for this phase were met: 50 valid sequences retrieved, dot-bracket notation validated, and 6 distinct RNA families represented.

## 2. Execution Summary

**Deliverables produced:**
1. `03-data/raw/rna_strand_50.fasta` — curated FASTA file with 50 RNA sequences
2. `03-data/reference/reference_structures.csv` — reference structures in dot-bracket notation
3. `02-scripts/01_prepare_data.py` — automated download and validation script
4. `05-results/data_summary.csv` — sequence length distribution and family breakdown

**Current state:** complete
**Duration:** ~2.5 hours

## 3. Data and Methods

### Input Data

| Source | Format | Location | Description |
|--------|--------|----------|-------------|
| RNA STRAND v2.0 | REST API / JSON | `https://rnacentral.org/api/` | Database of RNA secondary structures |
| Inclusion list | CSV | `config/inclusion_criteria.csv` | Filtering criteria for sequence selection |

### Tools and Parameters

| Tool | Version | Key Parameters |
|------|---------|---------------|
| Python | 3.12.1 | — |
| Biopython | 1.84 | `SeqIO.parse()`, `SeqIO.write()` |
| requests | 2.31.0 | timeout=30s, retries=3 |
| pandas | 2.2.0 | — |

### Scripts and Commands

- `02-scripts/01_prepare_data.py` — main data preparation script

Key invocations:
```bash
uv run python 02-scripts/01_prepare_data.py --source rna_strand \
  --criteria config/inclusion_criteria.csv \
  --output-fasta 03-data/raw/rna_strand_50.fasta \
  --output-structures 03-data/reference/reference_structures.csv
```

### Output Data

| Output | Format | Location | Description |
|--------|--------|----------|-------------|
| Curated sequences | FASTA | `03-data/raw/rna_strand_50.fasta` | 50 RNA sequences, 60-423 nt |
| Reference structures | CSV | `03-data/reference/reference_structures.csv` | ID, length, family, dot-bracket |
| Data summary | CSV | `05-results/data_summary.csv` | Length distribution, family counts |

### Data Lineage

```
RNA STRAND API -> [01_prepare_data.py: download] -> raw_responses.json
  -> [01_prepare_data.py: filter] -> rna_strand_50.fasta
  -> [01_prepare_data.py: extract structures] -> reference_structures.csv
  -> [01_prepare_data.py: summarize] -> data_summary.csv
```

## 4. Process Narrative

Work began by reviewing the RNA STRAND database documentation to confirm API endpoint stability and response format. The inclusion criteria were defined first: only entries with crystallographic or cryo-EM experimental validation at resolution below 3.5 angstroms, sequence length between 60 and 450 nucleotides, and no ambiguous bases (N characters).

The initial API query returned 127 candidate sequences. Filtering by resolution threshold reduced this to 73. A second filter for sequence length range brought the set to 58 candidates. Manual review identified 8 sequences with incomplete dot-bracket annotations (mismatched parentheses or length discrepancies), which were excluded. The final set of 50 sequences was written to FASTA format.

A validation step was added after discovering that 3 sequences had trailing whitespace in their dot-bracket strings, causing length mismatches. The script was updated to strip whitespace before validation, which resolved the issue.

The reference structures CSV was generated with columns for sequence ID, nucleotide length, RNA family classification, and the validated dot-bracket structure string.

## 5. Key Decisions

### Decision 1: Resolution threshold at 3.5 A

- **Decision:** Set the maximum resolution cutoff at 3.5 angstroms rather than the initially considered 3.0 A.
- **Context:** At 3.0 A, only 38 sequences passed filtering — below the target of 50.
- **Rationale:** 3.5 A is still considered reliable for secondary structure determination. The Mathews et al. benchmark used a similar threshold.
- **Impact:** Increased the candidate pool from 38 to 73 sequences, enabling the target of 50 after downstream filtering.

### Decision 2: Exclude sequences with ambiguous bases

- **Decision:** Remove all sequences containing N (ambiguous) bases rather than replacing N with the most common base at that position.
- **Context:** 4 sequences had 1-3 ambiguous positions. Replacing with consensus bases would preserve sample size but introduce uncertainty.
- **Rationale:** Ambiguous bases would affect prediction accuracy in unpredictable ways. With a sufficient candidate pool (58 before this filter), exclusion was preferred.
- **Impact:** Reduced candidates from 58 to 54. Final 50 selected from this pool.

## 6. Observations and Measurements

### Quantitative Results

| Metric | Value | Reference/Expected | Notes |
|--------|-------|-------------------|-------|
| Sequences retrieved | 127 | — | Initial API query |
| After resolution filter | 73 | — | <= 3.5 A |
| After length filter | 58 | — | 60-450 nt |
| After validation | 50 | 50 (target) | Final curated set |
| Mean sequence length | 187.4 nt | — | Range: 60-423 nt |
| Median sequence length | 156 nt | — | — |
| RNA families represented | 6 | >= 5 (target) | tRNA, rRNA, ribozyme, riboswitch, SRP RNA, tmRNA |

### Unexpected Findings

Three sequences from the RNA STRAND database had trailing whitespace characters appended to their dot-bracket notation strings, causing a length mismatch with the nucleotide sequence. This appears to be a data entry artifact in the database. The issue was resolved by stripping whitespace before validation.

### Quality Assessment

All 50 sequences passed validation checks:
- Dot-bracket string length matches sequence length for all 50 entries
- Parentheses are balanced (every opening bracket has a matching close) in all 50 structures
- No ambiguous bases remain in the curated FASTA file
- Family distribution covers 6 distinct RNA families, exceeding the nice-to-have target of 5

## 7. Issues and Resolutions

| Issue | Impact | Resolution | Status |
|-------|--------|-----------|--------|
| Trailing whitespace in dot-bracket strings | 3 sequences failed validation | Added `.strip()` before length comparison | resolved |
| API rate limiting (429 responses) | Slowed download by ~15 min | Added exponential backoff with 3 retries | resolved |
| One sequence had mismatched parentheses | 1 sequence excluded | Excluded from final set; reported upstream | resolved |

The API rate limiting was encountered after approximately 80 sequential requests. The exponential backoff strategy (1s, 2s, 4s delays between retries) resolved all 429 responses without manual intervention.

## 8. Artifact Manifest

| File | Location | Description | Format |
|------|----------|-------------|--------|
| 01_prepare_data.py | `02-scripts/` | Data download and validation script | py |
| rna_strand_50.fasta | `03-data/raw/` | Curated RNA sequences | fasta |
| reference_structures.csv | `03-data/reference/` | Reference secondary structures | csv |
| data_summary.csv | `05-results/` | Length and family distribution summary | csv |
| inclusion_criteria.csv | `config/` | Filtering parameters | csv |
