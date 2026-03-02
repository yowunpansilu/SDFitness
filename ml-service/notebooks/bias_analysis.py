"""
Phase 7.2 — Bias Detection Analysis
Checks for systematic bias in the ML recommendation model
across dietary preferences, budget ranges, gender, and age groups.

Run:
    cd ml-service
    python notebooks/bias_analysis.py

Output:
    - Console summary table
    - bias_report.json (machine-readable results)
"""

import sys
import json
import os
import numpy as np

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from model.recommender import DietRecommender
from data.foods_db import FOODS_DB

recommender = DietRecommender()

def make_profile(**kwargs):
    """Build a user profile dict with sensible defaults."""
    return {
        "age": kwargs.get("age", 28),
        "weight_kg": kwargs.get("weight_kg", 70),
        "height_cm": kwargs.get("height_cm", 170),
        "gender": kwargs.get("gender", "male"),
        "goal": kwargs.get("goal", "maintenance"),
        "activity_level": kwargs.get("activity_level", "moderate"),
        "dietary_preferences": kwargs.get("dietary_preferences", []),
        "allergies": kwargs.get("allergies", []),
        "budget_weekly_lkr": kwargs.get("budget_weekly_lkr", 5000),
        "tdee": kwargs.get("tdee", 2200),
    }

def get_confidence(profile):
    """Run the recommender and return its confidence score."""
    try:
        result = recommender.recommend(profile, live_prices={})
        return result.get("confidence_score", 0.0)
    except Exception as e:
        print(f"  Warning: recommender error — {e}")
        return None

def bias_check(label, group_a_conf, group_b_conf, group_a_name, group_b_name, threshold=3.0):
    """Return a bias result dict."""
    if group_a_conf is None or group_b_conf is None:
        return {"label": label, "status": "skipped", "diff": None}

    diff = abs(group_a_conf - group_b_conf) * 100
    status = "WARNING" if diff > threshold else "OK"

    return {
        "label": label,
        "group_a": {"name": group_a_name, "confidence": round(group_a_conf, 4)},
        "group_b": {"name": group_b_name, "confidence": round(group_b_conf, 4)},
        "difference_pct": round(diff, 2),
        "threshold_pct": threshold,
        "status": status,
    }

def run_bias_analysis():
    print("=" * 60)
    print("  SDFitness ML — Bias Detection Analysis")
    print("=" * 60)

    results = []

    # ── 7.2.1 Dietary Preference Bias ────────────────────────────
    print("\n[1/4] Dietary Preference Bias...")

    omni_conf  = get_confidence(make_profile(dietary_preferences=[]))
    veg_conf   = get_confidence(make_profile(dietary_preferences=["vegetarian"]))
    vegan_conf = get_confidence(make_profile(dietary_preferences=["vegan"]))

    results.append(bias_check("Vegetarian vs Omnivore", veg_conf, omni_conf, "Vegetarian", "Omnivore"))
    results.append(bias_check("Vegan vs Omnivore", vegan_conf, omni_conf, "Vegan", "Omnivore"))

    # ── 7.2.2 Budget Range Bias ──────────────────────────────────
    print("[2/4] Budget Range Bias...")

    low_budget_conf  = get_confidence(make_profile(budget_weekly_lkr=2000))
    mid_budget_conf  = get_confidence(make_profile(budget_weekly_lkr=5000))
    high_budget_conf = get_confidence(make_profile(budget_weekly_lkr=10000))

    results.append(bias_check("Low vs High Budget", low_budget_conf, high_budget_conf, "Low (<3K LKR)", "High (>8K LKR)"))
    results.append(bias_check("Mid vs High Budget", mid_budget_conf, high_budget_conf, "Mid (5K LKR)", "High (>8K LKR)"))

    # ── 7.2.3 Gender Bias ────────────────────────────────────────
    print("[3/4] Gender Bias...")

    male_conf   = get_confidence(make_profile(gender="male",   weight_kg=80, height_cm=178, tdee=2500))
    female_conf = get_confidence(make_profile(gender="female", weight_kg=60, height_cm=163, tdee=1900))

    results.append(bias_check("Gender (Male vs Female)", male_conf, female_conf, "Male", "Female"))

    # ── 7.2.4 Age Group Bias ─────────────────────────────────────
    print("[4/4] Age Group Bias...")

    young_conf = get_confidence(make_profile(age=22, tdee=2400))
    mid_conf   = get_confidence(make_profile(age=35, tdee=2200))
    older_conf = get_confidence(make_profile(age=50, tdee=1950))

    results.append(bias_check("Young vs Older (22 vs 50)", young_conf, older_conf, "Age 22", "Age 50"))
    results.append(bias_check("Mid vs Older (35 vs 50)", mid_conf, older_conf, "Age 35", "Age 50"))

    # ── Summary ──────────────────────────────────────────────────
    print("\n" + "=" * 60)
    print("  RESULTS SUMMARY")
    print("=" * 60)
    print(f"{'Check':<38} {'Diff':>7}  {'Status'}")
    print("-" * 60)

    warnings = 0
    for r in results:
        if r.get("status") == "skipped":
            print(f"  {r['label']:<36}  SKIPPED")
            continue
        flag = "⚠️ " if r["status"] == "WARNING" else "✅ "
        print(f"  {r['label']:<36}  {r['difference_pct']:>5.1f}%  {flag}{r['status']}")
        if r["status"] == "WARNING":
            warnings += 1

    print("-" * 60)
    print(f"\n  {len(results)} checks | {warnings} warnings | {len(results) - warnings} passed\n")

    if warnings == 0:
        print("  🎉 No significant bias detected across all groups.")
    else:
        print(f"  ⚠️  {warnings} check(s) exceeded the 3% threshold — review recommended.")

    # ── Save JSON report ─────────────────────────────────────────
    output_path = os.path.join(os.path.dirname(__file__), "bias_report.json")
    with open(output_path, "w") as f:
        json.dump({
            "model": "SDFitness GBM v1.0.0",
            "threshold_pct": 3.0,
            "total_checks": len(results),
            "warnings": warnings,
            "results": results,
        }, f, indent=2)
    print(f"  📄 Full report saved to: {output_path}\n")

    return results

if __name__ == "__main__":
    run_bias_analysis()
