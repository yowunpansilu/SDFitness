## 👥 Individual Member Breakdown

---

### 👤 Member 1: Withana
**Domain**: Screaper and Food Price, Workout Generation

#### Frontend Components (`frontend/src/components/`)
- `workout/WorkoutSessionPlayer.tsx`, `WorkoutCard.tsx`, `WorkoutTimer.tsx`

#### Frontend & Admin Pages (`frontend/src/pages/` & `admin-pannel/src/pages/`)
- Frontend: `dashboard/Workouts.tsx`, `workouts/WorkoutDetail.tsx`, `members/MemberList.tsx`, `MemberDetail.tsx`, `MemberForm.tsx`, `dashboard/Dashboard.tsx`
- Admin Panel: `scraper/ScraperReview.tsx`, `prices/FoodPrices.tsx`, `workouts/WorkoutReviewModal.tsx`, `workouts/WorkoutTemplates.tsx`, `members/MembersList.tsx`, `MemberDetail.tsx`, `AddMember.tsx`

#### Backend Database Models (`backend/models/`)
- `FoodPrice.js`, `FoodAlias.js`, `ExternalProduct.js`, `PriceHistory.js`, `PriceLog.js`, `ScraperReviewItem.js`, `WorkoutTemplate.js`, `WorkoutLog.js`, `Member.js`

#### Backend Controllers (`backend/controllers/`)
- `workoutController.js`, `memberController.js`

#### Backend Routes (`backend/routes/`)
- `scraperRoutes.js`, `priceRoutes.js`, `workoutRoutes.js`, `memberRoutes.js`

#### AIML Contribution — Scraper & Matching Pipeline (Phase 2.1 + 2.2)

**Phase 2.1 — Data Scrapers (Done)**
Real-time price scraping from Keells Super API. Unmatched items pushed to review queue. Integration with Atlas `products` collection.

**Phase 2.2 — Fuzzy Matching Bridge v2 (Done)**
Migrated all food aliases from hardcoded Python dict to Atlas `foodaliases` collection (180 aliases seeded via `seed_food_aliases.js` — upsert-safe). Implemented `config_loader.py` to load brand lists, thresholds, and UOM maps from Atlas `scraper_config` at runtime (fail-fast on missing keys). Refactored `food_aliases.py` into three zero-hardcoding classes:
- `Sanitizer` — strips Unicode artifacts and brand prefixes (brand list from Atlas)
- `WeightExtractor` — regex UOM detection with gram conversion (multiplier map from Atlas)
- `WaterfallMatcher` — 3-stage pipeline: Exact match → Fuzzy (thefuzz) → Category-scoped relaxed fuzzy

New files: `backend/seed_food_aliases.js`, `ml-service/scrapers/config_loader.py`, `ml-service/tests/test_bridge_v2.py` (22/22 tests pass). Public API `fuzzy_match_to_food_id()` unchanged — no call-site edits required.


---

### 👤 Member 2: Matharaarachchi
**Domain**: Authentication, Diet Plan, Analytics

#### Frontend Components (`frontend/src/components/`)
- `auth/AuthLayout.tsx`, `LoginForm.tsx`, `RegisterForm.tsx`, `ForgotPasswordForm.tsx`, `ResetPasswordForm.tsx`
- `diet/DietPlanWizard.tsx`, `MealCard.tsx`, `ShoppingList.tsx`

#### Frontend & Admin Pages (`frontend/src/pages/` & `admin-pannel/src/pages/`)
- Frontend Auth: `auth/Login.tsx`, `Register.tsx`, `ForgotPassword.tsx`, `ResetPassword.tsx`
- Frontend Dashboard: `dashboard/DietPlans.tsx`, `dashboard/diet/DailyPlan.tsx`, `WeeklyPlan.tsx`, `GroceryList.tsx`, `MealRecipe.tsx`
- Admin Panel (ML & Analytics): `ml/MLDashboard.tsx`, `analytics/AnalyticsDashboard.tsx`

#### Backend Database Models (`backend/models/`)
- `User.js`, `DietPlan.js`

#### Backend Routes (`backend/routes/`)
- `authRoutes.js`, `dietPlanRoutes.js`, `analyticsRoutes.js`

#### Backend Services (`backend/services/`)
- `mlService.js`, `aiService.js`

#### AIML Contribution — Optimization Architect

