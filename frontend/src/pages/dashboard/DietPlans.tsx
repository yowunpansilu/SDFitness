import { useState, useEffect } from 'react';
import { Plus, Calendar, Target, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DietPlanWizard } from '@/components/diet/DietPlanWizard';
import { DietPlanDisplay } from '@/components/diet/DietPlanDisplay';
import type { DietPlan } from '@/lib/api/dietPlanApi';
import { fetchDietPlans, updateDietPlan } from '@/lib/api/dietPlanApi';
import { useAuthStore } from '@/lib/stores/authStore';
import { useDietStore } from '@/lib/stores/dietStore';

export function DietPlans() {
    const { member } = useAuthStore();
    const { currentPlan, isSaving, setCurrentPlan, updateCurrentPlan, saveGeneratedPlan } = useDietStore();
    const [showWizard, setShowWizard] = useState(false);
    const [savedPlans, setSavedPlans] = useState<DietPlan[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const loadPlans = async () => {
        if (!member?._id) return;
        setIsLoading(true);
        try {
            const plans = await fetchDietPlans(member._id);
            setSavedPlans(plans);
        } catch (error) {
            console.error('Error loading plans:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (member?._id && !showWizard && !currentPlan) {
            loadPlans();
        }
    }, [member?._id, showWizard, currentPlan]);

    const handleWizardComplete = async (plan: DietPlan) => {
        try {
            await saveGeneratedPlan(plan);
            setShowWizard(false);
            loadPlans();
        } catch (error) {
            console.error('Error saving new plan:', error);
            // Even if save fails, we show the plan in the UI
            setCurrentPlan(plan);
            setShowWizard(false);
        }
    };

    const handlePlanChange = (updates: Partial<DietPlan>) => {
        updateCurrentPlan(updates);
    };



    const handleSavePlan = async () => {
        if (currentPlan) {
            try {
                if (currentPlan._id) {
                    try {
                        await updateDietPlan(currentPlan._id, currentPlan);
                        alert('Diet plan updated successfully!');
                    } catch (updateError: any) {
                        // If update fails (e.g. 404), it might be a generated plan not yet in DB
                        if (updateError.response?.status === 404) {
                            await saveGeneratedPlan(currentPlan);
                            alert('Diet plan saved successfully!');
                        } else {
                            throw updateError;
                        }
                    }
                } else {
                    await saveGeneratedPlan(currentPlan);
                    alert('Diet plan saved successfully!');
                }
                await loadPlans();
            } catch (error) {
                console.error('Error saving plan:', error);
                alert('Failed to save diet plan.');
            }
        }
    };

    const handleViewPlan = (plan: DietPlan) => {
        setCurrentPlan(plan);
    };

    // If showing wizard
    if (showWizard) {
        return (
            <div className="space-y-6 animate-fade-in">
                <div>
                    <h1 className="text-3xl font-headline font-bold text-foreground">Generate Diet Plan</h1>
                    <p className="text-muted-foreground mt-2">
                        Answer a few questions to get your personalized meal plan
                    </p>
                </div>
                <DietPlanWizard
                    onComplete={handleWizardComplete}
                    onCancel={() => setShowWizard(false)}
                />
            </div>
        );
    }

    // If viewing a plan
    if (currentPlan) {
        return (
            <div className="space-y-6 animate-fade-in">
                <Button
                    variant="outline"
                    onClick={() => setCurrentPlan(null)}
                >
                    ← Back to Diet Plans
                </Button>
                <DietPlanDisplay
                    plan={currentPlan}
                    onSave={handleSavePlan}
                    onChange={handlePlanChange}
                    isSaving={isSaving}
                />
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
        );
    }

    // Main diet plans page
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-headline font-bold text-foreground">Diet Plans</h1>
                    <p className="text-muted-foreground mt-2">
                        AI-powered personalized meal plans for your fitness goals
                    </p>
                </div>
                <Button variant="gym" onClick={() => setShowWizard(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Generate New Plan
                </Button>
            </div>

            {/* Saved Plans */}
            {savedPlans.length > 0 ? (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-foreground">Your Saved Plans</h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {savedPlans.map((plan) => (
                            <Card
                                key={plan._id || plan.id}
                                className="border-border hover:border-primary-500/50 transition-all cursor-pointer group"
                                onClick={() => handleViewPlan(plan)}
                            >
                                <CardContent className="p-6">
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-semibold text-foreground">{plan.name || 'Plan'}</h3>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {plan.createdAt ? new Date(plan.createdAt).toLocaleDateString() : 'N/A'}
                                                </p>
                                            </div>
                                            <Target className="w-5 h-5 text-primary-500" />
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Calendar className="w-4 h-4" />
                                            <span>7-day plan</span>
                                        </div>
                                        {plan.preferences?.dietary && plan.preferences.dietary.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                                {plan.preferences.dietary.slice(0, 2).map((pref) => (
                                                    <span
                                                        key={pref}
                                                        className="px-2 py-1 bg-card text-xs text-muted-foreground rounded"
                                                    >
                                                        {pref}
                                                    </span>
                                                ))}
                                                {plan.preferences.dietary.length > 2 && (
                                                    <span className="px-2 py-1 bg-card text-xs text-muted-foreground rounded">
                                                        +{plan.preferences.dietary.length - 2}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            ) : (
                /* Empty State */
                <Card className="border-border">
                    <CardContent className="p-12 text-center">
                        <div className="max-w-md mx-auto space-y-4">
                            <div className="w-16 h-16 bg-primary-500/10 rounded-full flex items-center justify-center mx-auto">
                                <Target className="w-8 h-8 text-primary-500" />
                            </div>
                            <h3 className="text-xl font-semibold text-foreground">No Diet Plans Yet</h3>
                            <p className="text-muted-foreground">
                                Generate your first AI-powered diet plan tailored to your fitness goals,
                                dietary preferences, and budget.
                            </p>
                            <Button variant="gym" onClick={() => setShowWizard(true)} className="gap-2">
                                <Plus className="w-4 h-4" />
                                Generate Your First Plan
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
