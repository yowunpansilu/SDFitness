import { AuthLayout } from '../../components/auth/AuthLayout';
import { ResetPasswordForm } from '../../components/auth/ResetPasswordForm';

export function ResetPassword() {
    return (
        <AuthLayout
            title="Reset Password"
            subtitle="Create a new strong password"
            backgroundImage="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop"
            quote="Strength Comes From Within."
        >
            <ResetPasswordForm />
        </AuthLayout>
    );
}
