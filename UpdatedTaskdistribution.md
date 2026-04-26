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

#### AIML Contribution
Data Scrapers for data gathering and updating the price database. Real price integration.

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
`recommender.py` (Planning engine): 7-day meal plan generation, variety rotation, and budget optimization.

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
`train.py` (Steps 1 & 2): Synthetic user generation and the scoring logic that teaches the model preferences.

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
`train.py` (Steps 3 & 4), `Dockerfile`, `requirements.txt`: Model training, performance metrics, visualization, and containerization.

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
`recommender.py` (Inference core): TDEE/Macro calculations and model-driven food scoring logic.

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
`app.py`, `bias_analysis.py`: Flask API endpoints and the bias detection suite (Gender/Age fairness).

---

### ❓ Unassigned / Orphaned Modules
These components and modules do not currently align with any member's assigned domain under the new structure.

#### System Settings
- **Admin Pages**: `settings/Settings.tsx`, `settings/EmailTemplates.tsx`, `settings/GeneralSettings.tsx`, `settings/NotificationSettings.tsx`, `settings/RolesPermissions.tsx`
- **Frontend Pages**: `settings/Settings.tsx`
- **Database Models**: `Setting.js`, `Admin.js`
- **Routes**: `settingsRoutes.js`

