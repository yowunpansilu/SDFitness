import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/auth/Login';
import { AdminLayout } from './components/layout/AdminLayout';
import { AdminDashboard } from './pages/dashboard/AdminDashboard';
import { MembersList } from './pages/members/MembersList';
import { MemberDetail } from './pages/members/MemberDetail';
import { AddMember } from './pages/members/AddMember';
import { MembershipPlans } from './pages/plans/MembershipPlans';
import { TrainersList } from './pages/trainers/TrainersList';
import { TrainerDetail } from './pages/trainers/TrainerDetail';
import { TrainerForm } from './pages/trainers/TrainerForm';
import { ClassSchedule } from './pages/classes/ClassSchedule';
import { ClassForm } from './pages/classes/ClassForm';
import { ClassDetail } from './pages/classes/ClassDetail';
import { PaymentsList } from './pages/payments/PaymentsList';
import { PaymentDetail } from './pages/payments/PaymentDetail';
import { PaymentForm } from './pages/payments/PaymentForm';
import { EquipmentInventory } from './pages/equipment/EquipmentInventory';
import { EquipmentForm } from './pages/equipment/EquipmentForm';
import { EquipmentDetail } from './pages/equipment/EquipmentDetail';
import { AnalyticsDashboard } from './pages/analytics/AnalyticsDashboard';
import { WorkoutsPage } from './pages/workouts/WorkoutsPage';
import { Settings } from './pages/settings/Settings';
import { FoodPrices } from './pages/prices/FoodPrices';
import { ScraperReview } from './pages/scraper/ScraperReview';
import { SubscriptionsDashboard } from './pages/subscriptions/SubscriptionsDashboard';
import { MessagesPage } from './pages/messages/MessagesPage';
import { FeedbackList } from './pages/feedback/FeedbackList';
import { ProgressDashboard } from './pages/progress/ProgressDashboard';
import { useAuthStore } from './lib/stores/authStore';
import { Toaster } from './components/ui/toaster';

// Protected Route wrapper for admin
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const allowedRoles = ['admin', 'manager', 'receptionist'];
  const hasAdminAccess = user && allowedRoles.includes(user.role);

  if (!hasAdminAccess) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Public Route wrapper
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />

          {/* Admin routes */}
          <Route path="/" element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="members" element={<MembersList />} />
            <Route path="members/add" element={<AddMember />} />
            <Route path="members/:id" element={<MemberDetail />} />
            <Route path="plans" element={<MembershipPlans />} />
            <Route path="trainers" element={<TrainersList />} />
            <Route path="trainers/add" element={<TrainerForm />} />
            <Route path="trainers/edit/:id" element={<TrainerForm />} />
            <Route path="trainers/:id" element={<TrainerDetail />} />
            <Route path="classes" element={<ClassSchedule />} />
            <Route path="classes/add" element={<ClassForm />} />
            <Route path="classes/edit/:id" element={<ClassForm />} />
            <Route path="classes/:id" element={<ClassDetail />} />
            <Route path="payments" element={<PaymentsList />} />
            <Route path="payments/add" element={<PaymentForm />} />
            <Route path="payments/:id" element={<PaymentDetail />} />
            <Route path="subscriptions" element={<SubscriptionsDashboard />} />
            <Route path="equipment" element={<EquipmentInventory />} />
            <Route path="equipment/add" element={<EquipmentForm />} />
            <Route path="equipment/edit/:id" element={<EquipmentForm />} />
            <Route path="equipment/:id" element={<EquipmentDetail />} />
            <Route path="analytics" element={<AnalyticsDashboard />} />
            <Route path="workouts" element={<WorkoutsPage />} />
            <Route path="prices" element={<FoodPrices />} />
            <Route path="scraper/review" element={<ScraperReview />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="feedback" element={<FeedbackList />} />
            <Route path="progress" element={<ProgressDashboard />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </>
  );
}

export default App;
