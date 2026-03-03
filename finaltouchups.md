# Final Touchups - Implementation Plan

To achieve the 35% component completion and "Database Design for Individual Components" requirement for the *Progress 1* evaluation, we need to implement the following missing database models, backend API routes, and frontend CRUD page scaffolds.

## 1. Backend Database Schemas (Mongoose Models)
We need to add the following files to `backend/models/`:

- [ ] `Trainer.js` (Member 1) - Schema: user reference, specialization, experience, bio, availability.
- [ ] `Message.js` and `Conversation.js` (Member 4) - Schema: participants, sender, receiver, content, timestamps.
- [ ] `Notification.js` (Member 4) - Schema: user, title, message, read_status.
- [ ] `Class.js` (Member 5) - Schema: name, description, trainer (ref), schedule, capacity.
- [ ] `Booking.js` (Member 5) - Schema: user, class (ref), status.
- [ ] `Equipment.js` (Member 5) - Schema: name, category, status, lastMaintenance.
- [ ] `MembershipPlan.js` (Member 6) - Schema: name, price, duration, features.
- [ ] `Subscription.js` (Member 6) - Schema: user, plan (ref), startDate, endDate, status.
- [ ] `AttendanceRecord.js` (Member 6) - Schema: user, checkInTime, checkOutTime.

## 2. Minimal Backend Routes and Controllers
To demonstrate the APIs are working structure-wise, we will create basic CRUD route and controller files for the new models.

- [ ] `trainerRoutes.js` and `trainerController.js`
- [ ] `memberRoutes.js` and `memberController.js`
- [ ] `communicationRoutes.js` and `communicationController.js`
- [ ] `classRoutes.js` and `equipmentRoutes.js` with controllers
- [ ] `membershipRoutes.js` and `attendanceRoutes.js` with controllers

## 3. Frontend UI Scaffold (React Pages)
We will create the missing page components with placeholder UI to ensure routing works and mock data is shown, satisfying the "UI Mockups" and 35% progress requirements in code.

**Member 1**:
- [ ] `frontend/src/pages/trainers/TrainerList.tsx`
- [ ] `frontend/src/pages/trainers/TrainerDetail.tsx`
- [ ] `frontend/src/pages/trainers/TrainerForm.tsx`

**Member 2**:
- [ ] `frontend/src/pages/analytics/AnalyticsDashboard.tsx`

**Member 3 & 4**:
- [ ] `frontend/src/pages/members/MemberList.tsx`
- [ ] `frontend/src/pages/members/MemberDetail.tsx`
- [ ] `frontend/src/pages/members/MemberForm.tsx`

**Member 5**:
- [ ] `frontend/src/pages/equipment/EquipmentList.tsx`
- [ ] `frontend/src/pages/equipment/EquipmentDetail.tsx`
- [ ] `frontend/src/pages/classes/ClassSchedule.tsx`

**Member 6**:
- [ ] `frontend/src/pages/settings/Settings.tsx`

**Global**:
- [ ] Update frontend routing (likely `App.tsx` or `routes.tsx`) to include these routes.
