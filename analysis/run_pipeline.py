"""Reproducible OmniNexus hackathon analytics pipeline.

Raw hackathon files stay local. This script creates evidence artifacts only.
No raw dataset is uploaded or required by the application.
"""

from __future__ import annotations

from pathlib import Path
import re

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from scipy.stats import f_oneway, pointbiserialr, spearmanr
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import make_scorer, precision_score, recall_score
from sklearn.model_selection import StratifiedKFold, cross_validate
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler


ROOT = Path(__file__).resolve().parent
DATA = ROOT / "data"
OUT = ROOT / "output"
OUT.mkdir(parents=True, exist_ok=True)

DS_PATH = DATA / "DataScience Jobs.csv"
ANALYTICS_PATH = DATA / "Analytics Jobs.csv"
JDS_PATH = DATA / "JDS Skill Traits.xlsx"
SDS_PATH = DATA / "SDS Personality Traits.xlsx"


def require_files() -> None:
    missing = [str(p) for p in (DS_PATH, ANALYTICS_PATH, JDS_PATH, SDS_PATH) if not p.exists()]
    if missing:
        raise FileNotFoundError(
            "Missing supplied hackathon data files. Put them under analysis/data/:\n"
            + "\n".join(missing)
        )


def parse_salary(value: object) -> float:
    match = re.match(r"^\s*(\d+(?:\.\d+)?)\s*L\s*$", str(value), re.I)
    return float(match.group(1)) if match else np.nan


def parse_salary_band(value: object) -> float:
    match = re.match(
        r"^\s*(\d+(?:\.\d+)?)\s*to\s*(\d+(?:\.\d+)?)\s*$",
        str(value),
        re.I,
    )
    return (float(match.group(1)) + float(match.group(2))) / 2 if match else np.nan


def clean_skill_token(value: object) -> str:
    return re.sub(r"\s+", " ", str(value).strip().lower())


def savefig(name: str) -> None:
    plt.tight_layout()
    plt.savefig(OUT / name, dpi=180, bbox_inches="tight")
    plt.close()


def model_comparison(X: pd.DataFrame, y: pd.Series, prefix: str) -> pd.DataFrame:
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    scoring = {
        "accuracy": "accuracy",
        "precision": make_scorer(precision_score, zero_division=0),
        "recall": make_scorer(recall_score, zero_division=0),
        "f1": "f1",
        "roc_auc": "roc_auc",
    }
    models = {
        "Logistic Regression": Pipeline(
            [
                ("scale", StandardScaler()),
                ("model", LogisticRegression(max_iter=2000, random_state=42)),
            ]
        ),
        "Random Forest": RandomForestClassifier(
            n_estimators=500,
            min_samples_leaf=2,
            class_weight="balanced",
            random_state=42,
        ),
        "Gradient Boosting": GradientBoostingClassifier(
            n_estimators=200,
            learning_rate=0.03,
            max_depth=2,
            random_state=42,
        ),
    }

    rows = []
    for name, model in models.items():
        result = cross_validate(model, X, y, cv=cv, scoring=scoring, n_jobs=-1)
        row = {"model": name}
        for metric in scoring:
            row[metric] = float(result[f"test_{metric}"].mean())
        rows.append(row)

    pd.DataFrame(rows).sort_values("roc_auc", ascending=False).to_csv(
        OUT / f"{prefix}_model_comparison.csv", index=False
    )
    return pd.DataFrame(rows)


