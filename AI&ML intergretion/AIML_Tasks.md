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
- [x] ~~Download USDA FoodData Central~~ → Used inline food DB with 20 core foods + full USDA nutrition data (`ml-service/data/foods_db.py`)
- [x] Nutrition data included: calories, protein, carbs, fat, fiber per 100g
- [x] Sri Lankan food items included with LKR prices
- [x] Food catalog seeded into MongoDB via `backend/scripts/seedFoodPrices.js`

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
- [x] Create Mongoose model: `ScraperReviewItem` (scrapedName, url, store, suggestedMatch, status)
- [ ] Admin Panel page: list unmatched items, allow admin to link to a `foodId` or dismiss
- [ ] On admin link → permanently add the new alias to `FOOD_ALIASES` (store in DB, not hardcoded)

### 2.4 Price API Endpoints (Node.js)
- [x] `GET /api/prices` — list all food prices (paginated)
- [x] `GET /api/prices/:foodId` — get price for specific food
- [x] `GET /api/prices/batch?ids=a,b,c` — get prices for multiple foods (used by ML service call)
- [x] `POST /api/prices` — admin: manually set a price
- [x] `PUT /api/prices/:foodId` — admin: update a price
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
- [x] Create `ml-service/` directory structure
- [x] Write `ml-service/requirements.txt`
- [x] Create Python virtual environment and install deps

### 3.2 Feature Engineering
- [x] Created `ml-service/data/foods_db.py` with 20 foods + dietary flags
- [x] 23-feature input vector: user metrics + food nutrition + category one-hot + budget
- [x] Output: food ranking score (0.0–1.0)
- [x] Training data generator: 5,000 synthetic users × 10 foods = 50,000 training pairs
- [x] ✅ Learning-to-Rank: score combines goal_alignment, budget_fit, protein_density, fiber, variety

### 3.3 Model Training
- [x] `ml-service/model/train.py` — Gradient Boosting Regressor (200 estimators, depth 5)
- [x] 80/20 train/test split — **Test R²: 0.963, RMSE: 0.029**
- [x] Feature importance chart saved to `model/feature_importance.png`
- [x] Model saved to `model/diet_model.pkl`
- [x] Metrics saved to `model/training_metrics.json`

### 3.4 Model Inference Logic
- [x] `ml-service/model/recommender.py` — `DietRecommender` class
- [x] Filters by dietary constraints, scores all foods, builds 7-day meal plan
- [x] Variety rotation (different foods per day), portion clamping (30g–400g)
- [x] Confidence score (calorie accuracy × budget compliance)
- [x] Explainability: top 5 feature importances per recommendation
- [x] ⚡ Inference time: 22.7ms

### 3.5 Flask Microservice
- [x] `ml-service/app.py` — Flask API on port 5001
- [x] `POST /recommend`, `GET /health`, `GET /model-info`
- [x] Request validation + CORS
- [x] Tested: 25-yr-old male, muscle gain → 3,106 cal/day, LKR 8,820/week, 84.2% confidence

---

## Phase 4: Backend Integration (Week 9–10)

### 4.1 ML Service Client (Node.js → Python)
- [x] Create `backend/services/mlService.js`
- [x] Implement `getMLRecommendation(userProfile, livePrices)` — HTTP POST to Python service
- [x] Add timeout handling (10 second max)
- [x] Add retry logic (1 retry on connection refused/timeout)
- [x] Add fallback: if ML service is down, fall back to Gemini-only generation

### 4.2 AI Service (ML-First Pipeline with Gemini)
- [x] Create `backend/services/aiService.js` with two-layer pipeline:
  1. Fetch member profile from MongoDB
  2. Fetch live prices from `foodPrices` collection
  3. Call Python ML service with profile + prices
  4. If ML succeeds → call **Gemini 2.0 Flash** with constrained prompt (foods locked, only write recipes)
  5. If ML fails → Gemini-only fallback generates full plan
- [x] Merge ML data (macros, cost, confidence) + Gemini data (recipes, descriptions)
- [x] Save merged plan to MongoDB with new `shoppingList` structure

### 4.3 Price Watcher Service
- [x] Create `backend/services/priceWatcherService.js`
- [x] On price update → find all active `dietPlans` containing that `foodId`
- [x] Recalculate `shoppingList.currentTotal`
- [x] Set `priceChanged: true` flag
- [x] If `currentTotal > budget * 1.10` → log budget alert

### 4.4 Diet Plan API Updates
- [x] Update `POST /api/diet-plans/generate` to use ML-first pipeline
- [x] `GET /api/diet-plans/:id/cost` — recalculate with live prices
- [ ] `POST /api/diet-plans/:id/regenerate` — regenerate with current prices
- [x] Response includes ML confidence scores and generation method

---

## Phase 5: Frontend Integration (Week 11–12)

### 5.1 Diet Plan Generation UI
- [x] 4-stage ML generation progress (Analyzing profile → Scoring foods → Building plan → Adding recipes)
- [x] Loading skeleton with icons per stage (Brain, Salad, ShoppingCart, ChefHat)
- [x] AI confidence banner showing ML confidence %, model version, and generation method
- [x] Budget slider updated to LKR (1,000–15,000 range)

### 5.2 Shopping List UI
- [x] Redesigned shopping list with live price per item
- [x] `priceAtGeneration` vs `currentPrice` with ↑↓ trend indicators (red/green)
- [x] Weekly cost summary with budget comparison
- [x] "Prices have changed" indicator when `priceChanged: true`
- [x] Export shopping list with prices as text file
- [x] Category-grouped items with emoji labels

### 5.3 Budget & ML Integration
- [x] Real API calls to backend (`/api/diet-plans/generate`)
- [x] Mock fallback when backend is unreachable
- [x] Updated `DietPlanDisplay.tsx` to support both old weekly and new ML days format
- [x] Updated `MealCard.tsx` — shows cost per meal, food items with quantities, dual-format macros
- [x] All TypeScript types updated for ML pipeline data (AIMetadata, MacroSplit, ShoppingListData)

---

## Phase 6: Admin Panel (Week 11–12)

### 6.1 ML Model Dashboard
- [x] New admin page: `/admin/ml-dashboard`
- [x] Show: model version, training date, accuracy metrics (RMSE, R²)
- [x] Feature importance chart — horizontal bar chart per feature
- [x] ML vs Gemini fallback generation count with progress bar
- [x] KPI cards: R² score, inference time, budget compliance %, total plans

### 6.2 Food Prices Management
- [x] New admin page: `/admin/food-prices`
- [x] List all foods with current prices, last updated, store tags, source
- [x] Category filter tabs + search bar
- [x] Scraper status bar: last run, items scraped, errors, next run
- [x] "Trigger Scrape Now" and "Add Food" buttons
- [x] Edit button per food row

### 6.3 Scraper Review Queue
- [x] New admin page: `/admin/scraper-review`
- [x] Food items with fuzzy-match suggestions + confidence %
- [x] Non-food / unrecognized items section
- [x] Accept match, re-link via dropdown, or dismiss per item
- [x] Pending/Matched/Ignored stats cards

### 6.4 Admin Routing & Navigation
- [x] Wired all 3 routes in `App.tsx` under `/admin/*`
- [x] Added **AI & Data** section to `AdminSidebar.tsx` (Brain, Tag, ScanSearch icons)

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
