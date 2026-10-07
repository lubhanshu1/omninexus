# OmniNexus Hackathon Analytics Pipeline

This directory contains the reproducible analytical pipeline for the SAS CU / Build For Bharat hackathon.

## Data policy

The supplied hackathon data must remain inside the permitted hackathon environment. Raw CSV/XLSX files are therefore **not committed to GitHub**.

Place the four supplied files under `analysis/data/` with these names:

- `DataScience Jobs.csv`
- `Analytics Jobs.csv`
- `JDS Skill Traits.xlsx`
- `SDS Personality Traits.xlsx`

The pipeline writes all generated evidence to `analysis/output/`, which is also ignored by Git.

## Run

Create a Python environment and install:

```bash
pip install -r analysis/requirements.txt
python analysis/run_pipeline.py
```

Outputs include data-quality summaries, market/job analysis, statistical tests, model-comparison tables, feature importance and charts.

## Analytical objective

Identify relationships between job-market demand, compensation, technical skill profiles and success traits, then translate those findings into actionable career and workforce intelligence.

The pipeline is intentionally auditable:

**raw data → quality checks → cleaning/normalization → EDA → statistical analysis → ML → validation → evidence**
