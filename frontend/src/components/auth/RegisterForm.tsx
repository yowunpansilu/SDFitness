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
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuthStore();

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            // Map frontend display values to backend enum values
            const goalMapping: Record<string, string> = {
                'Weight Loss': 'weight_loss',
                'Muscle Gain': 'muscle_gain',
                'Endurance': 'endurance',
                'Flexibility': 'flexibility',
                'General Fitness': 'general_fitness',
                'Sports Performance': 'athletic_performance'
            };

            const response = await api.post('/auth/register', {
                email: step1Data.email,
                password: step1Data.password,
                firstName: step1Data.firstName,
                lastName: step1Data.lastName,
                role: 'member',
                dateOfBirth: step2Data.dateOfBirth?.toISOString(),
                gender: step2Data.gender.toLowerCase() || 'other',
                height: step2Data.height ? parseInt(step2Data.height) : 170,
                weight: step2Data.weight ? parseInt(step2Data.weight) : 70,
                goal: goalMapping[step3Data.fitnessGoals[0]] || 'general_fitness',
                dietaryPreferences: step3Data.dietaryPreferences.map(pref => {
                    const mappings: Record<string, string> = {
                        'Vegetarian': 'vegetarian',
                        'Vegan': 'vegan',
                        'Keto': 'keto',
                        'Paleo': 'paleo',
                        'Gluten-Free': 'gluten_free',
                        'Dairy-Free': 'dairy_free'
                    };
                    return mappings[pref] || 'none';
                }),
                activityLevel: step3Data.activityLevel || 'moderately_active'
            });
            const { token, user } = response.data;
            login(user, token);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
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
            {error && (
                <div className="p-3 rounded bg-red-500/10 border border-red-500/50 text-red-500 text-sm string">
                    {error}
                </div>
            )}
            {/* Progress Indicator */}
            <div className="flex items-center justify-between mb-8">
                {[1, 2, 3].map((step) => (
                    <div key={step} className="flex items-center flex-1">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step === currentStep
                                ? 'bg-primary-500 text-white scale-110'
                                : step < currentStep
                                    ? 'bg-success text-white'
                                    : 'bg-dark-700 text-gray-400'
                                }`}
                        >
                            {step < currentStep ? '✓' : step}
                        </div>
                        {step < 3 && (
                            <div
                                className={`flex-1 h-1 mx-2 transition-all ${step < currentStep ? 'bg-success' : 'bg-dark-700'
                                    }`}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
                <div className="space-y-4 animate-fade-in">
                    <h3 className="text-xl font-bold text-white mb-4">Basic Information</h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName" className="text-gray-200">First Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    id="firstName"
                                    placeholder="John"
                                    value={step1Data.firstName}
                                    onChange={(e) => setStep1Data({ ...step1Data, firstName: e.target.value })}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="lastName" className="text-gray-200">Last Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    id="lastName"
                                    placeholder="Doe"
                                    value={step1Data.lastName}
                                    onChange={(e) => setStep1Data({ ...step1Data, lastName: e.target.value })}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-200">Email Address</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={step1Data.email}
                                onChange={(e) => setStep1Data({ ...step1Data, email: e.target.value })}
                                className="pl-10"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-gray-200">Phone Number</Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="+1 (555) 000-0000"
                                value={step1Data.phone}
                                onChange={(e) => setStep1Data({ ...step1Data, phone: e.target.value })}
                                className="pl-10"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-gray-200">Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={step1Data.password}
                                onChange={(e) => setStep1Data({ ...step1Data, password: e.target.value })}
                                className="pl-10"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-gray-200">Confirm Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                value={step1Data.confirmPassword}
                                onChange={(e) => setStep1Data({ ...step1Data, confirmPassword: e.target.value })}
                                className="pl-10"
                                required
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Step 2: Health Metrics */}
            {currentStep === 2 && (
                <div className="space-y-4 animate-fade-in">
                    <h3 className="text-xl font-bold text-white mb-4">Health Metrics</h3>

                    <DatePicker
                        id="dob"
                        label="Date of Birth"
                        value={step2Data.dateOfBirth}
                        onChange={(date) => setStep2Data({ ...step2Data, dateOfBirth: date })}
                        placeholder="Select your date of birth"
                    />

                    <div className="space-y-2">
                        <Label className="text-gray-200">Gender</Label>
                        <div className="grid grid-cols-3 gap-2">
                            {['Male', 'Female', 'Other'].map((gender) => (
                                <button
                                    key={gender}
                                    type="button"
                                    onClick={() => setStep2Data({ ...step2Data, gender })}
                                    className={`py-3 px-4 rounded-lg font-medium transition-all ${step2Data.gender === gender
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                                        }`}
                                >
                                    {gender}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="height" className="text-gray-200">Height</Label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        id="height"
                                        type="number"
                                        placeholder="170"
                                        value={step2Data.height}
                                        onChange={(e) => setStep2Data({ ...step2Data, height: e.target.value })}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                                <select
                                    value={step2Data.heightUnit}
                                    onChange={(e) => setStep2Data({ ...step2Data, heightUnit: e.target.value as 'cm' | 'ft' })}
                                    className="px-4 py-2 bg-dark-700 border border-dark-600 text-white rounded-md"
                                >
                                    <option value="cm">cm</option>
                                    <option value="ft">ft</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="weight" className="text-gray-200">Weight</Label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Weight className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        id="weight"
                                        type="number"
                                        placeholder="70"
                                        value={step2Data.weight}
                                        onChange={(e) => setStep2Data({ ...step2Data, weight: e.target.value })}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                                <select
                                    value={step2Data.weightUnit}
                                    onChange={(e) => setStep2Data({ ...step2Data, weightUnit: e.target.value as 'kg' | 'lbs' })}
                                    className="px-4 py-2 bg-dark-700 border border-dark-600 text-white rounded-md"
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
                    <h3 className="text-xl font-bold text-white mb-4">Goals & Preferences</h3>

                    <div className="space-y-2">
                        <Label className="text-gray-200">Fitness Goals (Select all that apply)</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {['Weight Loss', 'Muscle Gain', 'Endurance', 'Flexibility', 'General Fitness', 'Sports Performance'].map((goal) => (
                                <button
                                    key={goal}
                                    type="button"
                                    onClick={() => toggleGoal(goal)}
                                    className={`py-3 px-4 rounded-lg font-medium transition-all text-left ${step3Data.fitnessGoals.includes(goal)
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                                        }`}
                                >
                                    {goal}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-gray-200">Activity Level</Label>
                        <div className="space-y-2">
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
                                        : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                                        }`}
                                >
                                    {level.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-gray-200">Dietary Preferences (Optional)</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {['Vegetarian', 'Vegan', 'Keto', 'Paleo', 'Gluten-Free', 'Dairy-Free'].map((pref) => (
                                <button
                                    key={pref}
                                    type="button"
                                    onClick={() => toggleDietaryPreference(pref)}
                                    className={`py-3 px-4 rounded-lg font-medium transition-all ${step3Data.dietaryPreferences.includes(pref)
                                        ? 'bg-secondary-500 text-white'
                                        : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
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
                                className="mt-1 w-4 h-4 rounded border-dark-600 bg-dark-700 text-primary-500 focus:ring-2 focus:ring-primary-500/20"
                            />
                            <span className="text-sm text-gray-300">
                                I agree to the{' '}
                                <a href="/terms" className="text-primary-400 hover:text-primary-300">
                                    Terms of Service
                                </a>{' '}
                                and{' '}
                                <a href="/privacy" className="text-primary-400 hover:text-primary-300">
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
                        className="flex-1 border-dark-600 hover:border-primary-500 hover:bg-dark-800"
                    >
                        Back
                    </Button>
                )}
                <Button
                    type="submit"
                    variant="gym"
                    className="flex-1 text-lg py-6"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
                <p className="text-center text-gray-400 pt-4">
                    Already have an account?{' '}
                    <a href="/login" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">
                        Sign in
                    </a>
                </p>
            )}
        </form>
    );
}
