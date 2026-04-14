import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { AppShell } from './components/layout/AppShell';
import { SplashScreen } from './components/loading/SplashScreen';
import { Toaster } from './components/ui/toaster';
import { useAuthStore } from './lib/stores/authStore';
import { HomePage } from './pages/home/HomePage';
import { WorkoutsPage } from './pages/workouts/WorkoutsPage';
import { DietPage } from './pages/diet/DietPage';
import { ProgressPage } from './pages/progress/ProgressPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { EditProfile } from './pages/profile/edit/EditProfile';
import { PaymentPage } from './pages/payments/PaymentPage';
import { MessagesPage } from './pages/messages/MessagesPage';
import { DietWizard } from './pages/diet-wizard/DietWizard';

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Public Route wrapper
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Public / Auth routes */}
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

          {/* Main Mobile App Routes (wrapped in AppShell with BottomNav) */}
          <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/workouts" element={<WorkoutsPage />} />
            <Route path="/diet" element={<DietPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            {/* Sub-pages */}
            <Route path="/profile/edit" element={<EditProfile />} />
            <Route path="/profile/payments" element={<PaymentPage />} />
            <Route path="/profile/messages" element={<MessagesPage />} />
            <Route path="/diet-wizard" element={<DietWizard />} />
          </Route>

          {/* Default redirect based on auth */}
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </>
  );
}
