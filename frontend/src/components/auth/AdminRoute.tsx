import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/stores/authStore';

interface AdminRouteProps {
    children: React.ReactNode;
}

/**
 * Protected route component for admin-only pages
 * Redirects to login if not authenticated, to dashboard if not admin
 */
export function AdminRoute({ children }: AdminRouteProps) {
    const { isAuthenticated, user } = useAuthStore();

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Check if user has admin privileges
    const allowedRoles = ['admin', 'manager', 'receptionist'];
    const hasAdminAccess = user && allowedRoles.includes(user.role);

    // Redirect to member dashboard if not admin
    if (!hasAdminAccess) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}
