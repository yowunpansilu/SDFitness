import { useEffect, useState } from 'react';
import { useBillingStore } from "@/lib/stores/billingStore";
import { useMembershipStore } from "@/lib/stores/membershipStore";
import { PaymentHistory } from "@/components/billing/PaymentHistory";
import { PaymentMethods } from "@/components/billing/PaymentMethods";
import { Loader2, ShieldCheck, Zap, ArrowUpRight, CreditCard, ExternalLink } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export function BillingOverview() {
    const { fetchBillingData, isLoading: billingLoading, error: billingError, startPayment } = useBillingStore();
    const { currentMembership, isLoading: membershipLoading, fetchMembershipData, fetchPlans } = useMembershipStore();
    const [isInitiating, setIsInitiating] = useState(false);
    const [initiateError, setInitiateError] = useState<string | null>(null);

    useEffect(() => {
        fetchBillingData();
        fetchMembershipData();
        fetchPlans();
    }, [fetchBillingData, fetchMembershipData, fetchPlans]);

    const handleRenew = async () => {
        if (!currentMembership) return;

        setIsInitiating(true);
        setInitiateError(null);
        try {
            const res = await startPayment({
                amount: currentMembership.plan?.price || 35,
                currency: 'lkr',
                description: `Renewal: ${currentMembership.planName}`,
                planId: currentMembership.planId
            });
            // Redirect to Stripe Checkout
            if (res?.checkoutUrl) {
                window.location.href = res.checkoutUrl;
            }
        } catch (err: any) {
            console.error('Renewal Error:', err);
            setInitiateError(err?.message || 'Failed to initiate payment. Please try again.');
            setIsInitiating(false);
        }
    };

    const isLoading = billingLoading || membershipLoading;
    const error = billingError;

    if (isLoading && !isInitiating) {
        return (
            <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
                <Loader2 className="h-10 w-10 animate-spin text-[#DC2626]" />
                <p className="text-slate-500 mt-4 font-bold uppercase tracking-widest text-xs">Loading billing data</p>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive" className="border-2 border-red-200 bg-red-50 rounded-2xl">
                <AlertTitle className="font-black uppercase tracking-tight">Error</AlertTitle>
                <AlertDescription className="font-medium">{error}</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
            >
                <h1 className="text-4xl font-black tracking-tighter uppercase italic text-slate-900">
                    Billing <span className="text-[#DC2626]">Portal</span>
                </h1>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">
                    Manage your elite access
                </p>
            </motion.div>

            {/* Elite Renewal Card */}
            <motion.div
                whileHover={{ y: -5 }}
                className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden group"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#DC2626] rounded-bl-full opacity-20 group-hover:scale-110 transition-transform" />
                <Zap className="absolute bottom-4 right-4 h-24 w-24 text-white/5" />

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="bg-[#DC2626] p-1.5 rounded-lg">
                            <ShieldCheck className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-black uppercase tracking-wider text-sm">Membership Status</span>
                    </div>

                    <h2 className="text-3xl font-black mb-1">
                        {currentMembership?.planName || 'No Active Plan'}
                    </h2>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-8">
                        {currentMembership?.endDate
                            ? `Next Renewal: ${format(new Date(currentMembership.endDate), 'dd MMM yyyy')}`
                            : 'No active subscription'}
                    </p>

                    {initiateError && (
                        <div className="mb-4 bg-red-900/40 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm font-medium">
                            {initiateError}
                        </div>
                    )}

                    <div className="space-y-4">
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button
                                onClick={handleRenew}
                                disabled={isInitiating}
                                className="w-full bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold py-6 rounded-xl shadow-lg border-b-4 border-[#991B1B] active:border-b-0 active:mt-1 transition-all flex items-center justify-center gap-3 text-lg uppercase tracking-wider"
                            >
                                {isInitiating ? (
                                    <><Loader2 className="h-6 w-6 animate-spin" /> Redirecting to Stripe...</>
                                ) : (
                                    <><CreditCard className="h-6 w-6" /> Renew Membership Now <ExternalLink className="h-4 w-4 ml-1 opacity-70" /></>
                                )}
                            </Button>
                        </motion.div>
                        <p className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
                            Securely processed by <span className="text-white">Stripe</span>
                        </p>
                    </div>
                </div>
            </motion.div>

            <div className="grid gap-8">
                <PaymentMethods />

                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="font-black uppercase tracking-tight text-xl text-slate-900">Transaction History</h3>
                        <Button variant="ghost" className="text-[#DC2626] font-bold text-xs uppercase tracking-widest hover:bg-red-50">
                            View All <ArrowUpRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                    <PaymentHistory />
                </div>
            </div>
        </div>
    );
}
