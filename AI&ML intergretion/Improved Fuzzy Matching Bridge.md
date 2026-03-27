# Technical Design: Improved Fuzzy Matching Bridge (v2)

This document outlines the upgraded logic for linking raw scraped product data and canonical food IDs. This version addresses Unicode corruption, brand noise, and the "NO" UOM (unit-of-measure) weight extraction gap.

---

## 🏗️ The 4-Stage Pipeline

### Stage 1: Pre-processing & Sanitization
Before matching, we must strip the noise that confuses fuzzy algorithms.
- **Unicode Scrubbing**: Remove common scraping artifacts like `â`, `Â`, and non-breaking spaces.
- **Brand Removal**: Use a curated list of Sri Lankan brands (Keells, Cargills, Green Hills, Bairaha, Nature Harvest, etc.) to strip prefixes.
- **Case Normalization**: Lowercase everything.

### Stage 2: Attribute & Weight Extraction (The "NO" Fix)
For products where `uom: "NO"`, we extract the weight from the string to calculate `price_per_gram`.
- **Regex Logic**: 
  - `(\d+)\s*(g|G|gram|grams)`
  - `(\d+)\s*(kg|KG|kilogram|kilograms)`
  - `(\d+)\s*(ml|ML|l|L)`
- **Category Fallbacks**:
  - If no weight is found and category is `Eggs` → set to 60g per unit.
  - If no weight is found and category is `Coconut` → set to 400g (average edible weight).

### Stage 3: Multi-Stage Scoring
Instead of a single threshold, we use a waterfall approach:
1.  **Exact Alias Match (1.0)**: If a cleaned name exactly matches a primary alias or common name.
2.  **Token Set Ratio (TheFuzz)**: Handles word reordering well (e.g., "Chicken Breast" vs "Breast Chicken").
3.  **Department Constraint**: Match score is penalized by 50% if the product `departmentName` does not align with the food's primary category (e.g., prevents "Chicken Flavored Biscuits" from matching "Chicken").

### Stage 4: Admin Feedback Loop
Products with a confidence score between **0.60 and 0.75** are flagged for review.
- **Database Storage**: Approved matches are saved to the `food_aliases` collection in Atlas, making the bridge "smarter" over time without code deployments.

---

## 📊 Evaluation Metrics
- **Recall**: Percentage of scraped products successfully mapped to a canonical ID.
- **Precision**: Accuracy of the mapping (verified via manual audit of 50 samples).
- **Inference Latency**: Target < 5ms per name.

---

## 🛠️ Implementation Roadmap

### Phase 1: Logic Migration
- Move `FOOD_ALIASES` from `food_aliases.py` to Atlas `food_aliases` collection.
- Implement the `Sanitizer` and `WeightExtractor` classes in `ml-service/utils/matcher.py`.

### Phase 2: Integration
- Update `get_live_prices_from_db()` in `foods_db.py` to use the new pipeline.
- Log "Unmatched" products to a new Atlas collection `bridge_logs` for analysis.
