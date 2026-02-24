# SDFitness — AI/ML Integration

> **Deployment-ready** | Python ML Service + Node.js Backend + React Frontend

---

## Architecture

```
                    ┌─────────────────────────────────────────┐
                    │           SDFitness Platform             │
                    └─────────────────────────────────────────┘
                                        │
              ┌─────────────────────────┼─────────────────────────┐
              ▼                         ▼                         ▼
     ┌────────────────┐       ┌──────────────────┐      ┌─────────────────┐
     │  React Frontend│       │  Node.js Backend  │      │ Python ML Service│
     │  (Vite + TS)   │◄─────►│  (Express + Mongo)│◄────►│  (Flask + GBM)   │
     │  :3000         │       │  :5000            │      │  :5001           │
     └────────────────┘       └──────────────────┘      └─────────────────┘
                                       │                          │
                               ┌───────▼───────┐        ┌────────▼────────┐
                               │   MongoDB      │        │  Gemini 2.0     │
                               │   :27017       │        │  Flash API      │
                               └───────────────┘        └─────────────────┘
```

### Diet Plan Generation Pipeline (ML-First)

```
POST /api/diet-plans/generate
         │
         ▼
  1. Fetch Member Profile    ← MongoDB
         │
         ▼
  2. Fetch Live Food Prices  ← MongoDB (FoodPrice collection)
         │
         ▼
  3. ML Recommendation       ← Python Flask (GBM model, ~22ms)
     - Scores 20 Sri Lankan foods
     - Builds 7-day plan with variety rotation
     - Returns confidence score
         │
         ├─── ML Failed? ──► Gemini-only fallback
         │
         ▼
  4. Gemini 2.0 Flash       ← Google AI API
     - Adds meal names and recipes
     - Cooking instructions
     - Foods are LOCKED (ML chose them)
         │
         ▼
  5. Save DietPlan           → MongoDB
     - Shopping list with prices
     - ML metadata (confidence, version, inference time)
```

---

## Quick Start

### Prerequisites
- Docker & Docker Compose
- OR: Node.js 20+, Python 3.11+, MongoDB 7

### With Docker (recommended)

```bash
# Clone the repo
git clone <repo-url>
cd SDFitness

# Set your Gemini API key
echo "GEMINI_API_KEY=your_key_here" > .env

# Start all services
docker-compose up --build

# Services will be available at:
#   Frontend:   http://localhost:3000
#   Backend:    http://localhost:5000
#   ML Service: http://localhost:5001
```

### Without Docker (development)

```bash
# 1. Start MongoDB
mongod --dbpath ./data

# 2. Start Python ML service
cd ml-service
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python model/train.py   # Train the model (first run only)
python app.py           # Starts on :5001

# 3. Start Node.js backend
cd backend
cp .env.example .env    # Fill in GEMINI_API_KEY
npm install
npm run seed            # Seed food prices
npm run dev             # Starts on :5000

# 4. Start frontend
cd frontend
npm install
npm run dev             # Starts on :3000
```

---

## ML Model

| Attribute | Value |
|---|---|
| Algorithm | Gradient Boosting Regressor (scikit-learn) |
| Task | Learning-to-Rank food items for a user |
| Training Samples | 10,000 synthetic user-food pairs |
| R² Score | **0.963** |
| RMSE | 0.029 |
| Inference Time | ~22ms per 7-day plan |
| Foods Database | 20 core Sri Lankan foods |

### Features Used
1. `goal_alignment` — How well a food matches the user's fitness goal
2. `budget_fit` — Food cost vs user budget
3. `protein_density` — Protein per gram
4. `calorie_density` — Calories per gram vs TDEE requirement
5. `variety_score` — Penalises repetition across the week
6. `fiber_content` — Dietary fiber content
7. `price_per_gram` — Absolute cost efficiency
8. `bmi_factor` — Adjusts for user BMI

### Retraining the Model

```bash
cd ml-service
python model/train.py
# Outputs: model/diet_model.pkl, model/training_metrics.json, model/feature_importance.png
```

---

## API Reference

### Backend (Node.js — :5000)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Backend health check |
| POST | `/api/diet-plans/generate` | Generate ML diet plan `{ memberId }` |
| GET | `/api/diet-plans/:id` | Fetch a saved plan |
| GET | `/api/diet-plans/:id/cost` | Recalculate live cost |
| GET | `/api/prices` | List all food prices |
| POST | `/api/prices` | Add/update food price |

### ML Service (Python — :5001)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | ML service health + model status |
| GET | `/model-info` | Model version, metrics, feature importance |
| POST | `/recommend` | Get food recommendations for a user |

**POST /recommend payload:**
```json
{
  "user_profile": {
    "age": 25, "weight_kg": 75, "height_cm": 175,
    "gender": "male", "goal": "muscle_gain",
    "activity_level": "moderate", "dietary_preferences": [],
    "allergies": [], "budget_weekly_lkr": 5000, "tdee": 2500
  },
  "live_prices": { "rice": 220, "chicken_breast": 1450 }
}
```

---

## Environment Variables

### Backend `.env`
```env
MONGO_URI=mongodb://localhost:27017/sdfitness
PORT=5000
ML_SERVICE_URL=http://localhost:5001
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
```

---

## Testing

```bash
# Integration tests (requires all services running)
cd backend
npm test

# What's tested:
# ✅ Backend & ML service health checks
# ✅ ML recommendation returns valid plan in < 2s
# ✅ Vegan user never receives meat recommendations
# ✅ Plan cost stays within stated budget
# ✅ Graceful fallback when ML service is unreachable
# ✅ Price watcher propagates price changes correctly
```

---

## Admin Panel

Navigate to `/admin` for the admin panel. Key AI/ML sections:

- **ML Dashboard** `/admin/ml-dashboard` — Model metrics, feature importance, generation stats
- **Food Prices** `/admin/food-prices` — Manage the 20-food database, trigger scraper, edit prices
- **Scraper Review** `/admin/scraper-review` — Review and link unmatched scraped products

---

## Project Structure

```
SDFitness/
├── backend/                  # Node.js + Express API
│   ├── models/               # Mongoose schemas (FoodPrice, Member, DietPlan, ...)
│   ├── routes/               # API route handlers
│   ├── services/
│   │   ├── mlService.js      # Python ML client (with retry + fallback)
│   │   ├── aiService.js      # ML-first → Gemini pipeline
│   │   └── priceWatcherService.js
│   ├── tests/
│   │   └── integration.test.js
│   └── Dockerfile
│
├── ml-service/               # Python Flask ML microservice
│   ├── data/foods_db.py      # 20 Sri Lankan foods nutritional data
│   ├── model/
│   │   ├── train.py          # GBM training pipeline
│   │   └── recommender.py    # Inference engine (22ms)
│   ├── app.py                # Flask API
│   └── Dockerfile
│
├── frontend/                 # React + Vite + TypeScript
│   └── src/
│       ├── pages/
│       │   ├── dashboard/    # Member-facing diet plan pages
│       │   └── admin/        # Admin panel (ml/, prices/, scraper/)
│       └── components/diet/  # DietPlanWizard, Display, ShoppingList, MealCard
│
├── docker-compose.yml        # Full stack deployment
└── AI&ML integration/
    └── AIML_Tasks.md         # Project task tracker
```

---

*Built for SDFitness — Personalized diet plans powered by custom ML + Gemini AI*
