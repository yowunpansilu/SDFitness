import { useState } from 'react';
import { User, Mail, Lock, Phone, Ruler, Weight } from 'lucide-react';
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
