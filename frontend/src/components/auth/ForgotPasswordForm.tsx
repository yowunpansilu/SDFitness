import { useState } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

export function ForgotPasswordForm() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // TODO: Implement actual password reset logic
        setTimeout(() => {
            setIsLoading(false);
            setIsSubmitted(true);
        }, 2000);
    };

    if (isSubmitted) {
        return (
            <div className="text-center space-y-6 animate-fade-in">
                <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto">
                    <Mail className="w-10 h-10 text-success" />
                </div>

                <div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">Check Your Email</h3>
                    <p className="text-muted-foreground">
                        We've sent password reset instructions to <strong className="text-primary-900 font-semibold text-sm">{email}</strong>
                    </p>
                </div>

                <div className="bg-muted border border-border rounded-lg p-4 text-left">
                    <p className="text-sm text-muted-foreground mb-2">
                        <strong className="text-primary-900 font-semibold text-sm">Didn't receive the email?</strong>
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Check your spam folder</li>
                        <li>Make sure you entered the correct email</li>
                        <li>Wait a few minutes and check again</li>
                    </ul>
                </div>

                <div className="flex flex-col gap-3">
                    <Button
                        type="button"
                        variant="gym"
                        onClick={() => setIsSubmitted(false)}
                        className="w-full"
                    >
                        Try Another Email
                    </Button>

                    <a
                        href="/login"
                        className="flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Login
                    </a>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center mb-6">
                <p className="text-muted-foreground">
                    Enter your email address and we'll send you instructions to reset your password.
                </p>
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="email" className="text-primary-900 font-semibold text-sm">
                    Email Address
                </Label>
                <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-secondary-500 transition-colors" />
                    <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-11 h-12 bg-primary-50 border-primary-200 focus:border-secondary-500 focus:ring-secondary-500/20 transition-all rounded-lg"
                        required
                    />
                </div>
            </div>

            <Button
                type="submit"
                variant="gym"
                className="w-full text-lg h-14 rounded-xl"
                disabled={isLoading}
            >
                {isLoading ? (
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-primary-900/30 border-t-primary-900 rounded-full animate-spin" />
                        <span>Sending...</span>
                    </div>
                ) : (
                    'Send Reset Instructions'
                )}
            </Button>

            <a
                href="/login"
                className="flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
            </a>
        </form>
    );
}

