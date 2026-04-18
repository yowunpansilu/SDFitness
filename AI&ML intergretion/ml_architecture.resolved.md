# SDFitness: Custom ML Model Architecture
## "Brain + Formatter" Integration Design

---

## The Core Concept

Instead of sending user data directly to GPT and hoping for a good plan, we build a **two-layer AI pipeline**:

```
User Input → [Layer 1: Custom ML Model] → Structured Meal Recommendations → [Layer 2: GPT] → Polished Plan → User
```

| Layer | What it does | Who built it |
|---|---|---|
| **ML Model (Brain)** | Selects *what* foods, portions, and combinations match the user's goals, budget, and constraints — based on learned patterns from data | Your team |
| **GPT (Formatter)** | Takes those structured recommendations and writes them into beautiful, natural-language meals with recipes and instructions | OpenAI |

This is academically solid because the **intelligence is yours** — GPT is just a writing tool.

---

## Layer 1: The Custom ML Model

### What Exactly Does it Predict?

Given a user profile, the model outputs a **structured meal selection** — essentially a list of:
- Food items and portion sizes for each meal slot (breakfast, lunch, dinner, snacks)
- Estimated calories and macros per food
- Estimated cost per food item

This is a **multi-output recommendation problem**, not generation. You're matching users to food patterns, like Spotify matching users to songs.

### Recommended Algorithm: Content-Based + Collaborative Filtering Hybrid

**Phase 1 — Content-Based Filtering (start here):**
Recommend foods based on the *properties* of what the user needs:
- Calories needed → find foods with matching calorie density
- Budget → filter by estimated cost
- Dietary preference → filter tags (vegetarian, vegan, etc.)
- Macros needed → score food combinations by how well they hit protein/carb/fat targets

**Phase 2 — Collaborative Filtering (layer on top):**
"Users with similar profiles rated these meal patterns highly" → recommend those patterns.
This requires some user feedback data (ratings), which you collect over time and use to improve the model.

### Simpler Starter: Gradient Boosting Regressor

