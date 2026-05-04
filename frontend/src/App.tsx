import React, { useEffect, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { App as CapApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { Login } from '@/pages/auth/Login';
import { Register } from '@/pages/auth/Register';
import { ForgotPassword } from '@/pages/auth/ForgotPassword';
import { ResetPassword } from '@/pages/auth/ResetPassword';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
const Dashboard = React.lazy(() => import('@/pages/dashboard/Dashboard').then(module => ({ default: module.Dashboard })));
import { Profile } from '@/pages/dashboard/Profile';
const DietPlans = React.lazy(() => import('@/pages/dashboard/DietPlans').then(module => ({ default: module.DietPlans })));
const Workouts = React.lazy(() => import('@/pages/dashboard/Workouts').then(module => ({ default: module.Workouts })));
const ClassSchedule = React.lazy(() => import('@/pages/dashboard/ClassSchedule').then(module => ({ default: module.ClassSchedule })));
import { MyBookings } from '@/pages/dashboard/MyBookings';
import { ProgressPage } from '@/pages/dashboard/ProgressPage';
const WeightTrackerPage = React.lazy(() => import('@/pages/dashboard/WeightTrackerPage').then(module => ({ default: module.WeightTrackerPage })));
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

/**
 * Listens for Capacitor deep links (sdfitness://).
 * When Stripe redirects back to sdfitness://dashboard/payment/success?...
 * Android fires appUrlOpen → we strip the scheme and navigate in-app.
 */
function DeepLinkHandler() {
    const navigate = useNavigate();

    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return;

        const listener = CapApp.addListener('appUrlOpen', (event) => {
            // event.url = 'sdfitness://dashboard/payment/success?session_id=...&payment_id=...'
            // NOTE: In a custom scheme URL like sdfitness://dashboard/payment/success
            //   - protocol = 'sdfitness:'
            //   - hostname = 'dashboard'  ← this is NOT a path segment!
            //   - pathname = '/payment/success'
            // So we must reconstruct: '/' + hostname + pathname + search
            try {
                const url = new URL(event.url);
                const path = '/' + url.hostname + url.pathname + url.search;
                console.log('[DeepLink] Navigating to:', path);
                navigate(path, { replace: true });
            } catch (e) {
                console.error('[DeepLink] Failed to parse URL:', event.url, e);
            }
        });

        return () => {
            listener.then((l) => l.remove());
        };
    }, [navigate]);

    return null;
}

// Protected Route wrapper — waits for Zustand persist to rehydrate from localStorage
function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, hasHydrated } = useAuthStore();
    // While Zustand is reading localStorage, show a spinner instead of redirecting
    if (!hasHydrated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="h-10 w-10 border-4 border-slate-200 border-t-[#DC2626] rounded-full animate-spin" />
            </div>
        );
    }
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return <>{children}</>;
}

// Public Route wrapper
function PublicRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, hasHydrated } = useAuthStore();
    if (!hasHydrated) return null; // Wait silently for public routes
    if (isAuthenticated) return <Navigate to="/dashboard" replace />;
    return <>{children}</>;
}

function App() {
    return (
        <ErrorBoundary>
            <BrowserRouter>
                <DeepLinkHandler />
                <Suspense fallback={
                    <div className="min-h-screen flex items-center justify-center bg-slate-50">
                        <div className="h-10 w-10 border-4 border-slate-200 border-t-[#DC2626] rounded-full animate-spin" />
                    </div>
                }>
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

                    {/* Standalone payment result pages - no sidebar/header needed */}
                    <Route path="/dashboard/payment/success" element={
                        <ProtectedRoute>
                            <PaymentSuccess />
                        </ProtectedRoute>
                    } />
                    <Route path="/dashboard/payment/cancel" element={
                        <ProtectedRoute>
                            <PaymentCancel />
                        </ProtectedRoute>
                    } />

                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
                </Suspense>
            </BrowserRouter>
            <Toaster />
        </ErrorBoundary>
    );
}

export default App;
