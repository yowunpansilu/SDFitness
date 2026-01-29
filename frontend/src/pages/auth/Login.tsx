import { AuthLayout } from '../../components/auth/AuthLayout';
import { LoginForm } from '../../components/auth/LoginForm';

export function Login() {
    return (
        <AuthLayout
            title="Welcome Back"
            subtitle="Sign in to continue your fitness journey"
            backgroundImage="/images/workout-bg.png"
            quote="Every Rep Counts. Every Day Matters."
        >
            <LoginForm />
        </AuthLayout>
    );
}
