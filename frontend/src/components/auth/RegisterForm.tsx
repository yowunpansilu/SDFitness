import { useState } from 'react';
import { User, Mail, Lock, Phone, Ruler, Weight } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { DatePicker } from '../ui/date-picker';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/stores/authStore';
import axios from 'axios';

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
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post(`${API_URL}/api/auth/register`, {
                step1Data,
                step2Data,
                step3Data
            });
            const { user, token } = response.data;
            login(user, token);
            navigate('/dashboard');
        } catch (error: any) {
            console.error('Registration failed', error.response?.data?.message || error.message);
            alert(error.response?.data?.message || 'Registration failed! Please check your details.');
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
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Progress Indicator */}
            <div className="flex items-center justify-between mb-8">
                {[1, 2, 3].map((step) => (
                    <div key={step} className="flex items-center flex-1">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step === currentStep
                                ? 'bg-primary-500 text-white scale-110'
                                : step < currentStep
                                    ? 'bg-secondary-500 text-foreground'
                                    : 'bg-muted text-muted-foreground'
                                }`}
                        >
                            {step < currentStep ? '✓' : step}
                        </div>
                        {step < 3 && (
                            <div
                                className={`flex-1 h-1 mx-2 transition-all ${step < currentStep ? 'bg-secondary-500' : 'bg-muted'
                                    }`}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
                <div className="space-y-4 animate-fade-in">
                    <h3 className="text-xl font-bold text-foreground mb-4">Basic Information</h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="firstName" className="text-primary-900 font-semibold text-sm">First Name</Label>
                            <div className="relative group">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-secondary-500 transition-colors" />
                                <Input
                                    id="firstName"
                                    placeholder="John"
                                    value={step1Data.firstName}
                                    onChange={(e) => setStep1Data({ ...step1Data, firstName: e.target.value })}
                                    className="pl-11 h-12 bg-primary-50 border-primary-200 focus:border-secondary-500 focus:ring-secondary-500/20 transition-all rounded-lg"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="lastName" className="text-primary-900 font-semibold text-sm">Last Name</Label>
                            <div className="relative group">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-secondary-500 transition-colors" />
                                <Input
                                    id="lastName"
                                    placeholder="Doe"
                                    value={step1Data.lastName}
                                    onChange={(e) => setStep1Data({ ...step1Data, lastName: e.target.value })}
                                    className="pl-11 h-12 bg-primary-50 border-primary-200 focus:border-secondary-500 focus:ring-secondary-500/20 transition-all rounded-lg"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-primary-900 font-semibold text-sm">Email Address</Label>
                        <div className="relative group">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-secondary-500 transition-colors" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={step1Data.email}
                                onChange={(e) => setStep1Data({ ...step1Data, email: e.target.value })}
                                className="pl-11 h-12 bg-primary-50 border-primary-200 focus:border-secondary-500 focus:ring-secondary-500/20 transition-all rounded-lg"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="phone" className="text-primary-900 font-semibold text-sm">Phone Number</Label>
                        <div className="relative group">
                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-secondary-500 transition-colors" />
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="+1 (555) 000-0000"
                                value={step1Data.phone}
                                onChange={(e) => setStep1Data({ ...step1Data, phone: e.target.value })}
                                className="pl-11 h-12 bg-primary-50 border-primary-200 focus:border-secondary-500 focus:ring-secondary-500/20 transition-all rounded-lg"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="password" className="text-primary-900 font-semibold text-sm">Password</Label>
                        <div className="relative group">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-secondary-500 transition-colors" />
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={step1Data.password}
                                onChange={(e) => setStep1Data({ ...step1Data, password: e.target.value })}
                                className="pl-11 h-12 bg-primary-50 border-primary-200 focus:border-secondary-500 focus:ring-secondary-500/20 transition-all rounded-lg"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="confirmPassword" className="text-primary-900 font-semibold text-sm">Confirm Password</Label>
                        <div className="relative group">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-secondary-500 transition-colors" />
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                value={step1Data.confirmPassword}
                                onChange={(e) => setStep1Data({ ...step1Data, confirmPassword: e.target.value })}
                                className="pl-11 h-12 bg-primary-50 border-primary-200 focus:border-secondary-500 focus:ring-secondary-500/20 transition-all rounded-lg"
                                required
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Step 2: Health Metrics */}
            {currentStep === 2 && (
                <div className="space-y-4 animate-fade-in">
                    <h3 className="text-xl font-bold text-foreground mb-4">Health Metrics</h3>

                    <DatePicker
                        id="dob"
                        label="Date of Birth"
                        value={step2Data.dateOfBirth}
                        onChange={(date) => setStep2Data({ ...step2Data, dateOfBirth: date })}
                        placeholder="Select your date of birth"
                    />

                    <div className="space-y-1.5">
                        <Label className="text-primary-900 font-semibold text-sm">Gender</Label>
                        <div className="grid grid-cols-3 gap-2">
                            {['Male', 'Female', 'Other'].map((gender) => (
                                <button
                                    key={gender}
                                    type="button"
                                    onClick={() => setStep2Data({ ...step2Data, gender })}
                                    className={`py-3 px-4 rounded-lg font-medium transition-all ${step2Data.gender === gender
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-muted text-muted-foreground hover:bg-accent'
                                        }`}
                                >
                                    {gender}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="height" className="text-primary-900 font-semibold text-sm">Height</Label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Ruler className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-secondary-500 transition-colors" />
                                    <Input
                                        id="height"
                                        type="number"
                                        placeholder="170"
                                        value={step2Data.height}
                                        onChange={(e) => setStep2Data({ ...step2Data, height: e.target.value })}
                                        className="pl-11 h-12 bg-primary-50 border-primary-200 focus:border-secondary-500 focus:ring-secondary-500/20 transition-all rounded-lg"
                                        required
                                    />
                                </div>
                                <select
                                    value={step2Data.heightUnit}
                                    onChange={(e) => setStep2Data({ ...step2Data, heightUnit: e.target.value as 'cm' | 'ft' })}
                                    className="px-4 py-2 bg-muted border border-border text-foreground rounded-md"
                                >
                                    <option value="cm">cm</option>
                                    <option value="ft">ft</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="weight" className="text-primary-900 font-semibold text-sm">Weight</Label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Weight className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-secondary-500 transition-colors" />
                                    <Input
                                        id="weight"
                                        type="number"
                                        placeholder="70"
                                        value={step2Data.weight}
                                        onChange={(e) => setStep2Data({ ...step2Data, weight: e.target.value })}
                                        className="pl-11 h-12 bg-primary-50 border-primary-200 focus:border-secondary-500 focus:ring-secondary-500/20 transition-all rounded-lg"
                                        required
                                    />
                                </div>
                                <select
                                    value={step2Data.weightUnit}
                                    onChange={(e) => setStep2Data({ ...step2Data, weightUnit: e.target.value as 'kg' | 'lbs' })}
                                    className="px-4 py-2 bg-muted border border-border text-foreground rounded-md"
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
                <div className="space-y-4 animate-fade-in">
                    <h3 className="text-xl font-bold text-foreground mb-4">Goals & Preferences</h3>

                    <div className="space-y-1.5">
                        <Label className="text-primary-900 font-semibold text-sm">Fitness Goals (Select all that apply)</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {['Weight Loss', 'Muscle Gain', 'Endurance', 'Flexibility', 'General Fitness', 'Sports Performance'].map((goal) => (
                                <button
                                    key={goal}
                                    type="button"
                                    onClick={() => toggleGoal(goal)}
                                    className={`py-3 px-4 rounded-lg font-medium transition-all text-left ${step3Data.fitnessGoals.includes(goal)
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-muted text-muted-foreground hover:bg-accent'
                                        }`}
                                >
                                    {goal}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-primary-900 font-semibold text-sm">Activity Level</Label>
                        <div className="space-y-1.5">
                            {[
                                { value: 'sedentary', label: 'Sedentary (Little or no exercise)' },
                                { value: 'light', label: 'Light (Exercise 1-3 days/week)' },
                                { value: 'moderate', label: 'Moderate (Exercise 3-5 days/week)' },
                                { value: 'active', label: 'Active (Exercise 6-7 days/week)' },
                                { value: 'very_active', label: 'Very Active (Intense exercise daily)' },
                            ].map((level) => (
                                <button
                                    key={level.value}
                                    type="button"
                                    onClick={() => setStep3Data({ ...step3Data, activityLevel: level.value })}
                                    className={`w-full py-3 px-4 rounded-lg font-medium transition-all text-left ${step3Data.activityLevel === level.value
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-muted text-muted-foreground hover:bg-accent'
                                        }`}
                                >
                                    {level.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-primary-900 font-semibold text-sm">Dietary Preferences (Optional)</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {['Vegetarian', 'Vegan', 'Keto', 'Paleo', 'Gluten-Free', 'Dairy-Free'].map((pref) => (
                                <button
                                    key={pref}
                                    type="button"
                                    onClick={() => toggleDietaryPreference(pref)}
                                    className={`py-3 px-4 rounded-lg font-medium transition-all ${step3Data.dietaryPreferences.includes(pref)
                                        ? 'bg-secondary-500 text-white'
                                        : 'bg-muted text-muted-foreground hover:bg-accent'
                                        }`}
                                >
                                    {pref}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                required
                                className="mt-1 w-4 h-4 rounded border-border bg-muted text-primary-500 focus:ring-2 focus:ring-primary-500/20"
                            />
                            <span className="text-sm text-muted-foreground">
                                I agree to the{' '}
                                <a href="/terms" className="text-primary-800 hover:text-secondary-500">
                                    Terms of Service
                                </a>{' '}
                                and{' '}
                                <a href="/privacy" className="text-primary-800 hover:text-secondary-500">
                                    Privacy Policy
                                </a>
                            </span>
                        </label>
                    </div>
                </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-4">
                {currentStep > 1 && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentStep(currentStep - 1)}
                        className="flex-1 border-border hover:border-primary-500 hover:bg-card"
                    >
                        Back
                    </Button>
                )}
                <Button
                    type="submit"
                    variant="gym"
                    className="flex-1 text-lg h-14 rounded-xl"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-primary-900/30 border-t-primary-900 rounded-full animate-spin" />
                            <span>Creating Account...</span>
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
                <p className="text-center text-muted-foreground pt-4">
                    Already have an account?{' '}
                    <a href="/login" className="text-primary-800 hover:text-secondary-500 font-semibold transition-colors">
                        Sign in
                    </a>
                </p>
            )}
        </form>
    );
}

