# Implementation Plan: AI & ML Integration Refinement

This plan covers the updating of architecture documentation and the design of a more robust "Fuzzy Matching Bridge" between raw scraped product data and canonical food metadata.

## User Review Required

> [!IMPORTANT]
> The "Fuzzy Matching Bridge" is the most critical link in the price normalization pipeline. If it fails, the ML model receives incorrect `price_per_gram` data. I am proposing moving the alias management from code to MongoDB Atlas for easier maintenance.

## Proposed Changes

### 1. Documentation Updates (Phase 1)
Aligning existing documents with the new MongoDB Atlas-driven architecture.

#### [MODIFY] [README.md](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/AI&ML%20intergretion/README.md)
- Update "Architecture" diagram to show Atlas as the source of truth for both `foods_metadata` and `products`.
- Update "Diet Plan Generation Pipeline" to reflect dynamic price fetching from Atlas.
- Update "Project Structure" to reflect the cleanup in `ml-service`.

#### [RENAME & MODIFY] [ml_architecture.md](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/AI&ML%20intergretion/ml_architecture.md)
- Rename from `ml_architecture.resolved.resolved`.
- Update the "Training Data" section to highlight the use of Atlas for real-time price signals.
- Clarify the role of the GBM model in ranking dynamic price-weighted candidates.

#### [MODIFY] [food_price_system.md](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/AI&ML%20intergretion/food_price_system.md)
- Reflect the shift from hardcoded JSON aliases to a dynamic matching bridge.
- Detail the current scraping workflow (Keells-API based) and its integration with the `products` collection.

#### [MODIFY] [DATABASE_SCHEMA.md](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/AI%26ML%20intergretion/DATABASE_SCHEMA.md)
- Add schema definitions for `foods_metadata` and the raw `products` collection.
- Document the `is_alias_verified` flag for the matching bridge feedback loop.

#### [MODIFY] [AIML_Tasks.md](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/AI%26ML%20intergretion/AIML_Tasks.md)
- Move "Atlas Migration" and "Dynamic Pricing" to **COMPLETED**.
- Add "Fuzzy Matching Bridge v2" as the next major focus.

---

### 2. Improved Fuzzy Matching Bridge Design (Phase 2)
Creating a comprehensive design document for the next version of the matching logic.

#### [NEW] [Improved Fuzzy Matching Bridge.md](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/AI&ML%20intergretion/Improved%20Fuzzy%20Matching%20Bridge.md)
- **Stage 1: Pre-processing Pipeline**: Regex-based cleaning, noise word removal, and brand extraction.
- **Stage 2: Attribute Extraction**: Automatic weight/unit parsing from product strings (e.g., "500g", "1kg", "10 pack").
- **Stage 3: Multi-Stage Scoring**: 
  1. Exact Alias Match (100%)
  2. Token Set Ratio matching (thefuzz)
  3. Category-constrained fallback.
- **Stage 4: Feedback Loop**: Designing the interface for the Admin Panel to "confirm" or "re-link" matches, updating the Atlas database directly.

## Verification Plan

### Automated Verification
- Create a test script in `ml-service/tests/test_bridge.py` that runs 50 real product names from Atlas and reports matching accuracy.
- Compare "Old Matching" vs "New Matching" scores.

### Manual Verification
- View the updated documentation artifacts to ensure they accurately reflect the system state.
- Validate that the proposed schema changes in `DATABASE_SCHEMA.md` are compatible with current `pymongo` implementation.
