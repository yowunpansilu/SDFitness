import { AuthLayout } from '../../components/auth/AuthLayout';
import { RegisterForm } from '../../components/auth/RegisterForm';

export function Register() {
    return (
        <AuthLayout
            title="Join SDFitness"
            subtitle="Start your transformation journey today"
            backgroundImage="/images/achievement-bg.png"
            quote="Your Journey Starts Here. Your Success Starts Now."
        >
            <RegisterForm />
        </AuthLayout>
    );
}
