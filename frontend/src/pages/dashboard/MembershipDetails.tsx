import { useEffect, useState } from 'react';
import { useMembershipStore } from '@/lib/stores/membershipStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Loader2, ShieldCheck, Zap, Star, Calendar,
    ArrowUpRight, AlertCircle, RotateCcw, Pause, X,
    Crown, Clock, CheckCircle2
} from 'lucide-react';
import { differenceInDays, format } from 'date-fns';
import { FreezeDialog } from '@/components/membership/FreezeDialog';

const statusConfig = {
    active: { label: 'Active', color: 'border-green-500 text-green-600 bg-green-50' },
    expired: { label: 'Expired', color: 'border-red-400 text-red-500 bg-red-50' },
    cancelled: { label: 'Cancelled', color: 'border-slate-400 text-slate-500 bg-slate-50' },
    frozen: { label: 'Frozen', color: 'border-blue-400 text-blue-500 bg-blue-50' },
};

export function MembershipDetails() {
    const navigate = useNavigate();
    const {
        currentMembership,
        usageStats,
        plans,
        isLoading,
        error,
        fetchMembershipData,
        fetchPlans,
        cancelSubscription,
        freezeSubscription,
    } = useMembershipStore();

    const [cancelling, setCancelling] = useState(false);
    const [isFreezeOpen, setIsFreezeOpen] = useState(false);

    useEffect(() => {
        fetchMembershipData();
        fetchPlans();
    }, []);

    const currentPlan = currentMembership?.plan
        || plans.find(p => p._id === currentMembership?.planId || p.id === currentMembership?.planId);

    const handleCancel = async () => {
        if (!confirm('Are you sure you want to cancel? You will lose access at the end of your billing period.')) return;
        setCancelling(true);
        try {
            await cancelSubscription();
        } finally {
            setCancelling(false);
        }
    };

    if (isLoading && !currentMembership) {
        return (
            <div className="flex flex-col items-center justify-center p-16 min-h-[400px]">
                <Loader2 className="h-10 w-10 animate-spin text-[#DC2626] mb-4" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading membership</p>
            </div>
        );
    }

    const daysLeft = currentMembership?.endDate
        ? differenceInDays(new Date(currentMembership.endDate), new Date())
        : null;

    const totalDays = currentPlan?.duration
        ? (currentPlan.durationType === 'months' ? currentPlan.duration * 30 : currentPlan.duration)
        : 30;

    const progressPercent = daysLeft !== null
        ? Math.max(0, Math.min(100, Math.round((daysLeft / totalDays) * 100)))
        : 0;

    const cfg = currentMembership ? statusConfig[currentMembership.status] || statusConfig.expired : null;

    return (
        <div className="space-y-8 pb-12 max-w-3xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
                <div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase text-slate-900">
                        My <span className="text-[#DC2626]">Membership</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1 text-sm">
                        View and manage your gym subscription.
                    </p>
                </div>

                <Button
                    onClick={() => navigate('/dashboard/membership/plans')}
                    className="bg-slate-900 hover:bg-black text-white font-bold rounded-xl px-6"
                >
                    <ArrowUpRight className="h-4 w-4 mr-2" />
                    {currentMembership?.status === 'active' ? 'Change Plan' : 'Get a Plan'}
                </Button>
            </motion.div>

            {/* Error */}
            {error && (
                <Alert variant="destructive" className="rounded-2xl border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* No membership */}
            {!currentMembership && !isLoading && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center"
                >
                    <Crown className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                    <h2 className="text-2xl font-black text-slate-700 mb-2">No Active Membership</h2>
                    <p className="text-slate-500 mb-6 font-medium">
                        Choose a plan to unlock full gym access, classes, and more.
                    </p>
                    <Button
                        className="bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold rounded-xl px-8 py-5"
                        onClick={() => navigate('/dashboard/membership/plans')}
                    >
                        <Zap className="h-5 w-5 mr-2" />
                        View Plans
                    </Button>
                </motion.div>
            )}

            {/* Current Membership Card */}
            {currentMembership && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="rounded-3xl border-2 border-slate-200 overflow-hidden shadow-sm">
                        <div className="bg-slate-900 p-6 text-white relative overflow-hidden">
                            <div className="absolute right-0 top-0 w-40 h-40 bg-[#DC2626]/20 rounded-full -translate-y-16 translate-x-16" />
                            <div className="relative z-10">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <ShieldCheck className="h-5 w-5 text-[#DC2626]" />
                                            <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                                                Current Plan
                                            </span>
                                        </div>
                                        <h2 className="text-3xl font-black tracking-tight">
                                            {currentPlan?.name || currentMembership.planName || 'Membership'}
                                        </h2>
                                        {currentPlan?.description && (
                                            <p className="text-slate-400 text-sm mt-1">{currentPlan.description}</p>
                                        )}
                                    </div>
                                    <Badge className={`${cfg?.color} border font-bold text-xs px-3 py-1 rounded-full`}>
                                        {cfg?.label}
                                    </Badge>
                                </div>

                                {currentPlan?.price && (
                                    <div className="mt-4">
                                        <span className="text-3xl font-black text-white">
                                            LKR {currentPlan.price.toLocaleString()}
                                        </span>
                                        <span className="text-slate-400 text-sm ml-1">
                                            / {currentPlan.duration} {currentPlan.durationType}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <CardContent className="p-6 space-y-5">
                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 rounded-2xl p-4">
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                                        <Calendar className="h-3 w-3" /> Start Date
                                    </p>
                                    <p className="font-bold text-slate-900">
                                        {currentMembership.startDate
                                            ? format(new Date(currentMembership.startDate), 'dd MMM yyyy')
                                            : '—'}
                                    </p>
                                </div>
                                <div className="bg-slate-50 rounded-2xl p-4">
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                                        <Clock className="h-3 w-3" /> Expires
                                    </p>
                                    <p className={`font-bold ${daysLeft !== null && daysLeft < 7 ? 'text-[#DC2626]' : 'text-slate-900'}`}>
                                        {currentMembership.endDate
                                            ? format(new Date(currentMembership.endDate), 'dd MMM yyyy')
                                            : '—'}
                                    </p>
                                </div>
                            </div>

                            {/* Progress bar */}
                            {daysLeft !== null && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold">
                                        <span className="text-slate-400 uppercase tracking-wider">Time Remaining</span>
                                        <span className={daysLeft < 7 ? 'text-[#DC2626]' : 'text-slate-700'}>
                                            {daysLeft < 0 ? 'Expired' : `${daysLeft} days left`}
                                        </span>
                                    </div>
                                    <Progress
                                        value={progressPercent}
                                        className="h-2 bg-slate-100"
                                    />
                                </div>
                            )}

                            {/* Renewal warning */}
                            {daysLeft !== null && daysLeft >= 0 && daysLeft <= 7 && currentMembership.status === 'active' && (
                                <Alert className="bg-amber-50 border border-amber-200 rounded-2xl">
                                    <AlertCircle className="h-4 w-4 text-amber-500" />
                                    <AlertDescription className="text-amber-700 font-medium text-sm">
                                        Your membership expires {daysLeft === 0 ? 'today' : `in ${daysLeft} days`}. Renew early to keep access.
                                    </AlertDescription>
                                </Alert>
                            )}

                            <Separator />

                            {/* Features */}
                            {(currentPlan?.features || []).length > 0 && (
                                <div>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-3">Included Features</p>
                                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {(currentPlan!.features || []).map((f, i) => (
                                            <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                                                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Actions */}
                            {currentMembership.status === 'active' && (
                                <div className="flex gap-3 pt-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsFreezeOpen(true)}
                                        className="flex-1 border-slate-200 rounded-xl font-bold text-slate-600"
                                    >
                                        <Pause className="h-4 w-4 mr-2" />
                                        Freeze
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleCancel}
                                        disabled={cancelling}
                                        className="flex-1 border-red-200 text-[#DC2626] hover:bg-red-50 rounded-xl font-bold"
                                    >
                                        {cancelling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <X className="h-4 w-4 mr-2" />}
                                        Cancel
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => navigate('/dashboard/membership/plans')}
                                        className="flex-1 bg-slate-900 hover:bg-black text-white rounded-xl font-bold"
                                    >
                                        <RotateCcw className="h-4 w-4 mr-2" />
                                        Renew
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Usage Stats */}
            {usageStats && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                    <Card className="rounded-3xl border border-slate-200 shadow-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-black uppercase tracking-tight text-slate-900">
                                This Month
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {[
                                { label: 'Check-ins', value: usageStats.checkInsThisMonth, icon: CheckCircle2 },
                                { label: 'Classes', value: usageStats.classesAttendedThisMonth, icon: Star },
                                { label: 'Workouts', value: usageStats.totalWorkouts, icon: Zap },
                                { label: 'Streak', value: `${usageStats.streakDays}d`, icon: Crown },
                            ].map(({ label, value, icon: Icon }) => (
                                <div key={label} className="bg-slate-50 rounded-2xl p-4 text-center">
                                    <Icon className="h-5 w-5 mx-auto text-[#DC2626] mb-2" />
                                    <p className="text-2xl font-black text-slate-900">{value}</p>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">{label}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            <FreezeDialog
                isOpen={isFreezeOpen}
                onClose={() => setIsFreezeOpen(false)}
                onConfirm={freezeSubscription}
            />
        </div>
    );
}
