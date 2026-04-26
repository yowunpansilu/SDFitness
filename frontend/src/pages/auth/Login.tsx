import { AuthLayout } from '../../components/auth/AuthLayout';
import { LoginForm } from '../../components/auth/LoginForm';

export function Login() {
    return (
        <AuthLayout
            title="Welcome Back"
            subtitle="Sign in to continue your fitness journey"
            backgroundImage="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop"
            quote="Every Rep Counts. Every Day Matters."
        >
            <LoginForm />
        </AuthLayout>
    );
}
