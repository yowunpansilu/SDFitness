import { useEffect, useState } from 'react';
import { useMembershipStore } from "@/lib/stores/membershipStore";
import { MembershipStatusCard } from "@/components/membership/MembershipStatusCard";
import { UsageStatsCards } from "@/components/membership/UsageStats";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function MembershipDetails() {
    const navigate = useNavigate();
    const { currentMembership, usageStats, plans, isLoading, error, fetchMembershipData, fetchPlans, cancelSubscription } = useMembershipStore();
    const [cancelling, setCancelling] = useState(false);

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

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Membership</h1>
                    <p className="text-muted-foreground mt-1">Manage your subscription and view usage statistics.</p>
                </div>
                <div className="flex gap-3">
                    {currentMembership?.status === 'active' && (
                        <Button variant="outline" onClick={handleCancel} disabled={cancelling}>
                            {cancelling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Cancel Membership
                        </Button>
                    )}
                    <Button onClick={() => navigate('/dashboard/membership/plans')}>
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
        </div>
    );
}
