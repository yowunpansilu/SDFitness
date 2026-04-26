import { AuthLayout } from '../../components/auth/AuthLayout';
import { RegisterForm } from '../../components/auth/RegisterForm';

export function Register() {
    return (
        <AuthLayout
            title="Join SDFitness"
            subtitle="Start your transformation journey today"
            backgroundImage="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=2069&auto=format&fit=crop"
            quote="Your Journey Starts Here. Your Success Starts Now."
        >
            <RegisterForm />
        </AuthLayout>
    );
}
