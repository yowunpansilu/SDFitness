import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useAuthStore } from '@/lib/stores/authStore';
import api from '@/lib/api/axios';

export function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false,
    });

    const { login } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('⏳ [LOGIN] Sending credentials to backend...', { email: formData.email });
        setIsLoading(true);

        try {
            const response = await api.post('/auth/login', {
                email: formData.email,
                password: formData.password
            });
            console.log('✅ [LOGIN] Success response:', response.data);
            const { user, token, member } = response.data;
            login(user, token, member);
            navigate('/dashboard');
        } catch (error: any) {
            console.error('❌ [LOGIN] Login failed', error.response?.data || error.message);
            alert(error.response?.data?.message || 'Login failed! Please check credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
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
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="pl-11 h-12 bg-primary-50 border-primary-200 focus:border-secondary-500 focus:ring-secondary-500/20 transition-all rounded-lg"
                        required
                    />
                </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
                <Label htmlFor="password" className="text-primary-900 font-semibold text-sm">
                    Password
                </Label>
                <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-secondary-500 transition-colors" />
                    <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="pl-11 pr-11 h-12 bg-primary-50 border-primary-200 focus:border-secondary-500 focus:ring-secondary-500/20 transition-all rounded-lg"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-secondary-500 transition-colors"
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-1 pb-2">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                        <input
                            type="checkbox"
                            checked={formData.rememberMe}
                            onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                            className="peer w-4.5 h-4.5 rounded border-primary-300 text-secondary-500 focus:ring-secondary-500/30 transition-colors"
                        />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground group-hover:text-primary-800 transition-colors">Remember me</span>
                </label>
                <a href="/forgot-password" className="text-sm font-bold text-primary-800 hover:text-secondary-500 transition-colors">
                    Forgot password?
                </a>
            </div>

            {/* Submit Button */}
            <Button
                type="submit"
                variant="gym"
                className="w-full text-lg h-14 rounded-xl"
                disabled={isLoading}
            >
                {isLoading ? (
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-primary-900/30 border-t-primary-900 rounded-full animate-spin" />
                        <span>Signing in...</span>
                    </div>
                ) : (
                    'Secure Sign In'
                )}
            </Button>

            {/* Divider */}
            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-background text-muted-foreground">Or continue with</span>
                </div>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-4">
                <Button
                    type="button"
                    variant="outline"
                    className="h-12 border-primary-200 text-primary-800 bg-white hover:border-secondary-500 hover:bg-primary-50 rounded-lg transition-all"
                >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                        <path
                            fill="#EA4335"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                            fill="#4285F4"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                    Google
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    className="h-12 border-primary-200 text-primary-800 bg-white hover:border-secondary-500 hover:bg-primary-50 rounded-lg transition-all"
                >
                    <svg className="w-5 h-5 mr-3 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Facebook
                </Button>
            </div>

            {/* Sign Up Link */}
            <p className="text-center text-muted-foreground mt-8">
                Don't have an account?{' '}
                <a href="/register" className="text-primary-800 hover:text-secondary-500 font-bold transition-colors">
                    Create one now
                </a>
            </p>
        </form>
    );
}