For the proposal/MVP, a **Gradient Boosting model** (XGBoost or scikit-learn's GBM) is excellent:
- Predict the "best macro score" for a food given a user profile
- Rank all candidate foods and pick the top selections per meal slot
- Explainable: you can show feature importances
- Fast to train and deploy

```
Input Features:
  - User: age, weight, height, gender, activity_level
  - Goal: weight_loss / muscle_gain / endurance (encoded)
  - Budget: daily_budget_usd
  - Preferences: is_vegetarian, is_vegan, is_gluten_free
  - Metrics: TDEE (calculated), target_calories, target_protein

Output:
  - Score for each candidate food item (ranking)
  - Top N foods selected per meal slot
```

---

## Layer 2: GPT as Formatter

Once the ML model selects foods and portions, you send them to GPT with a **much smaller, constrained prompt**:

```
"Given these specific ingredients and portions: [WHAT ML MODEL PICKED],
write a meal plan with:
- A creative meal name
- Step-by-step cooking instructions
- Estimated prep/cook time
- A motivating description

Format as JSON. Do not change the ingredients or portions."
```

**Why this is better than pure GPT:**
- ✅ GPT can't hallucinate a different budget (inputs are fixed)
- ✅ GPT can't ignore dietary restrictions (ML model already filtered)
- ✅ GPT calls are smaller → cheaper (you're not asking it to think, just write)
- ✅ Your ML model's nutritional accuracy is verifiable and testable

---

## Training Data: What You Need and Where to Get It

### Dataset 1: Food & Nutrition Data (Foundation)
**USDA FoodData Central** — Free, official, comprehensive
- URL: https://fdc.nal.usda.gov/
- Download: Full dataset CSV (~150MB)
- Contains: 300,000+ foods with calories, protein, carbs, fat, fiber per 100g

**Open Food Facts** — Free, community-maintained
- URL: https://world.openfoodfacts.org/data
- Contains: Branded foods with nutrient data and estimated prices
- Good for Sri Lankan/South Asian food items

**Kaggle Nutrition Datasets:**
- "Food Nutritional Values" dataset
- "Diet Recommendations" dataset
- Search: https://www.kaggle.com/datasets?search=nutrition+diet

### Dataset 2: Meal Plans (For "Learning to Rank")
- Kaggle: "Meal Planning" datasets
- FAO (UN Food and Agriculture) food composition tables — includes South Asian foods
- **Crucial Academic Distinction:** The ML model should NOT just memorize a hardcoded TDEE formula. The MERN stack calculates the raw math (macros * price). The ML model is trained as a **Ranking Algorithm** (Learning to Rank) that optimizes for human preferences: variety (e.g., not eating chicken 3 times a day), complementary flavor profiles, and historical ratings from similar users. This proves it's a true AI model, not just a complex lookup table.

### Dataset 3: User Feedback (Collected In-App)
Once deployed, collect star ratings on generated plans. This feeds your collaborative filtering layer over time.

---

## System Architecture: How It Integrates

```
┌─────────────────────────────────────────────────────────────┐
│                    MERN Stack (existing)                     │
│  React Frontend  →  Node.js/Express API  →  MongoDB         │
└─────────────────────────┬───────────────────────────────────┘
                          │  HTTP (when diet plan requested)
                          ▼
┌─────────────────────────────────────────────────────────────┐
│           Python ML Microservice (NEW)                       │
│           Flask / FastAPI  •  Port 5001                      │
│                                                             │
│  POST /recommend                                            │
│  Input:  { user_profile, goals, budget, preferences }       │
│  Output: { selected_foods[], meal_slots[], macros, cost }   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ML Pipeline                                         │   │
│  │  1. Preprocess user input (scale, encode)            │   │
│  │  2. Filter food database by dietary constraints     │   │
│  │  3. Run GBM model → score all candidate foods       │   │
│  │  4. Select top foods per meal slot                   │   │
│  │  5. Validate: macros hit? budget met?               │   │
│  │  6. Return structured recommendation JSON           │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────────┘
                          │  Structured recommendation
                          ▼
              Node.js calls GPT (smaller prompt)
                          │  Formatted meal plan JSON
                          ▼
                    Stored in MongoDB
                    Sent to React frontend
```

### New Files

```
SDFitness/
├── ml-service/                        ← NEW Python microservice
│   ├── app.py                         ← Flask API entry point
│   ├── model/
│   │   ├── train.py                   ← Training script
│   │   ├── recommender.py             ← Inference logic
│   │   └── diet_model.pkl             ← Saved trained model
│   ├── data/
│   │   ├── foods.csv                  ← USDA/Open Food Facts data
│   │   └── preprocessing.py          ← Feature engineering
│   ├── notebooks/
│   │   └── model_exploration.ipynb   ← Jupyter notebook for experiments
│   └── requirements.txt              ← Python deps (scikit-learn, pandas, flask)
│
├── backend/                          ← existing Node.js (modified)
│   └── services/
│       ├── aiService.js              ← MODIFIED: calls ML service first
│       └── mlService.js              ← NEW: HTTP client to Python service
```

---

## The Diet Plan Request Flow (Step by Step)

```
1. Member clicks "Generate Diet Plan" on React frontend
2. React sends POST /api/diet-plans/generate (existing endpoint)
3. Node.js backend receives request with user profile + budget + goals

4. [NEW] Node.js pulls live food prices from MongoDB (`foodPrices` collection)
   Node.js calls Python ML microservice passing prices in the payload (prevents circular HTTP dependency):
   POST http://localhost:5001/recommend
   Body: { user_metrics, goals, budget, dietary_prefs, live_prices_dict }
   
5. ML microservice runs the model:
   a. Filter 300,000+ foods → ~2,000 matching dietary prefs
   b. Score each food for this user's goals
   c. Select 4-6 foods per meal slot (B/L/D + snacks × 7 days)
   d. Validate: macros ≈ target? total cost ≤ budget?
   e. Return structured_recommendation.json

6. Node.js receives structured recommendation
7. Node.js calls GPT with CONSTRAINED prompt:
   "Format these specific foods into a meal plan: [ML output]"
   
8. **UX Optimization (Latency):** Node.js uses **Server-Sent Events (SSE)** to stream the GPT response back to the React frontend day-by-day.
9. GPT generates Day 1 → Node.js merges with ML data → streams to UI (User sees Day 1 instantly)
10. GPT generates Day 2... up to Day 7.
11. Once completed, Node.js saves the final merged plan to MongoDB.
```

## Technical Stack for ML Service

```
Python 3.10+
pandas               # Data manipulation
scikit-learn         # GBM model (GradientBoostingRegressor)
xgboost              # Alternative GBM (often better performance)
flask                # REST API to serve the model
numpy                # Numerical operations
joblib               # Save/load trained model
jupyter              # For exploration notebooks
matplotlib/seaborn   # For training visualizations
```