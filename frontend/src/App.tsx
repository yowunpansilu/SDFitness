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
import { WeeklyPlan } from './pages/dashboard/diet/WeeklyPlan';
import { DailyPlan } from './pages/dashboard/diet/DailyPlan';
import { GroceryList } from './pages/dashboard/diet/GroceryList';
import { MealRecipe } from './pages/dashboard/diet/MealRecipe';
import TrainerList from './pages/trainers/TrainerList';
import TrainerDetail from './pages/trainers/TrainerDetail';
import TrainerForm from './pages/trainers/TrainerForm';
import AnalyticsDashboard from './pages/analytics/AnalyticsDashboard';
import MemberList from './pages/members/MemberList';
import MemberDetail from './pages/members/MemberDetail';
import MemberForm from './pages/members/MemberForm';
import EquipmentList from './pages/equipment/EquipmentList';
import EquipmentDetail from './pages/equipment/EquipmentDetail';
import Settings from './pages/settings/Settings';

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

          {/* Member dashboard routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="diet-plans" element={<DietPlans />} />
            <Route path="diet-plans/:id" element={<WeeklyPlan />} />
            <Route path="diet-plans/:id/day/:dayIndex" element={<DailyPlan />} />
            <Route path="diet-plans/:id/grocery-list" element={<GroceryList />} />
            <Route path="diet-plans/:id/meal/:mealId" element={<MealRecipe />} />
            <Route path="workouts" element={<Workouts />} />
            <Route path="classes" element={<ClassSchedule />} />
            <Route path="my-bookings" element={<MyBookings />} />
            <Route path="membership" element={<MembershipDetails />} />
            <Route path="membership/plans" element={<MembershipPlans />} />
            <Route path="payments" element={<BillingOverview />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="settings/notifications" element={<NotificationSettings />} />

            {/* New Management Routes */}
            <Route path="trainers" element={<TrainerList />} />
            <Route path="trainers/new" element={<TrainerForm />} />
            <Route path="trainers/:id" element={<TrainerDetail />} />
            <Route path="trainers/:id/edit" element={<TrainerForm />} />

            <Route path="analytics" element={<AnalyticsDashboard />} />

            <Route path="members" element={<MemberList />} />
            <Route path="members/new" element={<MemberForm />} />
            <Route path="members/:id" element={<MemberDetail />} />
            <Route path="members/:id/edit" element={<MemberForm />} />

            <Route path="equipment" element={<EquipmentList />} />
            <Route path="equipment/:id" element={<EquipmentDetail />} />

            <Route path="settings/global" element={<Settings />} />
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
