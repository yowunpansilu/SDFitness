# SDFitness — Team Parts Distribution
**Project:** Gym Management System with AI Diet Plan Generator  
**Group:** AI-01-G08 | Stream: Artificial Intelligence  
**Course:** IT2021 AIML Project – 2026 Jan

---

## Team Members

| # | Reg. No. | Name | Role |
|---|---|---|---|
| 01 | IT24102008 | Withana W.Y.P | Backend API & AI Service Architect |
| 02 | IT24101252 | Matharaarachchi D.C.M | Member Frontend & Diet UI |
| 03 | IT24103530 | Ilham M.M | Admin Panel & AI Monitoring |
| 04 | IT24100732 | Kodituwakku S.D | Payment, Notifications & Budget AI |
| 05 | IT24100697 | Kamsha S | ML Model Owner & Activity Tracking |
| 06 | IT24103087 | Anojaa S | Analytics, Security & AI Optimization |

---

## Member 01 — Withana W.Y.P (IT24102008)
### Role: Backend API & AI Service Architect

### 🤖 AI/ML Integration Contribution
The backend is the **central control tower** for the entire AI pipeline. Member 01 owns the Node.js bridge that makes the ML model actually work end-to-end.

- **`backend/services/mlService.js`** — HTTP client that calls the Python Flask ML microservice (`POST /recommend`). Includes 10-second timeout, 1-retry logic on failure, and a health check (`GET /health`) to determine if the ML model is up.
- **`backend/services/aiService.js`** — The **two-layer ML-first pipeline**:
  1. Fetches member profile from MongoDB
  2. Fetches live food prices from the `foodPrices` collection
  3. Calls the Python ML service with user profile + live prices
  4. If ML succeeds → calls Gemini 2.0 Flash with a **constrained prompt** (foods are already chosen by ML, Gemini only writes recipes)
  5. If ML service is down → Gemini-only fallback generates full plan
  6. Merges ML data (macros, cost, confidence score) with Gemini data (recipes, descriptions)
  7. Saves the merged plan to MongoDB with `shoppingList` structure
- **Prompt Engineering** — Designed the constrained Gemini prompt so it cannot hallucinate ingredients or exceed budget (foods are pre-selected by ML model)
- **SSE Streaming Architecture** — Backend uses Server-Sent Events to stream the Gemini response day-by-day to the frontend (user sees Day 1 instantly while Days 2–7 are generating)

### 🗄️ CRUD & Database Responsibilities
| File | Type | Responsibility |
|---|---|---|
| `backend/server.js` | Core | Express server setup, middleware, route mounting |
| `backend/config/db.js` | Core | MongoDB connection setup |
| `backend/models/Member.js` | Model | Member schema with health metrics, preferences, goals |
| `backend/models/DietPlan.js` | Model | Diet plan schema with `shoppingList` + `priceAtGeneration` + ML metadata |
| `backend/models/FoodPrice.js` | Model | Food price schema with `foodId`, `price_lkr`, `store`, `source` |
| `backend/models/PriceLog.js` | Model | Price change history log |
| `backend/models/ScraperReviewItem.js` | Model | Scraper unmatched item queue |
| `backend/routes/dietPlanRoutes.js` | Routes | `POST /generate`, `GET /:id/cost`, full diet plan CRUD |
| `backend/routes/priceRoutes.js` | Routes | `GET /prices`, `GET /prices/:foodId`, `POST /prices`, `PUT /prices/:foodId`, batch pricing |
| `backend/routes/scraperRoutes.js` | Routes | Scraper trigger, status, and review queue endpoints |
| `backend/services/priceWatcherService.js` | Service | Price change watcher (see Member 04) |
| `backend/scripts/seedFoodPrices.js` | Script | Seeds 20 core Sri Lankan foods into MongoDB |
| `backend/tests/integration.test.js` | Tests | 8 end-to-end integration tests |

### 🔑 How This Contributes to the Project
Member 01's backend is what connects every other member's work. Without the ML service bridge and the two-layer AI pipeline, the diet plan generator is just a forms page. The `aiService.js` is the core academic contribution — it ensures the **custom ML model is the intelligence**, while Gemini is only the formatter.

