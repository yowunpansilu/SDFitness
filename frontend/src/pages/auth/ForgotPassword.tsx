import { AuthLayout } from '../../components/auth/AuthLayout';
import { ForgotPasswordForm } from '../../components/auth/ForgotPasswordForm';

export function ForgotPassword() {
    return (
        <AuthLayout
            title="Forgot Password?"
            subtitle="No worries, we'll help you reset it"
            backgroundImage="/images/gym-hero.png"
            quote="Never Give Up. Never Surrender."
        >
            <ForgotPasswordForm />
        </AuthLayout>
    );
}
