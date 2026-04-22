import { useEffect, useState } from 'react';
import { useMembershipStore } from '@/lib/stores/membershipStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Check, Loader2, ArrowLeft, ShieldCheck,
    Zap, Star, Crown, AlertCircle, ExternalLink,
    CreditCard, CalendarClock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, differenceInDays } from 'date-fns';
import type { MembershipPlan } from '@/lib/api/membershipService';

// Helper to determine if a plan is "yearly" (12 months)
const isYearlyPlan = (plan: MembershipPlan) =>
    plan.durationType === 'months' && plan.duration >= 12;

const isMonthlyPlan = (plan: MembershipPlan) =>
    !isYearlyPlan(plan);

// Get plan tier icon
const PlanIcon = ({ name }: { name: string }) => {
    const n = name.toLowerCase();
    if (n.includes('basic')) return <Zap className="h-6 w-6" />;
    if (n.includes('standard') || n.includes('monthly')) return <Star className="h-6 w-6" />;
    return <Crown className="h-6 w-6" />;
};

// Plan card color scheme based on plan name
const planStyle = (name: string, isCurrent: boolean) => {
    const n = name.toLowerCase();
    if (isCurrent) return 'border-2 border-[#DC2626] bg-white shadow-xl shadow-red-100';
    if (n.includes('premium') || n.includes('elite') || n.includes('pro'))
        return 'border-2 border-slate-900 bg-slate-900 text-white shadow-xl';
    if (n.includes('standard') || n.includes('gold') || n.includes('plus'))
        return 'border-2 border-amber-400 bg-white shadow-lg shadow-amber-50';
    return 'border border-slate-200 bg-white shadow-sm';
};

const planAccentColor = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('premium') || n.includes('elite') || n.includes('pro')) return 'text-white';
    if (n.includes('standard') || n.includes('gold') || n.includes('plus')) return 'text-amber-600';
    return 'text-[#DC2626]';
};

