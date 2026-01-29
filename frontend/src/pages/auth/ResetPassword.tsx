import { AuthLayout } from '../../components/auth/AuthLayout';
import { ResetPasswordForm } from '../../components/auth/ResetPasswordForm';

export function ResetPassword() {
    return (
        <AuthLayout
            title="Reset Password"
            subtitle="Create a new strong password"
            backgroundImage="/images/workout-bg.png"
            quote="Strength Comes From Within."
        >
            <ResetPasswordForm />
        </AuthLayout>
    );
}
