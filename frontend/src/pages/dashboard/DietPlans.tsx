import { useState, useEffect } from 'react';
import { Plus, Calendar, Target, Loader2, Trash2, CheckCircle, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DietPlanWizard } from '@/components/diet/DietPlanWizard';
import { DietPlanDisplay } from '@/components/diet/DietPlanDisplay';
import type { DietPlan } from '@/lib/api/dietPlanApi';
import { fetchDietPlans, saveDietPlan, updateDietPlan, deleteDietPlan } from '@/lib/api/dietPlanApi';

export function DietPlans() {
    const [showWizard, setShowWizard] = useState(false);
    const [currentPlan, setCurrentPlan] = useState<DietPlan | null>(null);
    const [savedPlans, setSavedPlans] = useState<DietPlan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const loadPlans = async () => {
            setIsLoading(true);
            try {
                const plans = await fetchDietPlans();
                setSavedPlans(plans);
            } catch (error) {
                console.error('Error loading plans:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (!showWizard && !currentPlan) {
            loadPlans();
        }
    }, [showWizard, currentPlan]);

    const handleWizardComplete = (plan: DietPlan) => {
        setCurrentPlan(plan);
        setShowWizard(false);
    };

    const handleSavePlan = async () => {
        if (currentPlan) {
            setIsSaving(true);
            try {
                const saved = await saveDietPlan(currentPlan);
                setSavedPlans([saved, ...savedPlans]);
                alert('Diet plan saved successfully!');
                setCurrentPlan(null); // Return to list after saving
            } catch (error) {
                console.error('Error saving plan:', error);
                alert('Failed to save diet plan. Please try again.');
            } finally {
                setIsSaving(false);
            }
        }
    };

    const handleViewPlan = (plan: DietPlan) => {
        setCurrentPlan(plan);
    };

    const handleDeletePlan = async (e: React.MouseEvent, planId: string) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this diet plan?')) {
            // If it's a mock plan generated for preview/fallback, just remove from UI
            if (planId.startsWith('mock-')) {
                setSavedPlans(savedPlans.filter(p => p.id !== planId));
                return;
            }

            try {
                await deleteDietPlan(planId);
                setSavedPlans(savedPlans.filter(p => p.id !== planId));
            } catch (error) {
                console.error('Error deleting plan:', error);
                alert('Failed to delete plan.');
            }
        }
    };

    const handleToggleActive = async (e: React.MouseEvent, planId: string, currentActive: boolean) => {
        e.stopPropagation();
        try {
            await updateDietPlan(planId, { isActive: !currentActive });
            // Reload all plans because setting one active might deactivate others
            const plans = await fetchDietPlans();
            setSavedPlans(plans);
        } catch (error) {
            console.error('Error updating plan:', error);
        }
    };

    const handleRenamePlan = async (e: React.MouseEvent, plan: DietPlan) => {
        e.stopPropagation();
        const newName = prompt('Enter new name for the diet plan:', plan.planName || plan.name);
        if (newName && newName !== (plan.planName || plan.name)) {
            try {
                await updateDietPlan(plan.id, { planName: newName });
                setSavedPlans(savedPlans.map(p => p.id === plan.id ? { ...p, planName: newName, name: newName } : p));
            } catch (error) {
                console.error('Error renaming plan:', error);
            }
        }
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
                                key={plan.id}
                                className={cn(
                                    "border-border hover:border-primary-500/50 transition-all cursor-pointer relative group",
                                    plan.isActive && "border-primary-500 bg-primary-500/5 shadow-md shadow-primary-500/10"
                                )}
                                onClick={() => handleViewPlan(plan)}
                            >
                                <CardContent className="p-6">
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div className="pr-12">
                                                <div className="flex items-center gap-2 group/title">
                                                    <h3 className="font-semibold text-foreground truncate">{plan.name || plan.planName || 'Plan'}</h3>
                                                    <Edit2 
                                                        className="w-3 h-3 text-muted-foreground opacity-0 group-hover/title:opacity-100 cursor-pointer hover:text-primary-500" 
                                                        onClick={(e: React.MouseEvent) => handleRenamePlan(e, plan)}
                                                    />
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {plan.createdAt ? new Date(plan.createdAt).toLocaleDateString() : 'N/A'}
                                                </p>
                                            </div>
                                            <Target className={cn("w-5 h-5", plan.isActive ? "text-primary-600" : "text-primary-500/40")} />
                                        </div>
                                        
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Calendar className="w-4 h-4" />
                                                <span>7-day plan</span>
                                            </div>
                                            {plan.isActive && (
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-primary-600 bg-primary-100 px-2 py-0.5 rounded-full">
                                                    Active Plan
                                                </span>
                                            )}
                                        </div>

                                        {/* Action Overlay */}
                                        <div className="flex gap-2 pt-2">
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className={cn(
                                                    "h-8 px-2 flex-1 gap-1.5 transition-all border border-transparent", 
                                                    plan.isActive 
                                                        ? "text-primary-700 bg-primary-50 hover:bg-primary-100 border-primary-200" 
                                                        : "text-muted-foreground hover:bg-primary-100/50 hover:text-primary-700 hover:border-primary-100"
                                                )}
                                                onClick={(e) => handleToggleActive(e, plan.id, !!plan.isActive)}
                                            >
                                                <CheckCircle className={cn("w-3.5 h-3.5", plan.isActive ? "fill-primary-500 text-primary-50" : "")} />
                                                {plan.isActive ? 'Active' : 'Set Active'}
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="h-8 px-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                onClick={(e) => handleDeletePlan(e, plan.id)}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                Delete
                                            </Button>
                                        </div>
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