export function MembershipPlans() {
    const navigate = useNavigate();
    const { plans, currentMembership, isLoading, error, fetchPlans, fetchMembershipData, startPlanPayment, clearPaymentData } = useMembershipStore();
    const [showYearly, setShowYearly] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [initiating, setInitiating] = useState(false);

    useEffect(() => {
        fetchPlans();
        fetchMembershipData();
    }, [fetchPlans, fetchMembershipData]);

    const filteredPlans = plans.filter(p => showYearly ? isYearlyPlan(p) : isMonthlyPlan(p));
    // Fallback: if no yearly plans exist, show all
    const displayPlans = filteredPlans.length > 0 ? filteredPlans : plans;

    const handleSelectPlan = (plan: MembershipPlan) => {
        setSelectedPlan(plan);
        setConfirmOpen(true);
    };

    const handleConfirmPayment = async () => {
        if (!selectedPlan) return;
        setInitiating(true);
        try {
            const res = await startPlanPayment(selectedPlan._id || selectedPlan.id);
            // Redirect to Stripe Checkout
            if (res?.checkoutUrl) {
                window.location.href = res.checkoutUrl;
            }
        } catch {
            setInitiating(false);
        }
    };

    const isCurrentPlan = (plan: MembershipPlan) =>
        currentMembership?.planId === plan._id || currentMembership?.planId === plan.id;

    const renewsInDays = currentMembership?.endDate
        ? differenceInDays(new Date(currentMembership.endDate), new Date())
        : null;

    return (
        <div className="space-y-10 max-w-5xl mx-auto pb-16">

            {/* Header */}
            <div>
                <Button
                    variant="ghost"
                    className="mb-4 -ml-2 text-slate-500 hover:text-slate-900"
                    onClick={() => navigate('/dashboard/membership')}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Membership
                </Button>

                <div className="text-center space-y-3">
                    <motion.h1
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-black tracking-tighter uppercase text-slate-900"
                    >
                        Choose Your <span className="text-[#DC2626]">Plan</span>
                    </motion.h1>
                    <p className="text-slate-500 font-medium">
                        Upgrade, downgrade, or renew your membership at any time.
                    </p>
                </div>

                {/* Current Plan Banner */}
                {currentMembership && (
                    <div className="mt-6 flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-4">
                        <div className="bg-green-100 p-2 rounded-xl">
                            <ShieldCheck className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-slate-900 text-sm">
                                Current: <span className="text-[#DC2626]">{currentMembership.planName}</span>
                            </p>
                            {currentMembership.endDate && (
                                <p className="text-xs text-slate-500 font-medium">
                                    {renewsInDays !== null && renewsInDays >= 0
                                        ? `Expires in ${renewsInDays} days · ${format(new Date(currentMembership.endDate), 'dd MMM yyyy')}`
                                        : `Expired on ${format(new Date(currentMembership.endDate), 'dd MMM yyyy')}`}
                                </p>
                            )}
                        </div>
                        <Badge
                            variant="outline"
                            className={
                                currentMembership.status === 'active'
                                    ? 'border-green-500 text-green-600'
                                    : 'border-red-400 text-red-500'
                            }
                        >
                            {currentMembership.status.toUpperCase()}
                        </Badge>
                    </div>
                )}
            </div>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4">
                <Label
                    htmlFor="billing-toggle"
                    className={`font-bold text-sm ${!showYearly ? 'text-slate-900' : 'text-slate-400'}`}
                >
                    Monthly
                </Label>
                <Switch
                    id="billing-toggle"
                    checked={showYearly}
                    onCheckedChange={setShowYearly}
                    className="data-[state=checked]:bg-slate-900"
                />
                <Label
                    htmlFor="billing-toggle"
                    className={`font-bold text-sm ${showYearly ? 'text-slate-900' : 'text-slate-400'}`}
                >
                    Yearly <Badge variant="secondary" className="ml-1 text-xs">Best Value</Badge>
                </Label>
            </div>

            {/* Error */}
            {error && (
                <Alert variant="destructive" className="rounded-2xl border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Loading */}
            {isLoading && plans.length === 0 ? (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="h-10 w-10 animate-spin text-[#DC2626]" />
                </div>
            ) : (
                <AnimatePresence mode="wait">
                    <motion.div
                        key={showYearly ? 'yearly' : 'monthly'}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {displayPlans.map((plan, idx) => {
                            const isCurrent = isCurrentPlan(plan);
                            const cardStyle = planStyle(plan.name, isCurrent);
                            const accentColor = planAccentColor(plan.name);
                            const isDark = plan.name.toLowerCase().includes('premium') || plan.name.toLowerCase().includes('elite');

                            return (
                                <motion.div
                                    key={plan._id || plan.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.07 }}
                                    whileHover={{ y: -4 }}
                                >
                                    <Card className={`flex flex-col h-full ${cardStyle} transition-all duration-200 overflow-hidden`}>
                                        {isCurrent && (
                                            <div className="bg-[#DC2626] text-white text-center text-xs font-black uppercase tracking-widest py-1.5">
                                                ✦ Your Current Plan ✦
                                            </div>
                                        )}

                                        <CardHeader className="pb-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className={`p-2 rounded-xl ${isDark ? 'bg-white/10' : 'bg-slate-100'} ${accentColor}`}>
                                                    <PlanIcon name={plan.name} />
                                                </div>
                                                {plan.duration >= 12 && (
                                                    <Badge className="bg-amber-400 text-amber-900 text-xs font-black">
                                                        YEARLY
                                                    </Badge>
                                                )}
                                            </div>

                                            <CardTitle className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                                {plan.name}
                                            </CardTitle>
                                            <CardDescription className={isDark ? 'text-slate-300' : 'text-slate-500'}>
                                                {plan.description}
                                            </CardDescription>

                                            <div className="mt-4">
                                                <div className="flex items-baseline gap-1">
                                                    <span className={`text-4xl font-black ${accentColor}`}>
                                                        {plan.price.toLocaleString()}
                                                    </span>
                                                    <span className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
                                                        LKR / {plan.duration} {plan.durationType}
                                                    </span>
                                                </div>
                                                {plan.duration >= 12 && (
                                                    <p className={`text-xs mt-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                                                        ≈ {Math.round(plan.price / 12).toLocaleString()} LKR/mo
                                                    </p>
                                                )}
                                            </div>
                                        </CardHeader>

                                        <Separator className={isDark ? 'bg-white/10' : ''} />

                                        <CardContent className="flex-1 pt-5 pb-4">
                                            <ul className="space-y-2.5">
                                                {(plan.features || []).map((feature, fi) => (
                                                    <li key={fi} className="flex items-start gap-2 text-sm">
                                                        <Check className={`h-4 w-4 mt-0.5 shrink-0 ${accentColor}`} />
                                                        <span className={isDark ? 'text-slate-200' : 'text-slate-700'}>
                                                            {feature}
                                                        </span>
                                                    </li>
                                                ))}
                                                {(plan.features || []).length === 0 && (
                                                    <li className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                                                        Full gym access included
                                                    </li>
                                                )}
                                            </ul>
                                        </CardContent>

                                        <CardFooter className="pt-0">
                                            <Button
                                                className={`w-full font-bold py-5 rounded-xl transition-all ${isCurrent
                                                    ? 'border-2 border-[#DC2626] text-[#DC2626] bg-transparent hover:bg-red-50'
                                                    : isDark
                                                        ? 'bg-white text-slate-900 hover:bg-slate-100'
                                                        : 'bg-slate-900 hover:bg-black text-white'
                                                    }`}
                                                variant={isCurrent ? 'outline' : 'default'}
                                                onClick={() => !isCurrent && handleSelectPlan(plan)}
                                                disabled={isLoading}
                                            >
                                                {isCurrent ? (
                                                    <span className="flex items-center gap-2">
                                                        <CalendarClock className="h-4 w-4" />
                                                        Renew Early
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-2">
                                                        <CreditCard className="h-4 w-4" />
                                                        Select Plan
                                                    </span>
                                                )}
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </AnimatePresence>
            )}

            {displayPlans.length === 0 && !isLoading && (
                <div className="text-center py-16 text-slate-400">
                    <Crown className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p className="font-bold">No {showYearly ? 'yearly' : 'monthly'} plans available.</p>
                    <Button variant="ghost" className="mt-2 text-[#DC2626]" onClick={() => setShowYearly(!showYearly)}>
                        View {showYearly ? 'monthly' : 'yearly'} plans instead
                    </Button>
                </div>
            )}

            {/* Confirm & Pay Dialog */}
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent className="max-w-md rounded-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black">Confirm Plan Change</DialogTitle>
                        <DialogDescription>
                            You&apos;ll be redirected to Stripe&apos;s secure checkout to complete payment.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedPlan && (
                        <div className="space-y-5 pt-2">
                            <div className="bg-slate-50 rounded-2xl p-5 space-y-3 border border-slate-100">
                                <div className="flex justify-between">
                                    <span className="text-slate-500 font-semibold text-sm">Plan</span>
                                    <span className="font-black text-slate-900">{selectedPlan.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500 font-semibold text-sm">Duration</span>
                                    <span className="font-bold text-slate-700">
                                        {selectedPlan.duration} {selectedPlan.durationType}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500 font-semibold text-sm">Amount</span>
                                    <span className="font-black text-[#DC2626] text-xl">
                                        LKR {selectedPlan.price.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-start gap-2 text-xs text-slate-500 bg-blue-50 rounded-xl p-3 border border-blue-100">
                                <ShieldCheck className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                                <span>Secure payment via Stripe. Your subscription activates automatically after payment.</span>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => { setConfirmOpen(false); clearPaymentData(); }}
                                    disabled={initiating}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold rounded-xl"
                                    onClick={handleConfirmPayment}
                                    disabled={initiating}
                                >
                                    {initiating ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <ExternalLink className="h-4 w-4" />
                                            Pay Now
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
