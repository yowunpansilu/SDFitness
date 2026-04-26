# SDFitness Codebase Architecture & File Glossary

This document provides a comprehensive list of all files across the four main services of the SDFitness application: Client UI (`frontend`), Admin UI (`admin-pannel`), Backend ([backend](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/ml-service/scrapers/price_scraper.py#246-269)), and ML Service (`ml-service`).

## 1. Client UI (`frontend`)
The React + Vite frontend for gym members.
* [main.tsx](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/frontend/src/main.tsx): Application entry point that renders the React tree.
* [App.tsx](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/frontend/src/App.tsx): Root component setting up routing and layout structures.
* [App.css](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/frontend/src/App.css): Global styles.
* [index.css](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/frontend/src/index.css): Tailwind CSS global definitions.
* [lib/api/axios.ts](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/frontend/src/lib/api/axios.ts): Configured Axios instance with JWT interceptors for backend requests.
* `lib/contexts/AuthContext.tsx`: React Context for managing member authentication state.
* [lib/contexts/ThemeContext.tsx](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/admin-pannel/src/lib/contexts/ThemeContext.tsx): React Context for dark/light mode preference.
* [hooks/use-toast.ts](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/admin-pannel/src/hooks/use-toast.ts): Hook for displaying UI notifications.
* [lib/utils.ts](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/admin-pannel/src/lib/utils.ts): Utility functions (e.g., classname merging for Tailwind).

**Pages:**
* [pages/auth/Login.tsx](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/frontend/src/pages/auth/Login.tsx): Login page for members.
* `pages/auth/Register.tsx`: Registration page for new members.
* [pages/dashboard/Dashboard.tsx](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/frontend/src/pages/dashboard/Dashboard.tsx): Main dashboard landing page showing summary stats.
* [pages/dashboard/diet/DailyPlan.tsx](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/frontend/src/pages/dashboard/diet/DailyPlan.tsx): UI displaying meals and calories for a specific day.
* `pages/dashboard/diet/DietPlanDisplay.tsx`: High-level view of the user's active diet plan.
* [pages/dashboard/diet/MealRecipe.tsx](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/frontend/src/pages/dashboard/diet/MealRecipe.tsx): Detailed view for a specific meal, showing ML-selected ingredients and Gemini-generated recipes.
* [pages/dashboard/diet/WeeklyPlan.tsx](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/frontend/src/pages/dashboard/diet/WeeklyPlan.tsx): Overview layout for the 7-day diet structure.

**Components:**
* *Auth:* [components/auth/AuthLayout.tsx](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/frontend/src/components/auth/AuthLayout.tsx), [LoginForm.tsx](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/frontend/src/components/auth/LoginForm.tsx), [RegisterForm.tsx](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/frontend/src/components/auth/RegisterForm.tsx), [ForgotPasswordForm.tsx](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/frontend/src/components/auth/ForgotPasswordForm.tsx), [ResetPasswordForm.tsx](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/frontend/src/components/auth/ResetPasswordForm.tsx) — Authentication UI blocks.
* *Diet:* [components/diet/DietPlanWizard.tsx](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/frontend/src/components/diet/DietPlanWizard.tsx) (Handles the multi-step flow to request an ML diet plan), [MealCard.tsx](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/frontend/src/components/diet/MealCard.tsx) (Displays meal summary), [ShoppingList.tsx](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/frontend/src/components/diet/ShoppingList.tsx) (Displays aggregated grocery list).
* *Dashboard:* [components/dashboard/ActivityTimeline.tsx](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/frontend/src/components/dashboard/ActivityTimeline.tsx), [StatsCard.tsx](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/frontend/src/components/dashboard/StatsCard.tsx), [UpcomingClasses.tsx](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/frontend/src/components/dashboard/UpcomingClasses.tsx) — Dashboard widgets.
* *Layout:* [components/layout/DashboardLayout.tsx](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/frontend/src/components/layout/DashboardLayout.tsx), [Header.tsx](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/frontend/src/components/layout/Header.tsx), [Sidebar.tsx](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/frontend/src/components/layout/Sidebar.tsx) — Main structural UI components.
* *Membership:* [components/membership/FreezeDialog.tsx](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/frontend/src/components/membership/FreezeDialog.tsx), [MembershipStatusCard.tsx](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/frontend/src/components/membership/MembershipStatusCard.tsx), [PlanCard.tsx](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/frontend/src/components/membership/PlanCard.tsx), [UpgradeDialog.tsx](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/frontend/src/components/membership/UpgradeDialog.tsx), [UsageStats.tsx](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/frontend/src/components/membership/UsageStats.tsx) — UI for managing gym subscriptions.
* *Classes:* [components/classes/BookingDialog.tsx](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/frontend/src/components/classes/BookingDialog.tsx), [ClassCard.tsx](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/frontend/src/components/classes/ClassCard.tsx), [ClassScheduleCalendar.tsx](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/frontend/src/components/classes/ClassScheduleCalendar.tsx) — UI for gym class booking.
* *Attendance:* [components/attendance/AttendanceCalendar.tsx](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/frontend/src/components/attendance/AttendanceCalendar.tsx), [AttendanceStats.tsx](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/frontend/src/components/attendance/AttendanceStats.tsx), [CheckInControl.tsx](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/frontend/src/components/attendance/CheckInControl.tsx), [QRCodeCard.tsx](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/frontend/src/components/attendance/QRCodeCard.tsx) — UI for gym check-ins.
* *Messaging:* [components/messaging/ChatWindow.tsx](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/frontend/src/components/messaging/ChatWindow.tsx), [ConversationList.tsx](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/frontend/src/components/messaging/ConversationList.tsx), [MessageBubble.tsx](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/frontend/src/components/messaging/MessageBubble.tsx), [MessageInput.tsx](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/frontend/src/components/messaging/MessageInput.tsx) — UI for trainer-member chat.
* *Notifications:* [components/notifications/NotificationBell.tsx](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/frontend/src/components/notifications/NotificationBell.tsx), [NotificationItem.tsx](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/frontend/src/components/notifications/NotificationItem.tsx), [NotificationSheet.tsx](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/frontend/src/components/notifications/NotificationSheet.tsx) — Alert popups.
* *Profile:* [components/profile/GoalsTab.tsx](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/frontend/src/components/profile/GoalsTab.tsx), [HealthMetricsTab.tsx](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/frontend/src/components/profile/HealthMetricsTab.tsx), [PersonalInfoTab.tsx](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/frontend/src/components/profile/PersonalInfoTab.tsx), [PreferencesTab.tsx](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/frontend/src/components/profile/PreferencesTab.tsx) — User profile management view.
* *UI Components:* `components/ui/*` (Button, Card, Input, Label, Select, Tabs, Dialog, Avatar, Calendar, Checkbox, Progress, Skeleton, Toast, etc) — Reusable stateless Tailwind view components.

## 2. Admin UI (`admin-pannel`)
The React + Vite frontend for gym administrators and trainers.
* [main.tsx](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/frontend/src/main.tsx): Application entry point.
* [App.tsx](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/frontend/src/App.tsx): Root router and layout for admin routes.
* [index.css](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/frontend/src/index.css): Tailwind definitions.
* [lib/api/axios.ts](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/frontend/src/lib/api/axios.ts): Configured Axios instance with admin JWT interceptors to the backend.
* [lib/stores/authStore.ts](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/frontend/src/lib/stores/authStore.ts): Zustand store for admin session state.
* [lib/stores/settingsStore.ts](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/admin-pannel/src/lib/stores/settingsStore.ts): Zustand store for global admin dashboard preferences.
* [hooks/use-toast.ts](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/admin-pannel/src/hooks/use-toast.ts): UI notification hook.

**Pages:**
* [pages/auth/Login.tsx](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/frontend/src/pages/auth/Login.tsx): Login portal for staff/admins.
* [pages/dashboard/AdminDashboard.tsx](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/admin-pannel/src/pages/dashboard/AdminDashboard.tsx): High-level overview of gym operations.
* `pages/members/MemberList.tsx` & [MemberDetail.tsx](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/admin-pannel/src/pages/members/MemberDetail.tsx) & `MemberForm.tsx`: CRUD pages for managing gym member properties.
* `pages/trainers/TrainerList.tsx` & `TrainerDetail.tsx` & `TrainerForm.tsx`: CRUD pages for gym trainers.
* [pages/classes/ClassSchedule.tsx](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/admin-pannel/src/pages/classes/ClassSchedule.tsx) & [ClassDetail.tsx](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/admin-pannel/src/pages/classes/ClassDetail.tsx) & [ClassForm.tsx](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/admin-pannel/src/pages/classes/ClassForm.tsx): CRUD pages for scheduling classes.
* `pages/equipment/EquipmentList.tsx` & [EquipmentDetail.tsx](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/admin-pannel/src/pages/equipment/EquipmentDetail.tsx) & [EquipmentForm.tsx](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/admin-pannel/src/pages/equipment/EquipmentForm.tsx): Inventory management pages.
* `pages/plans/PlanList.tsx` & `PlanForm.tsx`: Membership pricing plan management.
* [pages/analytics/AnalyticsDashboard.tsx](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/admin-pannel/src/pages/analytics/AnalyticsDashboard.tsx): Data visualization reporting page.
* `pages/settings/Settings.tsx`: Gym global configuration.

**Components:**
* *Layout:* [components/layout/AdminLayout.tsx](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/admin-pannel/src/components/layout/AdminLayout.tsx), [AdminHeader.tsx](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/admin-pannel/src/components/layout/AdminHeader.tsx), [AdminSidebar.tsx](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/admin-pannel/src/components/layout/AdminSidebar.tsx).
* *Shared:* [components/shared/ImageUpload.tsx](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/admin-pannel/src/components/shared/ImageUpload.tsx).
* *UI Components:* `components/ui/*` (Button, Card, Input, Table, Tabs, Switch, Dialog, Sheet, Scroll-area, etc) — Reusable Tailwind components.

## 3. Backend ([backend](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/ml-service/scrapers/price_scraper.py#246-269))
The Node.js + Express API server acting as the central hub.
* [server.js](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/backend/server.js): Entry point that boots the Express server, connects to MongoDB, and registers routes.
* [package.json](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/backend/package.json) & [package-lock.json](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/backend/package-lock.json): Node.js dependency manifests.
* [config/db.js](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/backend/config/db.js): Initializes Mongoose connection to the MongoDB cluster.
* [middleware/auth.js](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/backend/middleware/auth.js): JWT validation middleware to protect sensitive endpoints from unauthorized access.

**Routes (APIs):**
* [routes/authRoutes.js](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/backend/routes/authRoutes.js): Handles POST logins/registrations and issues JWTs. (Interacts with: [User.js](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/backend/models/User.js), [Member.js](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/backend/models/Member.js) models)
* [routes/dietPlanRoutes.js](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/backend/routes/dietPlanRoutes.js): Exposes GET/POST endpoints for ML plan generation and retrieval. (Interacts with: Frontend API calls, [aiService.js](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/backend/services/aiService.js), [DietPlan.js](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/backend/models/DietPlan.js) model)
* [routes/priceRoutes.js](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/backend/routes/priceRoutes.js): Exposes GET endpoint to fetch local food prices for the ML model or frontend display. (Interacts with [FoodPrice.js](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/backend/models/FoodPrice.js) model)
* [routes/scraperRoutes.js](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/backend/routes/scraperRoutes.js): Exposes admin endpoints to pull live grocery prices or trigger manual scraping. (Interacts with: internal ML Scraper service via HTTP).

**Models (Database schemas):**
* [models/User.js](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/backend/models/User.js): Base account schema (Admin, Trainer, Member).
* [models/Member.js](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/backend/models/Member.js): Gym-specific metrics (weight, height, goals).
* [models/DietPlan.js](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/backend/models/DietPlan.js): Schema structure for generated diet plans (days, meals, macros, Gemini instructions, shopping list).
* [models/FoodPrice.js](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/backend/models/FoodPrice.js): Stores current price of ingredients (per kg/gram) inside MongoDB.
* [models/PriceLog.js](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/backend/models/PriceLog.js): Tracks historical market prices of foods for analytics.
* [models/ScraperReviewItem.js](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/backend/models/ScraperReviewItem.js): Schema logging web scraper approvals/anomalies (e.g. price jumped 500%).

**Services (Business Logic):**
* [services/aiService.js](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/backend/services/aiService.js): Formats member data, calls [mlService.js](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/backend/services/mlService.js), and maps ML recommendations to **Google Gemini API** for recipes/cooking instructions, before saving to [DietPlan.js](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/backend/models/DietPlan.js). (Interacts with: ML Service [recommend](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/ml-service/app.py#63-99), Gemini AI API).
* [services/mlService.js](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/backend/services/mlService.js): Wrapper client that performs actual HTTP calls to the Python microservice. (Interacts with: Python [app.py](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/ml-service/app.py) endpoints).
* [services/priceWatcherService.js](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/backend/services/priceWatcherService.js): Utility to watch for unexpected market price fluctuations.

**Scripts & Tests:**
* [scripts/seedFoodPrices.js](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/backend/scripts/seedFoodPrices.js) & [scripts/seedPrices.js](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/backend/scripts/seedPrices.js): Populates initial local Sri Lankan food prices into the DB.
* [seed_admin.js](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/seed_admin.js) & [seed_temp.js](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/backend/seed_temp.js): Creates base gym admins for fresh DBs.
* [tests/generateDiet.js](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/backend/tests/generateDiet.js): CLI script mimicking a frontend request to generate a diet plan and trace results.
* [tests/integration.test.js](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/backend/tests/integration.test.js): Jest-style test suite validating backend API endpoints and fallback logics.

## 4. ML Service (`ml-service`)
The Python Flask microservice performing gradient boosting diet inference and web scraping.
* [app.py](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/ml-service/app.py): Flask API entry point. Exposes endpoints for the Node.js backend to access. (Interacts with: Node.js [mlService.js](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/backend/services/mlService.js), [DietRecommender](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/ml-service/model/recommender.py#40-382) class).
* [requirements.txt](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/ml-service/requirements.txt): Python package dependencies (flask, pandas, scikit-learn, etc).
* [Dockerfile](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/backend/Dockerfile): Container configuration for isolated deployment.

**Model Files:**
* [model/train.py](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/ml-service/model/train.py): Script to train the Gradient Boosting model on macro datasets.
* [model/recommender.py](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/ml-service/model/recommender.py): Contains [DietRecommender](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/ml-service/model/recommender.py#40-382) class. Loads the [.pkl](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/ml-service/model/diet_model.pkl) model, scores candidate foods based on user physics and constraints, calculates portions, and builds a 7-day plan with cost optimizations. (Interacts with: [diet_model.pkl](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/ml-service/model/diet_model.pkl), inference API requests).
* [model/diet_model.pkl](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/ml-service/model/diet_model.pkl): The compiled, serialized Scikit-learn GradientBoostingRegressor weights.
* [model/training_metrics.json](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/ml-service/model/training_metrics.json): Records accuracy/MSE metrics resulting from the last [train.py](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/ml-service/model/train.py) run.
* [model/feature_importance.png](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/ml-service/model/feature_importance.png): Visual graph of which physical markers influence the model most.
* [notebooks/bias_analysis.py](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/ml-service/notebooks/bias_analysis.py): Jupyter-style script analyzing if the ML model incorrectly discriminates against age/gender.

**Scrapers (Data Gathering):**
* [scrapers/run_scraper.py](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/ml-service/scrapers/run_scraper.py): Scheduler orchestrating scraping jobs.
* [scrapers/price_scraper.py](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/ml-service/scrapers/price_scraper.py): ReBrowser Playwright script to stealthily scrape real-time market prices from local grocery chains (e.g., Keells). (Interacts with: Sri Lankan supermarket websites).
* [scrapers/open_food_facts.py](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/ml-service/scrapers/open_food_facts.py): Fetches exact nutritional breakdown for foods via barcode. (Interacts with: Open Food Facts API).
* [scrapers/food_aliases.py](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/ml-service/scrapers/food_aliases.py): Mapping dictionary recognizing different terms (e.g., "Dhal" -> "Red Lentils") to bridge scraped data and model ids.