**`recommender.py` — Planning Engine (Inference layer)**
Owns the full `DietRecommender` class that drives diet plan generation at runtime. Implements `_calculate_tdee()` using Mifflin-St Jeor formula for accurate per-user energy targets, and `_get_macro_targets()` which maps goals (`weight_loss`, `muscle_gain`, `strength` etc.) to protein/carb/fat splits. The `_build_meal_plan()` method runs a 7-day greedy selection loop with a virtual pantry and bulk-buying simulation to minimize waste and enforce LKR weekly budget compliance. Implements confidence scoring as a blend of calorie accuracy (60%) and budget compliance (40%), returning structured JSON consumed by the GPT formatting layer in `aiService.js`.

---

### 👤 Member 3: Illham
**Domain**: Trainer Management, Admin Dashboard, Attendance

#### Frontend Components (`frontend/src/components/`)
- `attendance/AttendanceCalendar.tsx`, `AttendanceStats.tsx`, `CheckInControl.tsx`, `QRCodeCard.tsx`

#### Frontend & Admin Pages (`frontend/src/pages/` & `admin-pannel/src/pages/`)
- Frontend: `trainers/TrainerList.tsx`, `TrainerDetail.tsx`, `TrainerForm.tsx`, `dashboard/AttendancePage.tsx`
- Admin Panel: `trainers/TrainersList.tsx`, `TrainerDetail.tsx`, `TrainerForm.tsx`, `dashboard/AdminDashboard.tsx`

#### Backend Database Models (`backend/models/`)
- `Trainer.js`, `AttendanceRecord.js`

#### Backend Controllers (`backend/controllers/`)
- `trainerController.js`, `attendanceController.js`

#### Backend Routes (`backend/routes/`)
- `trainerRoutes.js`, `attendanceRoutes.js`

#### AIML Contribution — Data Scientist

**`train.py` — Steps 1 & 2: Data Generation**
Implements `generate_synthetic_users()` which produces 5,000 realistic user profiles using NumPy with age (18–65), weight (45–120 kg), height (150–195 cm), activity multipliers, and vegetarian/vegan flags drawn from realistic population distributions. Implements `generate_training_pairs()` which computes a composite preference score per (user, food) pair from five soft signals: goal alignment, budget fit, protein density, fiber bonus, and variety noise — no lookup table, purely learned. Produces `training_data.csv` as a reproducible audit trail. This data is the foundation that makes the Gradient Boosting model learn contextual food preferences rather than fixed nutritional rules.

---

### 👤 Member 4: Kodithuwakku
**Domain**: Messaging, Notifications, Payment Management, Memberships

#### Frontend Components (`frontend/src/components/`)
- `messaging/ChatWindow.tsx`, `ConversationList.tsx`, `MessageBubble.tsx`, `MessageInput.tsx`
- `notifications/NotificationBell.tsx`, `NotificationItem.tsx`, `NotificationSheet.tsx`
- `membership/FreezeDialog.tsx`, `MembershipStatusCard.tsx`, `PlanCard.tsx`, `UpgradeDialog.tsx`, `UsageStats.tsx`

#### Frontend & Admin Pages (`frontend/src/pages/` & `admin-pannel/src/pages/`)
- Frontend: `dashboard/MessagesPage.tsx`, `dashboard/NotificationSettings.tsx`, `dashboard/MembershipDetails.tsx`, `MembershipPlans.tsx`, `BillingOverview.tsx`
- Admin Panel: `plans/MembershipPlans.tsx`, `payments/PaymentsList.tsx`, `PaymentDetail.tsx`, `PaymentForm.tsx`

#### Backend Database Models (`backend/models/`)
- `Message.js`, `Conversation.js`, `Notification.js`, `MembershipPlan.js`, `Subscription.js`, `Payment.js`

#### Backend Controllers (`backend/controllers/`)
- `communicationController.js`, `membershipController.js`, `paymentController.js`

#### Backend Routes (`backend/routes/`)
- `communicationRoutes.js`, `membershipRoutes.js`, `paymentRoutes.js`

#### AIML Contribution — MLOps Engineer

**`train.py` — Steps 3 & 4: Model Training & Packaging**
Owns `train_model()` which trains a `GradientBoostingRegressor` (200 estimators, depth 5, 0.8 subsample) on the 22-feature (user × food) matrix. Evaluates on an 80/20 train-test split and outputs RMSE, MAE, and R² to `training_metrics.json` — verified R² of 0.963 with dynamic price signals. Implements `plot_feature_importance()` using seaborn to visualize top-15 features saved to `feature_importance.png`. Serializes the trained model + feature names + version tag via joblib to `diet_model.pkl`. Owns the Docker containerization (`Dockerfile`, `requirements.txt`) that packages the entire ml-service — Flask API, scraper, and model — into an isolated container with health checks and port mappings for the wider microservice stack.

