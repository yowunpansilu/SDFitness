import { useEffect, useState } from 'react';
import { useMembershipStore } from "@/lib/stores/membershipStore";
import { MembershipStatusCard } from "@/components/membership/MembershipStatusCard";
import { UsageStatsCards } from "@/components/membership/UsageStats";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { differenceInDays } from "date-fns";
import { FreezeDialog } from "@/components/membership/FreezeDialog";

export function MembershipDetails() {
    const navigate = useNavigate();
    const { currentMembership, usageStats, plans, isLoading, error, fetchMembershipData, fetchPlans, cancelSubscription, freezeSubscription } = useMembershipStore();
    const [cancelling, setCancelling] = useState(false);
    const [isFreezeOpen, setIsFreezeOpen] = useState(false);

    useEffect(() => {
        fetchMembershipData();
        fetchPlans();
    }, [fetchMembershipData, fetchPlans]);

    const currentPlan = plans.find(p => p.id === currentMembership?.planId);

    const handleCancel = async () => {
        if (confirm("Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.")) {
            setCancelling(true);
            try {
                await cancelSubscription();
            } finally {
                setCancelling(false);
            }
        }
    };

    if (isLoading && !currentMembership) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    const daysToRenewal = currentMembership ? differenceInDays(new Date(currentMembership.endDate), new Date()) : 999;
    const showRenewalAlert = currentMembership?.status === 'active' && currentMembership.autoRenew && daysToRenewal <= 7 && daysToRenewal >= 0;

    return (
        <div className="space-y-8 animate-fade-in">
            {showRenewalAlert && (
                <Alert className="bg-yellow-500/10 border-yellow-500/50 text-yellow-600 dark:text-yellow-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <AlertTitle>Renewal Reminder</AlertTitle>
                    <AlertDescription>
                        Your membership renews in {daysToRenewal === 0 ? 'today' : `${daysToRenewal} days`}.
                    </AlertDescription>
                </Alert>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-headline font-bold text-foreground tracking-wide">My Membership</h1>
                    <p className="text-muted-foreground mt-1">Manage your subscription and view usage statistics.</p>
                </div>
                <div className="flex gap-3">
                    {currentMembership?.status === 'active' && (
                        <>
                            <Button variant="outline" onClick={() => setIsFreezeOpen(true)} className="bg-transparent border-border text-foreground hover:bg-muted hover:text-foreground">
                                Freeze
                            </Button>
                            <Button variant="outline" onClick={handleCancel} disabled={cancelling} className="bg-transparent border-red-900/50 text-red-500 hover:bg-red-900/20 hover:text-red-400 hover:border-red-900">
                                {cancelling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Cancel Membership
                            </Button>
                        </>
                    )}
                    <Button onClick={() => navigate('/dashboard/membership/plans')} className="bg-primary-500 hover:bg-primary-600 text-white">
                        Change Plan
                    </Button>
                </div>
            </div>

            {currentMembership && (
                <MembershipStatusCard
                    membership={currentMembership}
                    plan={currentPlan}
                    onManage={() => navigate('/dashboard/membership/plans')}
                />
            )}

            {usageStats && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Usage Statistics</h2>
                    <UsageStatsCards stats={usageStats} />
                </div>
            )}

            <FreezeDialog
                isOpen={isFreezeOpen}
                onClose={() => setIsFreezeOpen(false)}
                onConfirm={freezeSubscription}
            />
        </div>
    );
}
