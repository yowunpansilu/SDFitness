import { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

export function ResetPasswordForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: '',
    });

    const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
        let score = 0;
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[^a-zA-Z\d]/.test(password)) score++;

        if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' };
        if (score <= 3) return { score, label: 'Fair', color: 'bg-yellow-500' };
        if (score <= 4) return { score, label: 'Good', color: 'bg-blue-500' };
        return { score, label: 'Strong', color: 'bg-success' };
    };

    const passwordStrength = getPasswordStrength(formData.password);
    const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== '';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // TODO: Implement actual password reset logic
        setTimeout(() => {
            setIsLoading(false);
            window.location.href = '/login';
        }, 2000);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center mb-6">
                <p className="text-muted-foreground">
                    Create a strong password to secure your account.
                </p>
            </div>

            {/* New Password */}
            <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">
                    New Password
                </Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="pl-10 pr-10"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>

                {/* Password Strength Meter */}
                {formData.password && (
                    <div className="space-y-2 animate-fade-in">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Password Strength:</span>
                            <span className={`font-semibold ${passwordStrength.label === 'Weak' ? 'text-red-400' :
                                    passwordStrength.label === 'Fair' ? 'text-yellow-400' :
                                        passwordStrength.label === 'Good' ? 'text-blue-400' :
                                            'text-success'
                                }`}>
                                {passwordStrength.label}
                            </span>
                        </div>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((level) => (
                                <div
                                    key={level}
                                    className={`h-2 flex-1 rounded-full transition-all ${level <= passwordStrength.score
                                            ? passwordStrength.color
                                            : 'bg-muted'
                                        }`}
                                />
                            ))}
                        </div>
                        <ul className="text-xs text-muted-foreground space-y-1">
                            <li className={formData.password.length >= 8 ? 'text-success' : ''}>
                                {formData.password.length >= 8 ? '✓' : '○'} At least 8 characters
                            </li>
                            <li className={/[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password) ? 'text-success' : ''}>
                                {/[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password) ? '✓' : '○'} Upper and lowercase letters
                            </li>
                            <li className={/\d/.test(formData.password) ? 'text-success' : ''}>
                                {/\d/.test(formData.password) ? '✓' : '○'} At least one number
                            </li>
                            <li className={/[^a-zA-Z\d]/.test(formData.password) ? 'text-success' : ''}>
                                {/[^a-zA-Z\d]/.test(formData.password) ? '✓' : '○'} Special character (!@#$%^&*)
                            </li>
                        </ul>
                    </div>
                )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground">
                    Confirm Password
                </Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="pl-10 pr-10"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>

                {/* Password Match Indicator */}
                {formData.confirmPassword && (
                    <div className={`flex items-center gap-2 text-sm animate-fade-in ${passwordsMatch ? 'text-success' : 'text-red-400'
                        }`}>
                        <CheckCircle className="w-4 h-4" />
                        <span>{passwordsMatch ? 'Passwords match' : 'Passwords do not match'}</span>
                    </div>
                )}
            </div>

            <Button
                type="submit"
                variant="gym"
                className="w-full text-lg py-6"
                disabled={isLoading || !passwordsMatch || passwordStrength.score < 3}
            >
                {isLoading ? (
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Resetting Password...</span>
                    </div>
                ) : (
                    'Reset Password'
                )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
                Password must be at least "Good" strength to continue
            </p>
        </form>
    );
}
