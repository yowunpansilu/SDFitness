import { useState } from 'react';
import { User, Mail, Lock, Phone, Ruler, Weight } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { DatePicker } from '../ui/date-picker';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/stores/authStore';
import api from '@/lib/api/axios';

interface Step1Data {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone: string;
}

interface Step2Data {
    dateOfBirth: Date | undefined;
    gender: string;
    height: string;
    weight: string;
    heightUnit: 'cm' | 'ft';
    weightUnit: 'kg' | 'lbs';
}

interface Step3Data {
    fitnessGoals: string[];
    activityLevel: string;
    dietaryPreferences: string[];
}

export function RegisterForm() {
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const [step1Data, setStep1Data] = useState<Step1Data>({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
    });

    const [step2Data, setStep2Data] = useState<Step2Data>({
        dateOfBirth: undefined,
        gender: '',
        height: '',
        weight: '',
        heightUnit: 'cm',
        weightUnit: 'kg',
    });

    const [step3Data, setStep3Data] = useState<Step3Data>({
        fitnessGoals: [],
        activityLevel: '',
        dietaryPreferences: [],
    });

    const navigate = useNavigate();
    const { login } = useAuthStore();

    const validateStep = () => {
        if (currentStep === 1) {
            if (!step1Data.firstName || !step1Data.lastName) {
                alert("Please enter both First Name and Last Name");
                return false;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(step1Data.email)) {
                alert("Please enter a valid email address");
                return false;
            }

            // Phone number validation (exactly 10 digits)
            const phoneRegex = /^\d{10}$/;
            if (!phoneRegex.test(step1Data.phone)) {
                alert("Phone number must be exactly 10 digits");
                return false;
            }

            if (step1Data.password !== step1Data.confirmPassword) {
                alert("Passwords do not match!");
                return false;
            }
            if (step1Data.password.length < 6) {
                alert("Password should be at least 6 characters long");
                return false;
            }
        }

        if (currentStep === 2) {
            if (!step2Data.dateOfBirth) {
                alert("Please select your Date of Birth");
                return false;
            }
            if (!step2Data.gender) {
                alert("Please select your Gender");
                return false;
            }
            if (!step2Data.height || !step2Data.weight) {
                alert("Please enter your Height and Weight");
                return false;
            }
        }

        if (currentStep === 3) {
            if (step3Data.fitnessGoals.length === 0) {
                alert("Please select at least one Fitness Goal");
                return false;
            }
            if (!step3Data.activityLevel) {
                alert("Please select your Activity Level");
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateStep()) return;

        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
            return;
        }

        console.log('⏳ [REGISTER] Sending data to backend...', { step1Data, step2Data, step3Data });
        setIsLoading(true);
        try {
            const response = await api.post('/auth/register', {
                step1Data,
                step2Data,
                step3Data
            });
            console.log('✅ [REGISTER] Success response:', response.data);
            const { user, token, member } = response.data;
            
            // Show success message
            alert("Registration successful!");
            
            login(user, token, member);
            navigate('/dashboard');
        } catch (error: any) {
            console.error('❌ [REGISTER] Registration failed', error.response?.data || error.message);
            const errorMsg = error.response?.data?.error ? `${error.response.data.message}: ${error.response.data.error}` : 
                            (error.response?.data?.message || 'Registration failed! Please check your details.');
            alert(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleGoal = (goal: string) => {
        setStep3Data(prev => ({
            ...prev,
            fitnessGoals: prev.fitnessGoals.includes(goal)
                ? prev.fitnessGoals.filter(g => g !== goal)
                : [...prev.fitnessGoals, goal]
        }));
    };

    const toggleDietaryPreference = (pref: string) => {
        setStep3Data(prev => ({
            ...prev,
            dietaryPreferences: prev.dietaryPreferences.includes(pref)
                ? prev.dietaryPreferences.filter(p => p !== pref)
                : [...prev.dietaryPreferences, pref]
        }));
    };

    const handleGoogleSignup = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setIsLoading(true);
            try {
                const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const userInfo = await userInfoRes.json();
                const response = await api.post('/auth/google', { idToken: tokenResponse.access_token, userInfo });
                const { user, token, member } = response.data;
                login(user, token, member);
                navigate('/dashboard');
            } catch (error: any) {
                console.error('❌ [GOOGLE SIGNUP] Failed', error.response?.data || error.message);
                alert(error.response?.data?.message || 'Google sign-up failed. Please try again.');
            } finally {
                setIsLoading(false);
            }
        },
        onError: () => alert('Google sign-in was cancelled or failed.'),
    });

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            {/* Progress Indicator */}
            <div className="flex items-center justify-between mb-2">
                {[1, 2, 3].map((step) => (
                    <div key={step} className="flex items-center flex-1">
                        <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step === currentStep
                                ? 'bg-primary-500 text-white scale-110 shadow-lg shadow-primary-500/20'
                                : step < currentStep
                                    ? 'bg-secondary-500 text-foreground'
                                    : 'bg-muted text-muted-foreground opacity-50'
                                }`}
                        >
                            {step < currentStep ? '✓' : step}
                        </div>
                        {step < 3 && (
                            <div
                                className={`flex-1 h-0.5 mx-2 transition-all ${step < currentStep ? 'bg-secondary-500' : 'bg-muted'
                                    }`}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
                <div className="grid grid-cols-2 gap-x-3 gap-y-2 animate-fade-in">
                    <h3 className="col-span-2 text-sm font-bold text-foreground">Basic Information</h3>

                    {/* Google Sign-up */}
                    <div className="col-span-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleGoogleSignup()}
                            disabled={isLoading}
                            className="w-full h-10 border-primary-200 text-primary-800 bg-white hover:border-secondary-500 hover:bg-primary-50 rounded-lg transition-all flex items-center justify-center gap-2"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path fill="#EA4335" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#4285F4" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <span className="text-xs font-semibold">Continue with Google</span>
                        </Button>
                        <div className="relative my-2">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                            <div className="relative flex justify-center"><span className="px-3 bg-background text-[10px] text-muted-foreground">or fill in manually</span></div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="firstName" className="text-primary-900 font-semibold text-[10px] uppercase opacity-70">First Name</Label>
                        <div className="relative group">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-secondary-500 transition-colors" />
                            <Input
                                id="firstName"
                                placeholder="John"
                                value={step1Data.firstName}
                                onChange={(e) => setStep1Data({ ...step1Data, firstName: e.target.value })}
                                className="pl-9 h-9 text-xs bg-primary-50 border-primary-200 focus:border-secondary-500 rounded-lg"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="lastName" className="text-primary-900 font-semibold text-[10px] uppercase opacity-70">Last Name</Label>
                        <div className="relative group">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-secondary-500 transition-colors" />
                            <Input
                                id="lastName"
                                placeholder="Doe"
                                value={step1Data.lastName}
                                onChange={(e) => setStep1Data({ ...step1Data, lastName: e.target.value })}
                                className="pl-9 h-9 text-xs bg-primary-50 border-primary-200 focus:border-secondary-500 rounded-lg"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1 col-span-2 md:col-span-1">
                        <Label htmlFor="email" className="text-primary-900 font-semibold text-[10px] uppercase opacity-70">Email Address</Label>
                        <div className="relative group">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-secondary-500 transition-colors" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={step1Data.email}
                                onChange={(e) => setStep1Data({ ...step1Data, email: e.target.value })}
                                className="pl-9 h-9 text-xs bg-primary-50 border-primary-200 focus:border-secondary-500 rounded-lg"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1 col-span-2 md:col-span-1">
                        <Label htmlFor="phone" className="text-primary-900 font-semibold text-[10px] uppercase opacity-70">Phone Number</Label>
                        <div className="relative group">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-secondary-500 transition-colors" />
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="0771234567"
                                value={step1Data.phone}
                                onChange={(e) => setStep1Data({ ...step1Data, phone: e.target.value })}
                                className="pl-9 h-9 text-xs bg-primary-50 border-primary-200 focus:border-secondary-500 rounded-lg"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1 col-span-2 md:col-span-1">
                        <Label htmlFor="password" className="text-primary-900 font-semibold text-[10px] uppercase opacity-70">Password</Label>
                        <div className="relative group">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-secondary-500 transition-colors" />
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={step1Data.password}
                                onChange={(e) => setStep1Data({ ...step1Data, password: e.target.value })}
                                className="pl-9 h-9 text-xs bg-primary-50 border-primary-200 focus:border-secondary-500 rounded-lg"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1 col-span-2 md:col-span-1">
                        <Label htmlFor="confirmPassword" className="text-primary-900 font-semibold text-[10px] uppercase opacity-70">Confirm Password</Label>
                        <div className="relative group">
                            <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                                step1Data.confirmPassword && step1Data.password !== step1Data.confirmPassword
                                ? 'text-orange-500'
                                : 'text-muted-foreground group-focus-within:text-secondary-500'
                            }`} />
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                value={step1Data.confirmPassword}
                                onChange={(e) => setStep1Data({ ...step1Data, confirmPassword: e.target.value })}
                                className={`pl-9 h-9 text-xs bg-primary-50 border-primary-200 focus:border-secondary-500 rounded-lg transition-all ${
                                    step1Data.confirmPassword && step1Data.password !== step1Data.confirmPassword
                                    ? 'border-orange-500 ring-1 ring-orange-500/20'
                                    : ''
                                }`}
                                required
                            />
                        </div>
                        {step1Data.confirmPassword && step1Data.password !== step1Data.confirmPassword && (
                            <p className="text-[9px] text-orange-500 font-medium">Passwords do not match</p>
                        )}
                    </div>
                </div>
            )}

            {/* Step 2: Health Metrics */}
            {currentStep === 2 && (
                <div className="space-y-2 animate-fade-in">
                    <h3 className="text-sm font-bold text-foreground">Health Metrics</h3>

                    <DatePicker
                        id="dob"
                        label="Date of Birth"
                        value={step2Data.dateOfBirth}
                        onChange={(date) => setStep2Data({ ...step2Data, dateOfBirth: date })}
                        placeholder="Select your date of birth"
                    />

                    <div className="space-y-1">
                        <Label className="text-primary-900 font-semibold text-[10px] uppercase opacity-70">Gender</Label>
                        <div className="grid grid-cols-3 gap-2">
                            {['Male', 'Female', 'Other'].map((gender) => (
                                <button
                                    key={gender}
                                    type="button"
                                    onClick={() => setStep2Data({ ...step2Data, gender })}
                                    className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${step2Data.gender === gender
                                        ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20'
                                        : 'bg-muted text-muted-foreground hover:bg-accent'
                                        }`}
                                >
                                    {gender}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label htmlFor="height" className="text-primary-900 font-semibold text-[10px] uppercase opacity-70">Height</Label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                    <Input
                                        id="height"
                                        type="number"
                                        placeholder="170"
                                        value={step2Data.height}
                                        onChange={(e) => setStep2Data({ ...step2Data, height: e.target.value })}
                                        className="pl-8 h-8 text-xs bg-primary-50 border-primary-200"
                                        required
                                    />
                                </div>
                                <select
                                    value={step2Data.heightUnit}
                                    onChange={(e) => setStep2Data({ ...step2Data, heightUnit: e.target.value as 'cm' | 'ft' })}
                                    className="px-1.5 py-0.5 text-[10px] bg-muted border border-border rounded-md"
                                >
                                    <option value="cm">cm</option>
                                    <option value="ft">ft</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="weight" className="text-primary-900 font-semibold text-[10px] uppercase opacity-70">Weight</Label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Weight className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                    <Input
                                        id="weight"
                                        type="number"
                                        placeholder="70"
                                        value={step2Data.weight}
                                        onChange={(e) => setStep2Data({ ...step2Data, weight: e.target.value })}
                                        className="pl-8 h-8 text-xs bg-primary-50 border-primary-200"
                                        required
                                    />
                                </div>
                                <select
                                    value={step2Data.weightUnit}
                                    onChange={(e) => setStep2Data({ ...step2Data, weightUnit: e.target.value as 'kg' | 'lbs' })}
                                    className="px-1.5 py-0.5 text-[10px] bg-muted border border-border rounded-md"
                                >
                                    <option value="kg">kg</option>
                                    <option value="lbs">lbs</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 3: Goals & Preferences */}
            {currentStep === 3 && (
                <div className="space-y-2 animate-fade-in">
                    <h3 className="text-sm font-bold text-foreground">Goals & Preferences</h3>

                    <div className="space-y-1">
                        <Label className="text-primary-900 font-semibold text-[10px] uppercase opacity-70">Fitness Goals</Label>
                        <div className="grid grid-cols-3 gap-1">
                            {['Weight Loss', 'Muscle Gain', 'Endurance', 'Flexibility', 'General Fitness', 'Sports Performance'].map((goal) => (
                                <button
                                    key={goal}
                                    type="button"
                                    onClick={() => toggleGoal(goal)}
                                    className={`py-1 px-1 rounded-lg text-[9px] font-bold transition-all text-center leading-tight h-10 flex items-center justify-center ${step3Data.fitnessGoals.includes(goal)
                                        ? 'bg-primary-500 text-white shadow-md'
                                        : 'bg-muted text-muted-foreground hover:bg-accent'
                                        }`}
                                >
                                    {goal}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-0.5">
                        <Label className="text-primary-900 font-semibold text-[10px] uppercase opacity-70">Activity Level</Label>
                        <div className="grid grid-cols-1 gap-1">
                            {[
                                { value: 'sedentary', label: 'Sedentary' },
                                { value: 'light', label: 'Light' },
                                { value: 'moderate', label: 'Moderate' },
                                { value: 'active', label: 'Active' },
                                { value: 'very_active', label: 'Very Active' },
                            ].map((level) => (
                                <button
                                    key={level.value}
                                    type="button"
                                    onClick={() => setStep3Data({ ...step3Data, activityLevel: level.value })}
                                    className={`py-1 px-3 rounded-lg text-xs font-medium transition-all text-left ${step3Data.activityLevel === level.value
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-muted text-muted-foreground hover:bg-accent'
                                        }`}
                                >
                                    {level.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-primary-900 font-semibold text-[10px] uppercase opacity-70">Dietary Preferences</Label>
                        <div className="grid grid-cols-3 gap-1">
                            {['Vegetarian', 'Vegan', 'Keto', 'Paleo', 'Gluten-Free', 'Dairy-Free'].map((pref) => (
                                <button
                                    key={pref}
                                    type="button"
                                    onClick={() => toggleDietaryPreference(pref)}
                                    className={`py-1 px-1 rounded-lg text-[9px] font-bold transition-all text-center leading-tight h-8 flex items-center justify-center ${step3Data.dietaryPreferences.includes(pref)
                                        ? 'bg-secondary-500 text-white shadow-md'
                                        : 'bg-muted text-muted-foreground hover:bg-accent'
                                        }`}
                                >
                                    {pref}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-2">
                        <label className="flex items-start gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                required
                                className="mt-0.5 w-3 h-3 rounded border-border bg-muted text-primary-500 focus:ring-1 focus:ring-primary-500/20"
                            />
                            <span className="text-[10px] text-muted-foreground leading-tight">
                                I agree to the{' '}
                                <a href="/terms" className="text-primary-800 hover:text-secondary-500 underline">Terms</a>{' '}
                                and{' '}
                                <a href="/privacy" className="text-primary-800 hover:text-secondary-500 underline">Privacy</a>
                            </span>
                        </label>
                    </div>
                </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-2 pt-2">
                {currentStep > 1 && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentStep(currentStep - 1)}
                        className="flex-1 border-border h-10 text-sm"
                    >
                        Back
                    </Button>
                )}
                <Button
                    type="submit"
                    variant="gym"
                    className="flex-1 text-base h-10 rounded-lg"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-primary-900/30 border-t-primary-900 rounded-full animate-spin" />
                            <span>...</span>
                        </div>
                    ) : currentStep === 3 ? (
                        'Create Account'
                    ) : (
                        'Continue'
                    )}
                </Button>
            </div>

            {/* Sign In Link */}
            {currentStep === 1 && (
                <p className="text-center text-muted-foreground pt-2 text-xs">
                    Already have an account?{' '}
                    <a href="/login" className="text-primary-800 hover:text-secondary-500 font-semibold transition-colors">
                        Sign in
                    </a>
                </p>
            )}
        </form>
    );
}