---

### 👤 Member 5: Kamsha
**Domain**: Gym Classes, Booking, Equipment Inventory

#### Frontend Components (`frontend/src/components/`)
- `classes/BookingDialog.tsx`, `ClassCard.tsx`, `ClassScheduleCalendar.tsx`

#### Frontend & Admin Pages (`frontend/src/pages/` & `admin-pannel/src/pages/`)
- Frontend: `classes/ClassSchedule.tsx`, `dashboard/ClassSchedule.tsx`, `MyBookings.tsx`, `equipment/EquipmentList.tsx`, `EquipmentDetail.tsx`
- Admin Panel: `classes/ClassSchedule.tsx`, `ClassDetail.tsx`, `ClassForm.tsx`, `equipment/EquipmentInventory.tsx`, `EquipmentForm.tsx`, `EquipmentDetail.tsx`

#### Backend Database Models (`backend/models/`)
- `Class.js`, `Booking.js`, `Equipment.js`

#### Backend Controllers (`backend/controllers/`)
- `classController.js`, `equipmentController.js`

#### Backend Routes (`backend/routes/`)
- `classRoutes.js`, `bookingRoutes.js`, `equipmentRoutes.js`

#### AIML Contribution — Nutrition Logic

**`recommender.py` — `_score_foods()` (Inference Core)**
Owns the food-scoring loop inside `DietRecommender` that runs ML inference for every candidate food at request time. Builds a 22-dimension feature vector per food (user biometrics + macro targets + food nutritional profile + price + one-hot category flags), calls `model.predict()`, then applies a post-inference budget penalty: estimates the cost of sourcing 25% of daily calories from each food and penalises proportionally if it exceeds the per-meal budget allowance. This ensures the Gradient Boosting model's theoretical scores are always grounded in real LKR affordability — a critical bridge between ML output and real-world usability.

---

### 👤 Member 6: Anoja
**Domain**: Daily progress, progress, weight tracking , feedback

#### Frontend Components (`frontend/src/components/`)
- `dashboard/ActivityTimeline.tsx`, `StatsCard.tsx`, `UpcomingClasses.tsx`
- `profile/HealthMetricsTab.tsx`, `profile/WeightHistoryTable.tsx`, `profile/GoalsTab.tsx`, `profile/PersonalInfoTab.tsx`, `profile/PreferencesTab.tsx`

#### Frontend & Admin Pages (`frontend/src/pages/` & `admin-pannel/src/pages/`)
- Frontend: `dashboard/MemberProgress.tsx`, `dashboard/Profile.tsx`
- Admin Panel: `feedback/FeedbackList.tsx`, `feedback/FeedbackDetail.tsx`

#### Backend Database Models (`backend/models/`)
- `DailyProgress.js`, `BodyMeasurement.js`, `WeightGoal.js`, `WeightLog.js`, `Feedback.js`

#### Backend Controllers (`backend/controllers/`)
- `progressController.js`, `weightController.js`, `feedbackController.js`

#### Backend Routes (`backend/routes/`)
- `progressRoutes.js`, `weightRoutes.js`, `feedbackRoutes.js`

#### AIML Contribution — Integration & Ethics

**`app.py` — Flask API Gateway**
Owns the Flask microservice entry point that exposes all ML capabilities as REST endpoints: `POST /recommend` (full diet plan generation), `POST /fuzzy-match` (bridge v2 alias testing), `GET /model-info` (version + metrics + feature importances), `POST /scrape` + `GET /scrape/status` (background scrape job orchestration via threading), and `GET /barcode/<code>` (Open Food Facts lookup). Handles `DietRecommender` lazy-loading with graceful degraded-mode responses if model is not yet trained.

**`bias_analysis.py` — Fairness Suite**
Implements the bias detection suite that audits the trained model for demographic fairness across gender (male/female) and age bands (18–30, 31–50, 51–65). Runs stratified inference across synthetic cohorts and flags if any subgroup's average recommendation score deviates beyond an acceptable threshold — ensuring the diet recommender does not systematically under-serve any demographic group.

---

###  Orphaned Modules
These components and modules do not currently align with any member's assigned domain under the new structure. These are group work. 

#### System Settings
- **Admin Pages**: `settings/Settings.tsx`, `settings/EmailTemplates.tsx`, `settings/GeneralSettings.tsx`, `settings/NotificationSettings.tsx`, `settings/RolesPermissions.tsx`
- **Frontend Pages**: `settings/Settings.tsx`
- **Database Models**: `Setting.js`, `Admin.js`
- **Routes**: `settingsRoutes.js`