---

## Member 02 — Matharaarachchi D.C.M (IT24101252)
### Role: Member Frontend & Diet UI

### 🤖 AI/ML Integration Contribution
Member 02 owns the **user-facing AI experience** — how members see and interact with the ML-generated diet plans.

- **`frontend/src/components/diet/DietPlanWizard.tsx`** — 4-stage ML generation progress indicator: "Analyzing Profile → Scoring Foods → Building Plan → Adding Recipes". Shows the AI process as it happens.
- **`frontend/src/components/diet/DietPlanDisplay.tsx`** — Displays the ML-generated diet plan. Shows **AI Confidence Banner** with ML confidence %, model version (`v1.0`), and generation method (ML-first vs Gemini fallback). Supports both old weekly format and new ML `days[]` format.
- **`frontend/src/components/diet/MealCard.tsx`** — Shows cost per meal, food items with quantities, dual-format macros (breakfast, lunch, dinner, snacks per day). Displays **"Why we chose this"** explainability data from ML feature importances.
- **`frontend/src/components/diet/ShoppingList.tsx`** — Redesigned with live price per item, `priceAtGeneration` vs `currentPrice` with ↑↓ trend indicators (red/green), weekly cost summary vs budget, "Prices have changed" warning, category-grouped items with emoji labels, and **Export as text file** feature.
- **Budget Slider** — Updated to LKR range (1,000–15,000) for Sri Lankan context
- **Real API Integration** — All diet components call the real backend API (`/api/diet-plans/generate`) with mock fallback when backend is unreachable
- **TypeScript Types** — Maintained all types for ML pipeline data: `AIMetadata`, `MacroSplit`, `ShoppingListData`

### 🖥️ UI Layout & CRUD Responsibilities
| File | Type | Responsibility |
|---|---|---|
| `frontend/src/pages/auth/` | Pages (4 files) | Login, Register, ForgotPassword, ResetPassword pages |
| `frontend/src/pages/dashboard/` | Pages (12 files) | Member dashboard with all sub-pages |
| `frontend/src/components/auth/` | Components (5) | `AuthLayout`, `LoginForm`, `RegisterForm`, `ForgotPasswordForm`, `ResetPasswordForm` |
| `frontend/src/components/dashboard/` | Components (3) | `StatsCard`, `ActivityTimeline`, `UpcomingClasses` |
| `frontend/src/components/diet/` | Components (4) | `DietPlanWizard`, `DietPlanDisplay`, `MealCard`, `ShoppingList` |
| `frontend/src/components/profile/` | Components (4) | `PersonalInfoTab`, `HealthMetricsTab`, `GoalsTab`, `PreferencesTab` |
| `frontend/src/components/layout/` | Components (3) | `DashboardLayout`, `Header`, `Sidebar` |
| `frontend/src/App.tsx` | Routing | Frontend route configuration |
| `frontend/src/index.css` | Styles | Global CSS + dark mode + design tokens |

### 🔑 How This Contributes to the Project
Member 02's work is the primary reason members can **see and trust the AI**. The ML confidence score, explainability panel, and live price tracking make the AI transparent — which is a core academic requirement. Without this UI, the ML model's outputs are invisible to end users.

---

## Member 03 — Ilham M.M (IT24103530)
### Role: Admin Panel & AI Monitoring Dashboard

### 🤖 AI/ML Integration Contribution
Member 03 owns the **admin-side AI oversight** — giving gym administrators visibility into how the ML model is performing.

- **`admin-pannel/src/pages/ml/MLDashboard.tsx`** — The AI monitoring hub:
  - Model version, training date, accuracy metrics (RMSE = 0.029, R² = 0.963)
  - Feature importance horizontal bar chart (which user features drive food selection most)
  - ML vs Gemini fallback generation count with progress bar
  - KPI cards: R² score, inference time (22.7ms), budget compliance %, total plans generated
  - Side-by-side comparison: ML plan vs GPT-only plan across 4 accuracy metrics
