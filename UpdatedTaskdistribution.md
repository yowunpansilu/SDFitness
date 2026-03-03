# SDFitness - Updated Task Distribution & Progress 1 Evaluation Guide

This document maps each team member's **complete** set of responsibilities — frontend components/pages, backend models/controllers/routes, and AI/ML contributions — to the marking criteria in `Progress eval.txt`.

---

## 🌎 Global Deliverables (Group Marks - 8%)
| Deliverable | Weight | Status | File |
|---|---|---|---|
| SWOT Analysis | 4% | ✅ Done | `SWOT.md` |
| System Diagrams | 4% | ✅ Done | `Architecture.md` |

---

## 👥 Individual Member Breakdown

---

### 👤 Member 1: Withana
**Domain**: Dashboard, User Profiles, Gym Trainers

#### Frontend Components (`frontend/src/components/`)
- `dashboard/ActivityTimeline.tsx`, `StatsCard.tsx`, `UpcomingClasses.tsx`
- `profile/GoalsTab.tsx`, `HealthMetricsTab.tsx`, `PersonalInfoTab.tsx`, `PreferencesTab.tsx`

#### Frontend Pages (`frontend/src/pages/`)
- `trainers/TrainerList.tsx`, `TrainerDetail.tsx`, `TrainerForm.tsx`

#### Backend Database Model (`backend/models/`)
- `Trainer.js`

#### Backend Controller (`backend/controllers/`)
- `trainerController.js`

#### Backend Routes (`backend/routes/`)
- `trainerRoutes.js`

#### AIML Contribution
Data Scrapers for data gathering and updating the price database. Real price integration.

---

### 👤 Member 2: Matharaarachchi
**Domain**: Authentication, Diet Plan, Analytics

#### Frontend Components (`frontend/src/components/`)
- `auth/AuthLayout.tsx`, `LoginForm.tsx`, `RegisterForm.tsx`, `ForgotPasswordForm.tsx`, `ResetPasswordForm.tsx`
- `diet/DietPlanWizard.tsx`, `MealCard.tsx`, `ShoppingList.tsx`

#### Frontend Pages (`frontend/src/pages/`)
- `auth/Login.tsx`, `Register.tsx`, `ForgotPassword.tsx`, `ResetPassword.tsx`
- `analytics/AnalyticsDashboard.tsx`
- `dashboard/DietPlans.tsx`, `dashboard/diet/DailyPlan.tsx`, `WeeklyPlan.tsx`, `GroceryList.tsx`, `MealRecipe.tsx`

#### Backend Database Models (`backend/models/`)
- `User.js`, `DietPlan.js`, `FoodPrice.js`

#### Backend Routes (`backend/routes/`)
- `authRoutes.js`, `dietPlanRoutes.js`

#### Backend Services (`backend/services/`)
- `mlService.js`, `aiService.js`

#### AIML Contribution — MLOps Engineer
`train.py` (Steps 3 & 4), `Dockerfile`, `requirements.txt`: Model training, performance metrics, visualization, and containerization.

---

### 👤 Member 3: Illham
**Domain**: Member Management, Admin Dashboard

#### Frontend Pages (`frontend/src/pages/`)
- `members/MemberList.tsx`, `MemberDetail.tsx`, `MemberForm.tsx`
- `dashboard/Dashboard.tsx` (Admin Overview)
- `analytics/AnalyticsDashboard.tsx`

#### Backend Database Model (`backend/models/`)
- `Member.js`

#### Backend Controller (`backend/controllers/`)
- `memberController.js`

#### Backend Routes (`backend/routes/`)
- `memberRoutes.js`

#### AIML Contribution — Data Scientist
`train.py` (Steps 1 & 2): Synthetic user generation and the scoring logic that teaches the model preferences.

---

### 👤 Member 4: Kodithuwakku
**Domain**: Messaging, Notifications, Member Management

#### Frontend Components (`frontend/src/components/`)
- `messaging/ChatWindow.tsx`, `ConversationList.tsx`, `MessageBubble.tsx`, `MessageInput.tsx`
- `notifications/NotificationBell.tsx`, `NotificationItem.tsx`, `NotificationSheet.tsx`

#### Frontend Pages (`frontend/src/pages/`)
- `dashboard/MessagesPage.tsx`, `NotificationSettings.tsx`
- `members/MemberList.tsx`, `MemberDetail.tsx`, `MemberForm.tsx`

#### Backend Database Models (`backend/models/`)
- `Message.js`, `Conversation.js`, `Notification.js`

#### Backend Controller (`backend/controllers/`)
- `communicationController.js`

#### Backend Routes (`backend/routes/`)
- `communicationRoutes.js`

#### AIML Contribution — Optimization Architect
`recommender.py` (Planning engine): 7-day meal plan generation, variety rotation, and budget optimization.

---

### 👤 Member 5: Kamsha
**Domain**: Gym Classes, Equipment Inventory

#### Frontend Components (`frontend/src/components/`)
- `classes/BookingDialog.tsx`, `ClassCard.tsx`, `ClassScheduleCalendar.tsx`

#### Frontend Pages (`frontend/src/pages/`)
- `classes/ClassSchedule.tsx`
- `equipment/EquipmentList.tsx`, `EquipmentDetail.tsx`
- `dashboard/ClassSchedule.tsx`, `MyBookings.tsx`

#### Backend Database Models (`backend/models/`)
- `Class.js`, `Booking.js`, `Equipment.js`

#### Backend Controllers (`backend/controllers/`)
- `classController.js`, `equipmentController.js`

#### Backend Routes (`backend/routes/`)
- `classRoutes.js`, `equipmentRoutes.js`

#### AIML Contribution — Nutrition Logic
`recommender.py` (Inference core): TDEE/Macro calculations and model-driven food scoring logic.

---

### 👤 Member 6: Anoja
**Domain**: Memberships, Attendance, Settings

#### Frontend Components (`frontend/src/components/`)
- `membership/FreezeDialog.tsx`, `MembershipStatusCard.tsx`, `PlanCard.tsx`, `UpgradeDialog.tsx`, `UsageStats.tsx`
- `attendance/AttendanceCalendar.tsx`, `AttendanceStats.tsx`, `CheckInControl.tsx`, `QRCodeCard.tsx`

#### Frontend Pages (`frontend/src/pages/`)
- `dashboard/MembershipDetails.tsx`, `MembershipPlans.tsx`, `BillingOverview.tsx`
- `dashboard/AttendancePage.tsx`
- `settings/Settings.tsx`
- Feedback — *Not Done*

#### Backend Database Models (`backend/models/`)
- `MembershipPlan.js`, `Subscription.js`, `AttendanceRecord.js`

#### Backend Controllers (`backend/controllers/`)
- `membershipController.js`, `attendanceController.js`

#### Backend Routes (`backend/routes/`)
- `membershipRoutes.js`, `attendanceRoutes.js`

#### AIML Contribution — Integration & Ethics
`app.py`, `bias_analysis.py`: Flask API endpoints and the bias detection suite (Gender/Age fairness).

---

## 🎯 Presentation Checklist (Per Member)
1. **Database Design (3%)**: Open your assigned model file(s) and explain the schema fields and references.
2. **Component Progress ~35% (4%)**: Run the app (`npm run dev`) and navigate to your assigned pages/components.
3. **UI Mock-ups (4%)**: Show the working UI scaffold or Figma mock-up for your assigned screens.
4. **AIML Contribution**: Open your assigned Python file and explain your specific logic contribution.
5. **Communication (3%)** & **Professionalism (2%)**: Practice your 3-minute speaking slot.
