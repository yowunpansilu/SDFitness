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
import { ClassSchedule } from './pages/classes/ClassSchedule';
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
                        <Route path="trainers/:id" element={<TrainerDetail />} />
                        <Route path="classes" element={<ClassSchedule />} />
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