- **`admin-pannel/src/pages/prices/FoodPrices.tsx`** — Food price management page:
  - Lists all 20+ foods with current LKR prices, last updated, store tags, source
  - Category filter tabs + search bar
  - Scraper status bar (last run, items scraped, errors, next scheduled run)
  - "Trigger Scrape Now" and "Add Food" buttons
  - Edit button per food row (inline price update)
- **`admin-pannel/src/pages/scraper/ScraperReview.tsx`** — AI data quality review:
  - Lists unmatched scraped food items with fuzzy-match suggestions + confidence %
  - Non-food / unrecognized items section
  - Accept match, re-link via dropdown, or dismiss per item
  - Pending / Matched / Ignored stats cards
- **Admin Sidebar AI Section** — Added "AI & Data" section to `AdminSidebar.tsx` with Brain, Tag, ScanSearch icons and routes to all 3 AI pages

### 🖥️ UI Layout & CRUD Responsibilities
| File | Type | Responsibility |
|---|---|---|
| `admin-pannel/src/pages/members/MembersList.tsx` | Page | View & search all gym members |
| `admin-pannel/src/pages/members/MemberDetail.tsx` | Page | View individual member + their AI diet plans |
| `admin-pannel/src/pages/members/AddMember.tsx` | Page | Add new member form (with CRUD) |
| `admin-pannel/src/pages/trainers/TrainersList.tsx` | Page | View all trainers |
| `admin-pannel/src/pages/trainers/TrainerDetail.tsx` | Page | Trainer profile + assigned classes |
| `admin-pannel/src/pages/trainers/TrainerForm.tsx` | Page | Add/Edit trainer form (with CRUD) |
| `admin-pannel/src/pages/dashboard/AdminDashboard.tsx` | Page | Admin overview dashboard |
| `admin-pannel/src/components/layout/` | Components (3) | `AdminLayout`, `AdminHeader`, `AdminSidebar` |
| `admin-pannel/src/App.tsx` | Routing | All admin routes, including `/admin/ml-dashboard`, `/admin/food-prices`, `/admin/scraper-review` |

### 🔑 How This Contributes to the Project
Member 03's ML Dashboard is what makes the project **academically provable**. Without it, the ML model's accuracy metrics exist only in a JSON file. The dashboard exposes the model's R², RMSE, feature importances, and fallback rates to administrators — demonstrating that the team fully understands and monitors their AI system's behavior.

---

## Member 04 — Kodituwakku S.D (IT24100732)
### Role: Payment, Notifications & Budget AI

### 🤖 AI/ML Integration Contribution
Member 04 connects **financial data to the AI pipeline** — making the budget constraint a real, enforced part of the ML model's decision-making.