def main() -> None:
    require_files()

    ds = pd.read_csv(DS_PATH)
    analytics = pd.read_csv(ANALYTICS_PATH)
    jds = pd.read_excel(JDS_PATH)
    sds = pd.read_excel(SDS_PATH)

    # ---------------------------
    # Data quality
    # ---------------------------
    quality_rows = []
    for name, frame, id_col in [
        ("Data Science Jobs", ds, "reference_no"),
        ("Analytics Jobs", analytics, "s_no"),
        ("JDS Skill Traits", jds, "id"),
        ("SDS Personality Traits", sds, "id"),
    ]:
        quality_rows.append(
            {
                "dataset": name,
                "rows": len(frame),
                "columns": len(frame.columns),
                "missing_cells": int(frame.isna().sum().sum()),
                "duplicate_rows": int(frame.duplicated().sum()),
                "duplicate_ids": int(frame[id_col].duplicated().sum()),
            }
        )
    pd.DataFrame(quality_rows).to_csv(OUT / "data_quality_summary.csv", index=False)

    # ---------------------------
    # Data Science Jobs
    # ---------------------------
    ds["avg_salary_lakh"] = ds["avg_salary"].map(parse_salary)
    ds["min_salary_lakh"] = ds["min_salary"].map(parse_salary)
    ds["max_salary_lakh"] = ds["max_salary"].map(parse_salary)
    ds["min_experience_num"] = pd.to_numeric(ds["min_experience"], errors="coerce")

    salary_by_title = (
        ds.groupby("job_title")
        .agg(
            mean_salary_lakh=("avg_salary_lakh", "mean"),
            median_salary_lakh=("avg_salary_lakh", "median"),
            total_postings=("num_of_jobs", "sum"),
            records=("job_title", "size"),
        )
        .sort_values("mean_salary_lakh", ascending=False)
        .reset_index()
    )
    salary_by_title.to_csv(OUT / "salary_by_title.csv", index=False)

    experience_salary = (
        ds.groupby("min_experience_num")
        .agg(
            mean_salary_lakh=("avg_salary_lakh", "mean"),
            records=("avg_salary_lakh", "size"),
        )
        .reset_index()
        .sort_values("min_experience_num")
    )
    experience_salary.to_csv(OUT / "experience_salary.csv", index=False)

    plt.figure(figsize=(9, 5))
    plt.barh(salary_by_title["job_title"], salary_by_title["mean_salary_lakh"])
    plt.xlabel("Mean average salary (Lakh)")
    plt.title("Mean Salary by Data Science Job Title")
    savefig("01_salary_by_title.png")

    plt.figure(figsize=(9, 5))
    plt.plot(experience_salary["min_experience_num"], experience_salary["mean_salary_lakh"], marker="o")
    plt.xlabel("Minimum required experience (years)")
    plt.ylabel("Mean average salary (Lakh)")
    plt.title("Experience vs Mean Salary")
    savefig("02_experience_salary.png")

    rho, p = spearmanr(ds["min_experience_num"], ds["avg_salary_lakh"])
    f_stat, f_p = f_oneway(*[g["avg_salary_lakh"].values for _, g in ds.groupby("job_title")])
    post_rho, post_p = spearmanr(ds["num_of_jobs"], ds["avg_salary_lakh"])
    pd.DataFrame(
        [
            ["experience_vs_salary", "Spearman rho", rho, p],
            ["job_title_salary", "One-way ANOVA F", f_stat, f_p],
            ["posting_count_vs_salary", "Spearman rho", post_rho, post_p],
        ],
        columns=["analysis", "test_statistic", "value", "p_value"],
    ).to_csv(OUT / "market_statistical_tests.csv", index=False)

    # ---------------------------
    # Analytics Jobs / skills
    # ---------------------------
    analytics["salary_mid_lakh"] = analytics["salary"].map(parse_salary_band)
    skill_rows = []
    for _, row in analytics[["key_skills", "salary_mid_lakh"]].iterrows():
        if pd.isna(row["salary_mid_lakh"]):
            continue
        tokens = {
            clean_skill_token(token)
            for token in str(row["key_skills"]).split(",")
            if clean_skill_token(token) and clean_skill_token(token) != "..."
        }
        for skill in tokens:
            skill_rows.append((skill, row["salary_mid_lakh"]))

    skill_frame = pd.DataFrame(skill_rows, columns=["skill", "salary_mid_lakh"])
    skill_demand = (
        skill_frame.groupby("skill")
        .agg(
            postings=("skill", "size"),
            salary_mid_lakh=("salary_mid_lakh", "mean"),
        )
        .sort_values("postings", ascending=False)
        .reset_index()
    )
    skill_demand.to_csv(OUT / "skill_demand.csv", index=False)

    top_skills = skill_demand.head(15).sort_values("postings")
    plt.figure(figsize=(9, 6))
    plt.barh(top_skills["skill"], top_skills["postings"])
    plt.xlabel("Job-posting records mentioning skill")
    plt.title("Top Skill Demand in Analytics Jobs Sample")
    savefig("03_skill_demand.png")

    # ---------------------------
    # JDS salary-hike model
    # ---------------------------
    jds_target = "salary_hike_high_or_low"
    jds_features = [
        "big_data_skills",
        "maths-stats_skills",
        "coding_skills",
        "ai_and_ml_skills",
        "dashboard_and_storytelling_skills",
    ]
    jds_X = jds[jds_features]
    jds_y = jds[jds_target]
    jds_models = model_comparison(jds_X, jds_y, "jds")

    rf_jds = RandomForestClassifier(
        n_estimators=500, min_samples_leaf=2, class_weight="balanced", random_state=42
    )
    rf_jds.fit(jds_X, jds_y)
    jds_importance = (
        pd.DataFrame({"feature": jds_features, "importance": rf_jds.feature_importances_})
        .sort_values("importance", ascending=False)
    )
    jds_importance.to_csv(OUT / "jds_feature_importance.csv", index=False)

    plt.figure(figsize=(8, 5))
    plt.barh(jds_importance["feature"][::-1], jds_importance["importance"][::-1])
    plt.xlabel("Random Forest importance")
    plt.title("JDS Skill Signals")
    savefig("04_jds_importance.png")

    jds_stats = []
    for feature in jds_features:
        stat, p_value = pointbiserialr(jds[feature], jds_y)
        jds_stats.append([feature, stat, p_value])
    pd.DataFrame(jds_stats, columns=["feature", "point_biserial_r", "p_value"]).to_csv(
        OUT / "jds_feature_statistics.csv", index=False
    )

    # ---------------------------
    # SDS success model
    # ---------------------------
    sds.columns = [str(c).strip() for c in sds.columns]
    sds_target = "success_ classification_ high_low"
    sds_features = [
        "neuroticism",
        "extraversion",
        "openness_to_experience",
        "agreeableness",
        "conscientiousness",
    ]
    sds_X = sds[sds_features]
    sds_y = sds[sds_target]
    sds_models = model_comparison(sds_X, sds_y, "sds")

    rf_sds = RandomForestClassifier(
        n_estimators=500, min_samples_leaf=2, class_weight="balanced", random_state=42
    )
    rf_sds.fit(sds_X, sds_y)
    sds_importance = (
        pd.DataFrame({"feature": sds_features, "importance": rf_sds.feature_importances_})
        .sort_values("importance", ascending=False)
    )
    sds_importance.to_csv(OUT / "sds_feature_importance.csv", index=False)

    plt.figure(figsize=(8, 5))
    plt.barh(sds_importance["feature"][::-1], sds_importance["importance"][::-1])
    plt.xlabel("Random Forest importance")
    plt.title("SDS Personality Signals")
    savefig("05_sds_importance.png")

    sds_stats = []
    for feature in sds_features:
        stat, p_value = pointbiserialr(sds[feature], sds_y)
        sds_stats.append([feature, stat, p_value])
    pd.DataFrame(sds_stats, columns=["feature", "point_biserial_r", "p_value"]).to_csv(
        OUT / "sds_feature_statistics.csv", index=False
    )

    # ---------------------------
    # Machine-readable summary
    # ---------------------------
    summary = {
        "datasets": {
            "Data Science Jobs": list(map(int, ds.shape)),
            "Analytics Jobs": list(map(int, analytics.shape)),
            "JDS Skill Traits": list(map(int, jds.shape)),
            "SDS Personality Traits": list(map(int, sds.shape)),
        },
        "market": {
            "mean_salary_lakh": float(ds["avg_salary_lakh"].mean()),
            "median_salary_lakh": float(ds["avg_salary_lakh"].median()),
            "companies": int(ds["company_name"].nunique()),
            "job_titles": int(ds["job_title"].nunique()),
            "experience_salary_spearman_rho": float(rho),
            "experience_salary_p_value": float(p),
        },
        "jds_best_model": jds_models.sort_values("roc_auc", ascending=False).iloc[0].to_dict(),
        "sds_best_model": sds_models.sort_values("roc_auc", ascending=False).iloc[0].to_dict(),
    }
    pd.Series(summary).to_json(OUT / "analysis_summary.json", indent=2)

    print("OmniNexus analytics pipeline completed.")
    print(f"Evidence written to: {OUT}")


if __name__ == "__main__":
    main()
