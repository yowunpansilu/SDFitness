# SDFitness AI/ML Integration — Master Task List

> **Branch:** `AIML_Intergretion`  
> **Last Updated:** 2026-03-27  
> **Key Status:** Core ML pipeline integrated with Atlas; Bridge v2 designed.

---

## 🏗️ Phase 1: Data Migration & Foundation (DONE)

### 1.1 Dynamic Atlas Integration
- [x] Migrate `FOODS_DB` from static file to Atlas `foods_metadata`.
- [x] Refactor `foods_db.py` to fetch nutritional data dynamically.
- [x] Implement secure Atlas connection in ML-service (escaped URIs).
- [x] Cleanup of hardcoded nutrition lists in Python service.

### 1.2 Training Data Verification
- [x] Audit `training_data.csv` against real world price distributions.
- [x] Integrate `currentPrice` from Atlas into the `DietRecommender` scoring.
- [x] Verified 0.963 R² score with dynamic price signals.

---

## 🌉 Phase 2: Fuzzy Matching Bridge (In Progress)

### 2.1 Bridge v1 (Basic Similarity) — DONE
- [x] Create `food_aliases.py` with thefuzz implementation.
- [x] Implement `fuzzy_match_to_food_id` with 0.75 threshold.
- [x] Basic unit normalization in `foods_db.py`.

### 2.2 Bridge v2 (Advanced NLP) — DONE
- [x] Move aliases to Atlas `foodaliases` collection — `seed_food_aliases.js` seeds via upsert.
- [x] Implement `WeightExtractor` (Regex) — UOM map driven by Atlas `scraper_config.uom_to_grams`.
- [x] Build `Sanitizer` — brand list driven by Atlas `scraper_config.brand_prefixes`, no hardcoding.
- [x] Implement multi-stage "Waterfall Scoring" (Exact → Fuzzy → Category) — `WaterfallMatcher`.
- [x] Build the "Bridge Feedback Loop" in the Admin Panel — `ScraperReview.tsx` (pre-existing).

---

## 🚀 Phase 3: Deployment & Documentation (DONE)

### 3.1 Dockerization
- [x] Docker-first architecture for Frontend, Admin, Backend, and ML-Service.
- [x] Port mappings and inter-container health-checks implemented.
- [x] Root `README.md` updated with Docker usage and microservice URLs.

### 3.2 System Validation
- [x] End-to-end integration test (`tests/test_integration.py`).
- [x] Model inference verified at < 25ms inside Docker.

---

**Next Focus**: Implementing the **Bridge v2 Sanitizer** to handle NO-UOM products and Unicode noise.
