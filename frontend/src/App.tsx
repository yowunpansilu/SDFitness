import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '@/pages/auth/Login';
import { Register } from '@/pages/auth/Register';
import { ForgotPassword } from '@/pages/auth/ForgotPassword';
import { ResetPassword } from '@/pages/auth/ResetPassword';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Dashboard } from '@/pages/dashboard/Dashboard';
import { Profile } from '@/pages/dashboard/Profile';
import { DietPlans } from '@/pages/dashboard/DietPlans';
import { Workouts } from '@/pages/dashboard/Workouts';
import { ClassSchedule } from '@/pages/dashboard/ClassSchedule';
import { MyBookings } from '@/pages/dashboard/MyBookings';
import { ProgressPage } from '@/pages/dashboard/ProgressPage';
import { WeightTrackerPage } from '@/pages/dashboard/WeightTrackerPage';
import { AttendancePage } from '@/pages/dashboard/AttendancePage';
import { NotificationSettings } from '@/pages/dashboard/NotificationSettings';
import { MessagesPage } from '@/pages/dashboard/MessagesPage';
import PaymentSuccess from '@/pages/dashboard/PaymentSuccess';
import PaymentCancel from '@/pages/dashboard/PaymentCancel';
import { MembershipDetails } from '@/pages/dashboard/MembershipDetails';
import { MembershipPlans } from '@/pages/dashboard/MembershipPlans';
import { BillingOverview } from '@/pages/dashboard/BillingOverview';
import DailyProgress from '@/pages/dashboard/DailyProgress';
import WeeklySchedule from '@/pages/dashboard/WeeklySchedule';
import { FeedbackPage } from '@/pages/dashboard/FeedbackPage';
import { MemberProgress } from '@/pages/dashboard/MemberProgress';
import { useAuthStore } from '@/lib/stores/authStore';
import { Toaster } from '@/components/ui/toaster';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// Public Route wrapper
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
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
            <Route path="payment/success" element={<PaymentSuccess />} />
            <Route path="payment/cancel" element={<PaymentCancel />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="progress" element={<ProgressPage />} />
            <Route path="weight" element={<WeightTrackerPage />} />
            <Route path="daily-progress" element={<DailyProgress />} />
            <Route path="weekly-schedule" element={<WeeklySchedule />} />
            <Route path="feedback" element={<FeedbackPage />} />
            <Route path="member-progress" element={<MemberProgress />} />

            <Route path="messages" element={<MessagesPage />} />
            <Route path="settings/notifications" element={<NotificationSettings />} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </ErrorBoundary>
  );
}

export default App;
