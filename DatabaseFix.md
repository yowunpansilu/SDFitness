# SDFitness — Database Integration Task List

> **Goal**: Replace ALL hardcoded/mock data with real MongoDB data. Every page should read from and write to the database via the backend API.

---

## Current State — AFTER FIX

| Layer | Status |
|---|---|
| **Models** (11 files) | ✅ All Mongoose schemas exist |
| **Routes** (11 files) | ✅ All mounted in `server.js` |
| **Controllers** (7 files) | ✅ All have real MongoDB CRUD logic |
| **Frontend Services** (5 files) | ✅ All use real API calls via axios |
| **Admin Panel Pages** (2 pages) | ✅ MembershipPlans + EquipmentInventory use real API |
| **Seed Data** | ✅ `backend/seed.js` populates 12 collections |

---

## Task Checklist

### Phase 1: Backend Controllers (Real CRUD Logic)

- [x] **1.1** `memberController.js` — CRUD for Members using `Member` model
- [x] **1.2** `trainerController.js` — CRUD for Trainers using `Trainer` + `User` models
- [x] **1.3** `classController.js` — CRUD for Classes using `Class` model (with Trainer population)
- [x] **1.4** `equipmentController.js` — CRUD for Equipment using `Equipment` model
- [x] **1.5** `membershipController.js` — CRUD for MembershipPlans + Subscriptions
- [x] **1.6** `attendanceController.js` — Get records, check-in, check-out using `AttendanceRecord`
- [x] **1.7** `communicationController.js` — Messages + Notifications CRUD

### Phase 2: Database Seed Script

- [x] **2.1** Created `backend/seed.js` — Comprehensive seed script that populated:
  - 4 Membership Plans (Basic, Pro, Elite, Student in LKR)
  - 5 Trainers (with User accounts)
  - 10 Members (with User accounts and health metrics)
  - 8 Gym Classes (Yoga, HIIT, Spin, etc.)
  - 15 Equipment items (Treadmill, Dumbbells, etc.)
  - 40 Attendance Records
  - 8 Notifications
  - 2 Conversations with 6 Messages
  - Admin user (admin@sdfitness.com / admin123)

### Phase 3: Frontend Services → Real API Calls

- [x] **3.1** `membershipService.ts` — `GET /api/membership/plans` + `/subscriptions`
- [x] **3.2** `classService.ts` — `GET /api/classes`
- [x] **3.3** `attendanceService.ts` — `GET /api/attendance`, `POST /checkin`, `POST /checkout`
- [x] **3.4** `notificationService.ts` — `GET /api/communications/notifications`
- [x] **3.5** `messageService.ts` — `GET /api/communications/conversations` + `/messages`

### Phase 4: Admin Panel → Real API Calls

- [x] **4.1** `MembershipPlans.tsx` — Fetch plans from API, real create/edit/delete with LKR
- [x] **4.2** `EquipmentInventory.tsx` — Fetch equipment from API

### Phase 5: Verification

- [x] **5.1** Run seed script in Docker — all 12 collections populated
- [x] **5.2** Verified all 6 API endpoints return real data via `curl`
- [ ] **5.3** Verify frontend pages load data from DB (hot reload pending)
- [ ] **5.4** Verify admin panel CRUD operations work
- [ ] **5.5** Verify Mongo Express shows the seeded data

---

## Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@sdfitness.com | admin123 |
| Member | saman@gmail.com | member123 |
| Trainer | kamal@sdfitness.com | trainer123 |

## Running the Seed Script

```bash
docker exec sdfitness_backend node seed.js
```
