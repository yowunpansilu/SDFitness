import { useState, useEffect } from 'react';
import { Target, CheckCircle, Loader2, Brain, Salad, ShoppingCart, ChefHat } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import type { WizardFormData, DietPlan } from '@/lib/api/dietPlanApi';
import { generateDietPlan } from '@/lib/api/dietPlanApi';

interface DietPlanWizardProps {
    onComplete: (plan: DietPlan) => void;
    onCancel: () => void;
}

export function DietPlanWizard({ onComplete, onCancel }: DietPlanWizardProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationStage, setGenerationStage] = useState(0);

    const generationStages = [
        { icon: Brain, label: 'Analyzing your profile...', detail: 'Calculating TDEE & macro targets' },
        { icon: Salad, label: 'ML model scoring foods...', detail: 'Ranking foods for your goals' },
        { icon: ShoppingCart, label: 'Building 7-day plan...', detail: 'Optimizing portions & budget' },
        { icon: ChefHat, label: 'Crafting Sri Lankan Recipes...', detail: 'Adding authentic spices & steps' },
        { icon: ShoppingCart, label: 'Building shopping list...', detail: 'Including pantry essentials' }
    ];

    useEffect(() => {
        if (isGenerating && generationStage < generationStages.length - 1) {
            const timer = setTimeout(() => setGenerationStage(s => s + 1), 3500);
            return () => clearTimeout(timer);
        }
    }, [isGenerating, generationStage]);
    const [formData, setFormData] = useState<WizardFormData>(() => {
        const saved = localStorage.getItem('diet_wizard_form');
        return saved ? JSON.parse(saved) : {
            goal: '',
            dietaryPreferences: [],
            allergies: '',
            budget: 1000,
            activityLevel: '',
        };
    });

    useEffect(() => {
        localStorage.setItem('diet_wizard_form', JSON.stringify(formData));
    }, [formData]);

    const totalSteps = 5;

    const goals = [
        { value: 'weight-loss', label: 'Weight Loss', icon: Target, description: 'Calorie deficit for fat loss' },
        { value: 'muscle-gain', label: 'Muscle Gain', icon: Target, description: 'Calorie surplus for muscle growth' },
        { value: 'maintenance', label: 'Maintenance', icon: Target, description: 'Maintain current weight' },
    ];

    const dietaryOptions = [
        'Vegetarian',
        'Vegan',
        'Keto',
        'Paleo',
        'Gluten-Free',
        'Dairy-Free',
        'Low-Carb',
        'High-Protein',
    ];

    const activityLevels = [
        { value: 'sedentary', label: 'Sedentary', description: 'Little to no exercise' },
        { value: 'light', label: 'Light', description: '1-3 days/week' },
        { value: 'moderate', label: 'Moderate', description: '3-5 days/week' },
        { value: 'active', label: 'Active', description: '6-7 days/week' },
        { value: 'very-active', label: 'Very Active', description: '2x per day' },
    ];

    const toggleDietaryPreference = (option: string) => {
        setFormData(prev => ({
            ...prev,
            dietaryPreferences: prev.dietaryPreferences.includes(option)
                ? prev.dietaryPreferences.filter(item => item !== option)
                : [...prev.dietaryPreferences, option]
        }));
    };

    const canProceed = () => {
        switch (currentStep) {
            case 1:
                return formData.goal !== '';
            case 2:
                return true; // Dietary preferences are optional
            case 3:
                return true; // Allergies are optional
            case 4:
                return formData.budget > 0;
            case 5:
                return formData.activityLevel !== '';
            default:
                return false;
        }
    };

    const handleNext = () => {
        if (canProceed() && currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        setGenerationStage(0);
        try {
            const plan = await generateDietPlan(formData);
            localStorage.removeItem('diet_wizard_form');
            onComplete(plan);
        } catch (error) {
            console.error('Error generating diet plan:', error);
        } finally {
            setIsGenerating(false);
            setGenerationStage(0);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Progress Indicator */}
            <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Step {currentStep} of {totalSteps}</span>
                    <span>{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-300"
                        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                    />
                </div>
            </div>

            {/* Step Content */}
            <Card className="border-border">
                <CardContent className="p-8">
                    {/* Step 1: Goals */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold text-foreground mb-2">What's Your Goal?</h2>
                                <p className="text-muted-foreground">Choose your primary fitness objective</p>
                            </div>
                            <div className="grid gap-4">
                                {goals.map((goal) => {
                                    const Icon = goal.icon;
                                    return (
                                        <button
                                            key={goal.value}
                                            onClick={() => setFormData({ ...formData, goal: goal.value })}
                                            className={`p-6 rounded-lg border-2 transition-all text-left ${formData.goal === goal.value
                                                ? 'border-primary-500 bg-primary-500/10'
                                                : 'border-border bg-card hover:border-dark-500'
                                                }`}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className={`p-3 rounded-lg ${formData.goal === goal.value
                                                    ? 'bg-primary-500'
                                                    : 'bg-muted'
                                                    }`}>
                                                    <Icon className="w-6 h-6 text-foreground" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-foreground mb-1">
                                                        {goal.label}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">{goal.description}</p>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Dietary Preferences */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold text-foreground mb-2">Dietary Preferences</h2>
                                <p className="text-muted-foreground">Select any dietary preferences (optional)</p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {dietaryOptions.map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => toggleDietaryPreference(option)}
                                        className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${formData.dietaryPreferences.includes(option)
                                            ? 'bg-primary-500 text-white'
                                            : 'bg-muted text-muted-foreground hover:bg-accent'
                                            }`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Allergies */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold text-foreground mb-2">Allergies & Restrictions</h2>
                                <p className="text-muted-foreground">List any food allergies or restrictions</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="allergies">Allergies (comma-separated)</Label>
                                <Textarea
                                    id="allergies"
                                    placeholder="e.g., peanuts, shellfish, dairy..."
                                    value={formData.allergies}
                                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                                    rows={4}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Leave blank if you have no allergies
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Budget */}
                    {currentStep === 4 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold text-foreground mb-2">Weekly Budget</h2>
                                <p className="text-muted-foreground">Set your weekly food budget in LKR</p>
                            </div>
                            <div className="space-y-4">
                                <div className="text-center">
                                    <div className="text-5xl font-bold text-primary-500 mb-2">
                                        LKR {formData.budget.toLocaleString()}
                                    </div>
                                    <p className="text-muted-foreground">per week</p>
                                </div>
                                <input
                                    type="range"
                                    min="1000"
                                    max="15000"
                                    step="500"
                                    value={formData.budget}
                                    onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) })}
                                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary-500"
                                />
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>LKR 1,000</span>
                                    <span>LKR 15,000</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 5: Activity Level & Review */}
                    {currentStep === 5 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold text-foreground mb-2">Activity Level</h2>
                                <p className="text-muted-foreground">How active are you?</p>
                            </div>
                            <div className="grid gap-3">
                                {activityLevels.map((level) => (
                                    <button
                                        key={level.value}
                                        onClick={() => setFormData({ ...formData, activityLevel: level.value })}
                                        className={`p-4 rounded-lg border-2 transition-all text-left ${formData.activityLevel === level.value
                                            ? 'border-primary-500 bg-primary-500/10'
                                            : 'border-border bg-card hover:border-dark-500'
                                            }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="font-semibold text-foreground">{level.label}</h3>
                                                <p className="text-sm text-muted-foreground">{level.description}</p>
                                            </div>
                                            {formData.activityLevel === level.value && (
                                                <CheckCircle className="w-5 h-5 text-primary-500" />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
                <Button
                    variant="outline"
                    onClick={currentStep === 1 ? onCancel : handlePrevious}
                >
                    {currentStep === 1 ? 'Cancel' : 'Previous'}
                </Button>

                {currentStep < totalSteps ? (
                    <Button
                        variant="gym"
                        onClick={handleNext}
                        disabled={!canProceed()}
                    >
                        Next Step
                    </Button>
                ) : isGenerating ? (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 p-4">
                        <div className="bg-card w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 flex flex-col items-center">
                            <div className="w-20 h-20 rounded-3xl bg-primary-50 border border-primary-100 flex items-center justify-center mb-6 shadow-inner relative overflow-hidden">
                                <div className="absolute inset-0 bg-primary-100/50 animate-pulse pointer-events-none" />
                                <Loader2 className="w-8 h-8 text-primary-600 animate-spin relative z-10" />
                            </div>
                            <h3 className="text-xl font-black text-foreground mb-8 text-center tracking-tight">Crafting Your Plan...</h3>
                            <div className="w-full space-y-5">
                                {generationStages.map((stage, i) => {
                                    const StageIcon = stage.icon;
                                    const isActive = i === generationStage;
                                    const isDone = i < generationStage;
                                    return (
                                        <div key={i} className={`flex items-center gap-4 transition-all duration-500 ${isDone ? 'opacity-50' : isActive ? 'opacity-100 transform scale-105' : 'opacity-20'}`}>
                                            <div className={`p-2 rounded-xl flex-shrink-0 ${isDone ? 'bg-green-50 text-green-500' : isActive ? 'bg-primary-50 text-primary-600 shadow-sm' : 'bg-muted text-muted-foreground'}`}>
                                                {isDone ? (
                                                    <CheckCircle className="w-5 h-5" />
                                                ) : isActive ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <StageIcon className="w-5 h-5" />
                                                )}
                                            </div>
                                            <div>
                                                <div className={`text-sm font-bold tracking-tight ${isActive ? 'text-primary-900' : 'text-muted-foreground'}`}>
                                                    {stage.label}
                                                </div>
                                                <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/70">{stage.detail}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    <Button
                        variant="gym"
                        onClick={handleGenerate}
                        disabled={!canProceed()}
                        className="gap-2"
                    >
                        <Brain className="w-4 h-4" />
                        Generate with AI
                    </Button>
                )}
            </div>
        </div>
    );
}
