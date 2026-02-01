import { useEffect, useState } from 'react';
import { useMembershipStore } from "@/lib/stores/membershipStore";
import { PlanCard } from "@/components/membership/PlanCard";
import { UpgradeDialog } from "@/components/membership/UpgradeDialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

import type { BillingCycle } from "@/lib/api/membershipService";

export function MembershipPlans() {
    const navigate = useNavigate();
    const { plans, currentMembership, isLoading, fetchPlans, changePlan } = useMembershipStore();
    const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchPlans();
        if (currentMembership) {
            setBillingCycle(currentMembership.billingCycle);
        }
    }, [fetchPlans, currentMembership]);

    const handleSelectPlan = (planId: string) => {
        setSelectedPlanId(planId);
        setIsDialogOpen(true);
    };

    const handleConfirmChange = async () => {
        if (!selectedPlanId) return;

        setUpdating(true);
        try {
            await changePlan(selectedPlanId, billingCycle);
            navigate('/dashboard/membership');
        } catch (error) {
            console.error(error);
        } finally {
            setUpdating(false);
            setIsDialogOpen(false);
        }
    };

    if (isLoading && plans.length === 0) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const selectedPlan = plans.find(p => p.id === selectedPlanId);
    const currentPlan = plans.find(p => p.id === currentMembership?.planId);

    // Determine if this is an upgrade (higher price)
    const isUpgrade = selectedPlan && currentPlan
        ? (billingCycle === 'monthly' ? selectedPlan.monthlyPrice : selectedPlan.yearlyPrice) >
        (billingCycle === 'monthly' ? currentPlan.monthlyPrice : currentPlan.yearlyPrice)
        : true;

    return (
        <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
            <div className="flex flex-col gap-4">
                <Button
                    variant="ghost"
                    className="w-fit -ml-2 text-muted-foreground"
                    onClick={() => navigate('/dashboard/membership')}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Membership
                </Button>

                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Choose Your Plan</h1>
                    <p className="text-muted-foreground">
                        Select the perfect plan for your fitness journey. Change or cancel anytime.
                    </p>
                </div>

                <div className="flex justify-center items-center gap-4 mt-4">
                    <Label htmlFor="billing-mode" className={billingCycle === 'monthly' ? 'font-bold' : 'text-muted-foreground'}>
                        Monthly
                    </Label>
                    <Switch
                        id="billing-mode"
                        checked={billingCycle === 'yearly'}
                        onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
                    />
                    <Label htmlFor="billing-mode" className={billingCycle === 'yearly' ? 'font-bold' : 'text-muted-foreground'}>
                        Yearly <span className="text-xs text-primary ml-1 font-normal">(Save ~20%)</span>
                    </Label>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
                {plans.map((plan) => (
                    <PlanCard
                        key={plan.id}
                        plan={plan}
                        billingCycle={billingCycle}
                        isCurrent={currentMembership?.planId === plan.id}
                        onSelect={handleSelectPlan}
                        isLoading={updating}
                    />
                ))}
            </div>

            {selectedPlan && (
                <UpgradeDialog
                    isOpen={isDialogOpen}
                    onClose={() => setIsDialogOpen(false)}
                    onConfirm={handleConfirmChange}
                    planName={selectedPlan.name}
                    isUpgrade={isUpgrade}
                />
            )}
        </div>
    );
}
