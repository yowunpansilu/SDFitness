import { AuthLayout } from '../../components/auth/AuthLayout';
import { ForgotPasswordForm } from '../../components/auth/ForgotPasswordForm';

export function ForgotPassword() {
    return (
        <AuthLayout
            title="Forgot Password?"
            subtitle="No worries, we'll help you reset it"
            backgroundImage="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop"
            quote="Never Give Up. Never Surrender."
        >
            <ForgotPasswordForm />
        </AuthLayout>
    );
}
