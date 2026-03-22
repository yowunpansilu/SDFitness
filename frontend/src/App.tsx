import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Dashboard } from './pages/dashboard/Dashboard';
import { Profile } from './pages/dashboard/Profile';
import { DietPlans } from './pages/dashboard/DietPlans';
import { Workouts } from './pages/dashboard/Workouts';
import { ClassSchedule } from './pages/dashboard/ClassSchedule';
import { MyBookings } from './pages/dashboard/MyBookings';
import { useAuthStore } from './lib/stores/authStore';
import { Toaster } from './components/ui/toaster';
import { MembershipDetails } from './pages/dashboard/MembershipDetails';
import { MembershipPlans } from './pages/dashboard/MembershipPlans';
import { BillingOverview } from './pages/dashboard/BillingOverview';
import { AttendancePage } from './pages/dashboard/AttendancePage';
import { NotificationSettings } from './pages/dashboard/NotificationSettings';
import { MessagesPage } from './pages/dashboard/MessagesPage';
import { AdminRoute } from './components/auth/AdminRoute';
import { AdminLayout } from './components/admin/layout/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { MembersList } from './pages/admin/members/MembersList';
import { Settings } from './pages/admin/settings/Settings';
import { ClassDetail } from './pages/admin/classes/ClassDetail';
import { PaymentDetail } from './pages/admin/payments/PaymentDetail';
import { EquipmentDetail } from './pages/admin/equipment/EquipmentDetail';
import { TrainerForm } from './pages/admin/trainers/TrainerForm';
import { ClassForm } from './pages/admin/classes/ClassForm';
import { EquipmentForm } from './pages/admin/equipment/EquipmentForm';
import { PaymentForm } from './pages/admin/payments/PaymentForm';

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Public Route wrapper (redirect to dashboard if already logged in)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
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
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
          <Route path="/forgot-password" element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          } />
          <Route path="/reset-password" element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          } />

          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="diet-plans" element={<DietPlans />} />
            <Route path="workouts" element={<Workouts />} />
            <Route path="classes" element={<ClassSchedule />} />
            <Route path="my-bookings" element={<MyBookings />} />
            <Route path="membership" element={<MembershipDetails />} />
            <Route path="membership/plans" element={<MembershipPlans />} />
            <Route path="payments" element={<BillingOverview />} />
            <Route path="attendance" element={<AttendancePage />} />

            <Route path="messages" element={<MessagesPage />} />
            <Route path="settings/notifications" element={<NotificationSettings />} />
          </Route>

          {/* Admin routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="members" element={<MembersList />} />
            <Route path="settings" element={<Settings />} />
            <Route path="classes/:id" element={<ClassDetail />} />
            <Route path="payments/:id" element={<PaymentDetail />} />
            <Route path="equipment/:id" element={<EquipmentDetail />} />

            {/* Form routes */}
            <Route path="trainers/new" element={<TrainerForm />} />
            <Route path="trainers/:id/edit" element={<TrainerForm />} />
            <Route path="classes/new" element={<ClassForm />} />
            <Route path="classes/:id/edit" element={<ClassForm />} />
            <Route path="equipment/new" element={<EquipmentForm />} />
            <Route path="equipment/:id/edit" element={<EquipmentForm />} />
            <Route path="payments/new" element={<PaymentForm />} />
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </>
  );
}

export default App;