- **`backend/services/priceWatcherService.js`** — The **Budget Intelligence Service**:
  - On any food price update → finds all active `dietPlans` containing that `foodId`
  - Recalculates `shoppingList.currentTotal` using new prices
  - Sets the `priceChanged: true` flag on affected plans (this triggers the UI warning in Member 02's ShoppingList)
  - If `currentTotal > budget × 1.10` → logs a budget breach alert (triggers notifications)
- **Budget Constraint in AI Prompts** — Implements the cost estimation logic passed to the ML service:
  - `diet_budget` object structure (`amount`, `currency`, `period`) injected into the ML payload
  - Budget validation: ML model must return plans where `total_cost ≤ budget`
  - Budget breach notifications sent via Nodemailer when food prices push a plan over budget
- **AI-Triggered Notifications**:
  - "New diet plan ready" email notification (Nodemailer)
  - "Weekly plan reminder" push notification
  - "Prices have changed — your meal plan may now exceed budget" alert
  - Membership renewal reminders with personalized content

### 🖥️ UI Layout & CRUD Responsibilities
| File | Type | Responsibility |
|---|---|---|
| `admin-pannel/src/pages/payments/PaymentsList.tsx` | Page | View all payment transactions |
| `admin-pannel/src/pages/payments/PaymentDetail.tsx` | Page | Individual payment record |
| `admin-pannel/src/pages/payments/PaymentForm.tsx` | Page | Process payment form (with CRUD) |
| `admin-pannel/src/pages/plans/MembershipPlans.tsx` | Page | Manage gym membership plans/tiers |
| `frontend/src/components/billing/PaymentHistory.tsx` | Component | Member payment history view |
| `frontend/src/components/billing/PaymentMethods.tsx` | Component | Manage saved payment methods |
| `frontend/src/components/membership/MembershipStatusCard.tsx` | Component | Current membership status |
| `frontend/src/components/membership/PlanCard.tsx` | Component | Membership plan card with pricing |
| `frontend/src/components/membership/UpgradeDialog.tsx` | Component | Membership upgrade modal |
| `frontend/src/components/membership/FreezeDialog.tsx` | Component | Freeze membership modal |
| `frontend/src/components/membership/UsageStats.tsx` | Component | Usage statistics for membership |
| `frontend/src/components/notifications/NotificationBell.tsx` | Component | Notification bell + badge |
| `frontend/src/components/notifications/NotificationItem.tsx` | Component | Single notification item |
| `frontend/src/components/notifications/NotificationSheet.tsx` | Component | Notification dropdown panel |

### 🔑 How This Contributes to the Project
The budget is the **#1 unique selling point** of the entire system ("personalized diet plans that respect your budget"). Member 04 is what makes that promise real — by watching prices in real time, recalculating costs, and alerting members when their budget is at risk. Without the price watcher, the ML model's budget guarantee expires the moment food prices change at the supermarket.

---

## Member 05 — Kamsha S (IT24100697)
### Role: ML Model Owner & Activity Tracking

### 🤖 AI/ML Integration Contribution
Member 05 **built the entire custom ML model** — the centerpiece of the academic contribution. This is the most direct AI/ML work in the project.

- **`ml-service/data/foods_db.py`** — Food nutrition database: 20 Sri Lankan core foods with USDA nutrition data (calories, protein, carbs, fat, fiber per 100g), LKR prices, and dietary flags (vegetarian, vegan, gluten-free)
- **`ml-service/model/train.py`** — Model training script:
  - Gradient Boosting Regressor (200 estimators, depth 5, scikit-learn)
  - 23-feature input vector: user metrics + food nutrition + category one-hot encoding + budget
  - Output: Ranking score (0.0–1.0) per food per user profile
  - Training data: 5,000 synthetic users × 10 candidate foods = 50,000 training pairs
  - Learning-to-Rank: score combines `goal_alignment`, `budget_fit`, `protein_density`, `fiber`, `variety`
  - Result: **Test R² = 0.963, RMSE = 0.029** (saved to `training_metrics.json`)
  - Feature importance chart saved as `feature_importance.png`
- **`ml-service/model/recommender.py`** — The `DietRecommender` inference class:
  - Filters foods by dietary constraints (vegan never gets meat)
  - Scores all candidate foods using the trained GBM model
  - Builds a 7-day meal plan with variety rotation (different foods per day, no repetition)
  - Portion clamping (30g minimum, 400g maximum per food item)
  - Confidence score calculation (calorie accuracy × budget compliance)
  - Explainability: top 5 feature importances per recommendation
  - ⚡ Inference time: **22.7ms**
- **`ml-service/model/diet_model.pkl`** — The saved trained model (1.1 MB)
- **`ml-service/app.py`** — Flask microservice API (port 5001):
  - `POST /recommend` — Run ML inference
  - `GET /health` — Health check with model status
  - `GET /model-info` — Model version, metrics, feature names
  - `POST /scrape` + `GET /scrape/status` — Trigger background price scraper
  - `POST /fuzzy-match` — Test fuzzy product name matching
  - `GET /barcode/<code>` — Open Food Facts barcode lookup
- **`ml-service/scrapers/price_scraper.py`** — Sri Lankan grocery price scraper (Keells, Sathosa)
- **`ml-service/scrapers/food_aliases.py`** — Fuzzy matching dictionary (maps "KEELLS Chicken Drumstick 500g" → `chicken_thigh`)
- **`ml-service/scrapers/open_food_facts.py`** — Barcode product lookup integration
- **`ml-service/Dockerfile`** — Containerized Python ML service
- **`ml-service/requirements.txt`** — Python dependencies (scikit-learn, flask, pandas, numpy, joblib)

**Activity Tracking AI Connection:**
- Activity level (`sedentary` / `lightly_active` / `moderately_active` / `very_active` / `extra_active`) is a direct ML input feature
- Class attendance frequency → feeds `activity_level` classification
- Equipment usage patterns → dynamically adjusts TDEE multiplier before ML inference
- AI-Based Activity Classification: the ML model adjusts calorie and macro targets based on classified activity

### 🖥️ UI Layout & CRUD Responsibilities
| File | Type | Responsibility |
|---|---|---|
| `admin-pannel/src/pages/classes/ClassSchedule.tsx` | Page | View all gym classes with calendar |
| `admin-pannel/src/pages/classes/ClassForm.tsx` | Page | Add/Edit class form (with CRUD) |
| `admin-pannel/src/pages/classes/ClassDetail.tsx` | Page | Class detail with trainer + enrolled members |
| `admin-pannel/src/pages/equipment/EquipmentInventory.tsx` | Page | All equipment with status tracking |
| `admin-pannel/src/pages/equipment/EquipmentForm.tsx` | Page | Add/Edit equipment form (with CRUD) |
| `admin-pannel/src/pages/equipment/EquipmentDetail.tsx` | Page | Equipment detail + maintenance schedule |
| `frontend/src/components/attendance/AttendanceCalendar.tsx` | Component | Member attendance calendar view |
| `frontend/src/components/attendance/AttendanceStats.tsx` | Component | Attendance statistics display |
| `frontend/src/components/attendance/CheckInControl.tsx` | Component | Manual check-in/check-out control |
| `frontend/src/components/attendance/QRCodeCard.tsx` | Component | QR code check-in card for member |
| `frontend/src/components/classes/ClassCard.tsx` | Component | Class card with booking button |
| `frontend/src/components/classes/ClassScheduleCalendar.tsx` | Component | Weekly class schedule view |
| `frontend/src/components/classes/BookingDialog.tsx` | Component | Class booking confirmation modal |
| `frontend/src/components/workout/` | Components (6) | Workout tracking components |

### 🔑 How This Contributes to the Project
Member 05 built what the entire project is named after — the **custom AI model**. The 0.963 R² score, the 22.7ms inference time, the feature importance chart, and the bias analysis output are the primary evidence that this is a real machine learning system, not a GPT wrapper. The ML model is the project's core academic differentiator.

---

## Member 06 — Anojaa S (IT24103087)
### Role: Analytics, Security & AI Optimization

### 🤖 AI/ML Integration Contribution
Member 06 ensures the ML model is **trustworthy, fair, efficient, and production-ready**.

- **Model Evaluation Dashboard** (`admin-pannel/src/pages/analytics/AnalyticsDashboard.tsx`):
  - Displays RMSE, R², budget compliance rate, and macro accuracy in the admin analytics page
  - Training loss curve: train vs validation loss per epoch (bar chart visualization)
  - Side-by-side comparison table: ML model vs Gemini-only across 4 performance metrics
  - KPI cards: avg confidence score, ML success rate, total plans generated
- **Bias Detection** (`ml-service/notebooks/bias_analysis.py`):
  - Dietary preference bias: Vegetarian vs Omnivore, Vegan vs Omnivore
  - Budget range bias: Low (≤3000 LKR) vs Mid vs High budget
  - Gender bias: Male vs Female recommendations
  - Age group bias: Under 25 vs Over 40
  - 8 automated bias checks with a 3% threshold, outputs a JSON bias report
- **Price Analytics** (tab in `AnalyticsDashboard.tsx`):
  - 30-day price trend table per food item with ↑↓ indicators
  - Budget breach counter per food item
  - Store comparison: Sathosa vs Keells — ranked by savings %, cheapest item count
- **AI Performance Optimization**:
  - Response caching strategies for Gemini API calls (prevents re-calling for identical profiles)
  - Fallback API handling: ML down → Gemini-only, Gemini down → cached plan
  - Rate limiting implementation for AI API endpoints
  - Backend data preprocessing pipeline for ML inputs (normalization, encoding)
- **Security & Data Privacy**:
  - `backend/middleware/` — JWT authentication middleware, role-based access control
  - Secure AI API key management (environment variables, never exposed to frontend)
  - Health data privacy: member biometrics encrypted at rest
  - GDPR compliance considerations for stored diet plans and health metrics
  - `SECURITY.md` — Full security documentation (30KB)

### 🖥️ UI Layout & CRUD Responsibilities
| File | Type | Responsibility |
|---|---|---|
| `admin-pannel/src/pages/analytics/AnalyticsDashboard.tsx` | Page | Full analytics dashboard (3-tab: ML, Price, Bias) |
| `admin-pannel/src/pages/settings/Settings.tsx` | Page | Settings hub page |
| `admin-pannel/src/pages/settings/GeneralSettings.tsx` | Page | General gym configuration |
| `admin-pannel/src/pages/settings/NotificationSettings.tsx` | Page | Notification preferences |
| `admin-pannel/src/pages/settings/EmailTemplates.tsx` | Page | Email template management |
| `admin-pannel/src/pages/settings/RolesPermissions.tsx` | Page | Role and permission management |
| `frontend/src/components/messaging/ChatWindow.tsx` | Component | In-app messaging chat window |
| `frontend/src/components/messaging/ConversationList.tsx` | Component | List of message conversations |
| `frontend/src/components/messaging/MessageBubble.tsx` | Component | Individual message bubble |
| `frontend/src/components/messaging/MessageInput.tsx` | Component | Message compose + send input |
| `frontend/src/lib/` | Utilities | Shared utility functions, API clients, auth helpers |
| `backend/middleware/` | Middleware | JWT auth middleware, role-based access |
| `SECURITY.md` | Documentation | Security audit and compliance docs |
| `TESTING.md` | Documentation | Testing strategy documentation |

### 🔑 How This Contributes to the Project
Member 06 is what separates this from a student prototype to a **production-grade AI system**. The bias detection proves the team ethically evaluated their model. The security layer protects sensitive health data. The caching and fallback logic ensures the app still works when the AI services are unavailable. The analytics dashboard gives administrators long-term insight into AI performance trends.

---

## AI/ML Integration Summary — Equal Contribution Overview

| Member | ML Layer They Own | Core AI Artifact |
|---|---|---|
| **M01** Withana | Backend Pipeline (Node.js ↔ Python) | `aiService.js` — the ML-first, Gemini-second pipeline |
| **M02** Matharaarachchi | Frontend AI Experience | `DietPlanDisplay.tsx` + `ShoppingList.tsx` with live price tracking |
| **M03** Ilham | Admin AI Monitoring | `MLDashboard.tsx` — model metrics, feature importance, fallback rates |
| **M04** Kodituwakku | Budget AI & Financial Intelligence | `priceWatcherService.js` — real-time budget breach detection |
| **M05** Kamsha | The ML Model Itself | `train.py` + `recommender.py` — GBM model (R²=0.963) |
| **M06** Anojaa | AI Quality, Ethics & Security | Bias detection + model evaluation + caching optimization |

---

## Project Architecture Overview

```
React Frontend (M02)           Admin Panel (M03)
     │                              │
     └──────────────┬───────────────┘
                    ▼
          Node.js/Express Backend (M01)
          ├── aiService.js (ML-first pipeline)
          ├── mlService.js (Python bridge)
          ├── priceWatcherService.js (M04)
          └── MongoDB
                    │
                    ▼
          Python ML Microservice (M05)
          ├── model/train.py
          ├── model/recommender.py
          ├── scrapers/price_scraper.py
          └── app.py (Flask API :5001)
                    │
          Analytics + Security Layer (M06)
          ├── bias_analysis.py
          ├── AnalyticsDashboard.tsx
          └── JWT middleware + encryption
```

---

*Last Updated: 2026-02-26 | Based on actual implementation in `frontend/`, `backend/`, `ml-service/`, `admin-pannel/`, and `AI&ML intergretion/` directories.*
