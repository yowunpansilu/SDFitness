# SDFitness AI/ML Integration — Master Task List

> **Branch:** `AIML_Intergretion`  
> **Last Updated:** 2026-02-24  
> **Architecture Docs:** `ml_architecture.md.resolved`, `food_price_system.md`, `DATABASE_SCHEMA.md`

---

## Phase 1: Data Foundation (Week 1–2)

### 1.1 MongoDB Schema Implementation
- [x] Create Mongoose model: `FoodPrice` (from `DATABASE_SCHEMA.md` Section 20)
- [x] Update Mongoose model: `DietPlan` — new `shoppingList` structure with `priceAtGeneration`, `currentPrice`, `priceChanged`
- [x] Add `foodPrices` seed data for ~20 core foods (chicken, rice, eggs, lentils, etc.) with manual LKR prices
- [ ] Write migration script to update any existing `dietPlans` documents to new `shoppingList` format
- [x] Test: Verify all models validate correctly, indexes created

### 1.2 Food Nutrition Database
- [ ] Download USDA FoodData Central CSV (~150MB)
- [ ] Write Python preprocessing script (`ml-service/data/preprocessing.py`) to clean and extract relevant columns (name, calories, protein, carbs, fat, fiber per 100g)
- [ ] Filter to ~2,000 most relevant whole foods (remove supplements, baby food, branded junk)
- [ ] Add Sri Lankan food items from FAO/Open Food Facts
- [ ] Export cleaned dataset to `ml-service/data/foods.csv`
- [ ] Import food catalog into MongoDB `foods` collection (for the scraper's fuzzy matching)

---

## Phase 2: Price Scraping System (Week 3–4)

### 2.1 Catalog Scraper — Core Engine
- [ ] Create `backend/services/priceScraperService.js`
- [ ] Implement `discoverProductUrls(categoryUrl)` — crawl category pages with pagination
- [ ] Implement `scrapeProductPage(url)` — extract name, price, unit from product page
- [ ] Add rate limiting (`sleep(1500ms)` between requests)
- [ ] Add rotating User-Agent strings
- [ ] Add error handling: if a category returns 0 products, **abort update + alert admin** (don't wipe DB)
- [ ] Set up CRON job (`node-cron`) to run every 12 hours

### 2.2 Fuzzy Matching Engine
- [ ] Create `backend/services/foodMatcherService.js`
- [ ] Install `string-similarity` npm package
- [ ] Build initial `FOOD_ALIASES` table (~30 entries covering core foods)
- [ ] Implement `fuzzyMatchToFoodId(scrapedName)` with similarity threshold > 0.6
- [ ] **Add category constraint**: only match within the same food category (e.g., `/dairy` → dairy aliases only)
- [ ] Unmatched products → save to `scraperReviewQueue` collection for admin

### 2.3 Admin Review Queue
- [ ] Create Mongoose model: `ScraperReviewItem` (scrapedName, url, store, suggestedMatch, status)
- [ ] Admin Panel page: list unmatched items, allow admin to link to a `foodId` or dismiss
- [ ] On admin link → permanently add the new alias to `FOOD_ALIASES` (store in DB, not hardcoded)

### 2.4 Price API Endpoints (Node.js)
- [ ] `GET /api/prices` — list all food prices (paginated)
- [ ] `GET /api/prices/:foodId` — get price for specific food
- [ ] `GET /api/prices/batch?ids=a,b,c` — get prices for multiple foods (used by ML service call)
- [ ] `POST /api/prices` — admin: manually set a price
- [ ] `PUT /api/prices/:foodId` — admin: update a price
- [ ] `GET /api/prices/:foodId/history` — price trend data
- [ ] `POST /api/prices/trigger-scrape` — admin: manually trigger scraper
- [ ] Test: Verify all endpoints with Postman/Thunder Client

### 2.5 Open Food Facts API Integration
- [ ] Create `backend/services/openFoodFactsService.js`
- [ ] Implement barcode → product lookup for packaged foods
- [ ] Map responses to `FoodPrice` schema
- [ ] Add as secondary data source alongside scraper

---

## Phase 3: ML Model Development (Week 5–8)

### 3.1 Python Environment Setup
- [ ] Create `ml-service/` directory structure
- [ ] Write `ml-service/requirements.txt` (pandas, scikit-learn, xgboost, flask, numpy, joblib, matplotlib, seaborn, jupyter)
- [ ] Create Python virtual environment and install deps
- [ ] Verify Jupyter notebook runs in `ml-service/notebooks/`

### 3.2 Feature Engineering
- [ ] Create `ml-service/data/preprocessing.py`
- [ ] Define input feature vector:
  - User: age, weight, height, gender, activity_level
  - Goal: weight_loss / muscle_gain / endurance (one-hot encoded)
  - Budget: daily_budget_lkr
  - Preferences: is_vegetarian, is_vegan, is_gluten_free, is_dairy_free
  - Calculated: TDEE, target_calories, target_protein, target_carbs, target_fat
- [ ] Define output: food ranking score (0.0–1.0) per candidate food
- [ ] Create training data generator: 10,000 synthetic user profiles × food combinations
- [ ] **Critical:** Ensure ML model is trained as a **Learning to Rank** algorithm, NOT memorizing hardcoded TDEE formulas
  - Rank by: user preference match, variety (penalize duplicate proteins), complementary nutrition, historical ratings

### 3.3 Model Training
- [ ] Create `ml-service/model/train.py`
- [ ] Implement Gradient Boosting Regressor (scikit-learn or XGBoost)
- [ ] Train/test split (80/20)
- [ ] Evaluate: RMSE, MAE, R² on test set
- [ ] Generate feature importance chart → save as image for admin dashboard
- [ ] Hyperparameter tuning (n_estimators, max_depth, learning_rate)
- [ ] Save trained model to `ml-service/model/diet_model.pkl` via joblib
- [ ] Document training results in `ml-service/notebooks/model_exploration.ipynb`

### 3.4 Model Inference Logic
- [ ] Create `ml-service/model/recommender.py`
- [ ] Implement `recommend(user_profile, live_prices_dict, dietary_prefs)`:
  1. Filter foods by dietary constraints
  2. Score each food using trained model
  3. Apply budget scoring using `live_prices_dict` (passed in from Node.js — no circular dependency)
  4. Select top foods per meal slot (breakfast, lunch, dinner, snacks)
  5. Validate: macros ≈ targets? total cost ≤ budget?
  6. Return structured JSON recommendation
- [ ] Add confidence score per recommendation
- [ ] Add explainability: top 3 reasons why each food was chosen

### 3.5 Flask Microservice
- [ ] Create `ml-service/app.py` (Flask API on port 5001)
- [ ] `POST /recommend` — main endpoint, accepts `{ user_metrics, goals, budget, dietary_prefs, live_prices_dict }`
- [ ] `GET /health` — health check
- [ ] `GET /model-info` — return model version, training date, accuracy metrics
- [ ] Add request validation (missing fields, invalid types)
- [ ] Add CORS headers for local development
- [ ] Test: Verify with curl / Postman

---

## Phase 4: Backend Integration (Week 9–10)

### 4.1 ML Service Client (Node.js → Python)
- [ ] Create `backend/services/mlService.js`
- [ ] Implement `getMLRecommendation(userProfile, livePrices)` — HTTP POST to Python service
- [ ] Add timeout handling (5 second max)
- [ ] Add retry logic (1 retry on failure)
- [ ] Add fallback: if ML service is down, fall back to GPT-only generation

### 4.2 AI Service Refactor (ML-First Pipeline)
- [ ] Modify `backend/services/aiService.js` to implement the two-layer pipeline:
  1. Fetch member profile from MongoDB
  2. Fetch live prices from `foodPrices` collection
  3. Call Python ML service with profile + prices
  4. If ML succeeds → call GPT with **constrained formatting prompt** (ingredients locked, only write recipes)
  5. If ML fails → fall back to original GPT-only flow
- [ ] Implement SSE (Server-Sent Events) for streaming GPT response day-by-day
- [ ] Merge ML data (macros, cost, confidence) + GPT data (recipes, descriptions)
- [ ] Save merged plan to MongoDB with new `shoppingList` structure

### 4.3 Price Watcher Service
- [ ] Create `backend/services/priceWatcherService.js`
- [ ] On price update → find all active `dietPlans` containing that `foodId`
- [ ] Recalculate `shoppingList.currentTotal`
- [ ] Set `priceChanged: true` flag
- [ ] If `currentTotal > budget * 1.10` → send budget alert notification
- [ ] Test: Simulate a price increase and verify notification fires

### 4.4 Diet Plan API Updates
- [ ] Update `POST /api/diet-plans/generate` to use new ML-first pipeline
- [ ] Add `GET /api/diet-plans/:id/cost` — recalculate current cost with live prices
- [ ] Add `POST /api/diet-plans/:id/regenerate` — regenerate with current prices
- [ ] Update response format to include ML confidence scores and explainability data

---

## Phase 5: Frontend Integration (Week 11–12)

### 5.1 Diet Plan Generation UI
- [ ] Update "Generate Diet Plan" flow to show SSE streaming (Day 1 appears while Day 4 is generating)
- [ ] Add loading skeleton / progress indicator per day
- [ ] Show ML model confidence score per meal
- [ ] Show "Why we chose this" explainability panel (expand/collapse per meal)

### 5.2 Shopping List UI
- [ ] Redesign shopping list with live price badges
- [ ] Show `priceAtGeneration` vs `currentPrice` per item (with ↑↓ indicators)
- [ ] Show budget progress bar (current total vs budget limit)
- [ ] Show "⚠️ Prices updated X hours ago" timestamp
- [ ] Add "Regenerate Plan with Current Prices" button
- [ ] Show cheapest store recommendation per item

### 5.3 Budget Alert Notifications
- [ ] Display budget alert notification when `priceChanged: true`
- [ ] Link notification to shopping list with highlighted changed items
- [ ] Allow member to dismiss or act on the alert

---

## Phase 6: Admin Panel (Week 11–12)

### 6.1 ML Model Dashboard
- [ ] New admin page: `/admin/ml-dashboard`
- [ ] Show: model version, training date, accuracy metrics (RMSE, R²)
- [ ] Show: feature importance chart (bar chart)
- [ ] Show: A/B comparison — ML plan vs GPT-only plan accuracy (budget compliance %)
- [ ] Show: total plans generated by ML vs fallback count

### 6.2 Food Prices Management
- [ ] New admin page: `/admin/food-prices`
- [ ] List all foods with current prices, last updated, source
- [ ] Manual price entry/edit form
- [ ] Scraper status: last run time, items scraped, errors
- [ ] "Trigger Scrape Now" button
- [ ] Price trend charts per food item (line chart, last 30 days)

### 6.3 Scraper Review Queue
- [ ] New admin page: `/admin/scraper-review`
- [ ] List unmatched scraped products
- [ ] Dropdown to link to existing `foodId` or create new entry
- [ ] Dismiss/ignore irrelevant items (cleaning products, pet food, etc.)

---

## Phase 7: Analytics & Evaluation (Week 13–14)

### 7.1 Model Evaluation
- [ ] Calculate and display: RMSE, Precision, Recall for food recommendations
- [ ] Budget compliance rate: % of plans where actual cost ≤ stated budget
- [ ] Macro accuracy: % deviation of actual macros from target
- [ ] Generate training loss curves
- [ ] Compare: ML model accuracy vs pure GPT accuracy (side-by-side)

### 7.2 Bias Detection
- [ ] Check: does the model recommend different quality food for different budget ranges?
- [ ] Check: does the model perform equally well across different dietary preferences?
- [ ] Check: is there gender/age bias in recommendations?
- [ ] Document findings in `ml-service/notebooks/bias_analysis.ipynb`

### 7.3 Price Analytics
- [ ] Price trend analysis: average food prices over time
- [ ] Price change impact: how often do price changes break budget compliance?
- [ ] Store comparison: which store consistently has lowest prices?

---

## Phase 8: Testing & Deployment (Week 15–16)

### 8.1 Integration Testing
- [ ] End-to-end test: user profile → ML recommendation → GPT formatting → saved plan
- [ ] Test: scraper runs → prices update → shopping list recalculates → notification sent
- [ ] Test: ML service down → graceful fallback to GPT-only
- [ ] Test: all dietary restrictions respected (vegan user never gets meat)
- [ ] Test: budget never exceeded (total cost ≤ stated budget)

### 8.2 Performance Testing
- [ ] Measure: full pipeline latency (target: < 20 seconds end-to-end)
- [ ] Measure: ML inference time alone (target: < 2 seconds)
- [ ] Measure: SSE streaming — first day visible within 5 seconds
- [ ] Load test: 10 concurrent diet plan generations

### 8.3 Deployment
- [ ] Dockerize Python ML microservice
- [ ] Add ML service to docker-compose (alongside Node.js and MongoDB)
- [ ] Environment variables: ML service URL, GPT API key, scraper CRON schedule
- [ ] Production CORS and security headers
- [ ] Health check endpoint monitoring

### 8.4 Documentation
- [ ] Update README with ML architecture diagram
- [ ] Document API contracts (Node.js ↔ Python)
- [ ] Document model training procedure (how to retrain)
- [ ] Prepare demo script for panel presentation

---

## Team Assignment Summary

| Member | Primary Phases | Key Deliverables |
|---|---|---|
| **Member 1** (Backend) | Phase 4 | `mlService.js`, `aiService.js` refactor, SSE streaming |
| **Member 2** (Frontend) | Phase 5 | Shopping list UI, confidence scores, explainability panel |
| **Member 3** (Admin Panel) | Phase 6 | ML Dashboard, Food Prices page, Scraper Review Queue |
| **Member 4** (Payment/Notifs) | Phase 4.3, 5.3 | Price watcher, budget alerts, notifications |
| **Member 5** (ML Model Owner) | Phase 1.2, 3 | Data preprocessing, model training, Flask microservice |
| **Member 6** (Analytics) | Phase 7 | Model evaluation, bias detection, price analytics |

**Shared:** Phase 1.1 (schemas), Phase 2 (scraper), Phase 8 (testing)

---

> **Priority Order:** Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 & 6 (parallel) → Phase 7 → Phase 8
