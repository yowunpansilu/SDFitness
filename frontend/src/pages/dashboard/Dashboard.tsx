import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dumbbell, Calendar, Zap, Plus, Target, Activity, Loader2 } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { UpcomingClasses } from '@/components/dashboard/UpcomingClasses';
import { ActivityTimeline } from '@/components/dashboard/ActivityTimeline';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/lib/stores/authStore';
import { getWeightHistory, getActiveGoal } from '@/lib/api/weightService';

export function Dashboard() {
    const { user, member, fetchProfile } = useAuthStore();
    const [weightHistory, setWeightHistory] = useState<any[]>([]);
    const [activeGoal, setActiveGoal] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDynamicData = async () => {
            try {
                const [historyRes, goalRes] = await Promise.all([
                    getWeightHistory(),
                    getActiveGoal()
                ]);
                setWeightHistory(historyRes.data || []);
                setActiveGoal(goalRes.data);
            } catch (err) {
                console.error('Error fetching dynamic data:', err);
            } finally {
                setLoading(false);
            }
        };

        if (fetchProfile) fetchProfile();
        loadDynamicData();
    }, [fetchProfile]);

    // Use latest weight log for BMI calculation
    const latestWeight = weightHistory[0]?.weightKg || member?.currentWeight?.value || 0;
    const previousWeight = weightHistory[1]?.weightKg || 0;
    const currentHeight = member?.height?.value || 0;
    const heightUnit = member?.height?.unit || 'cm';

    let computedBmi = 0;
    if (latestWeight > 0 && currentHeight > 0) {
        let heightM = currentHeight;
        if (heightUnit === 'cm') heightM = heightM / 100;
        else if (heightUnit === 'in') heightM = heightM * 0.0254;

        computedBmi = latestWeight / (heightM * heightM);
    }

    const displayBmi = computedBmi > 0 ? computedBmi.toFixed(1) : 'Not set';
    const displayTarget = activeGoal ? `${activeGoal.targetWeight} kg` : (member?.targetWeight?.value ? `${member.targetWeight.value} ${member.targetWeight.unit || 'kg'}` : 'Not set');
    const displayCurrentWeight = weightHistory[0] ? `${weightHistory[0].weight} ${weightHistory[0].unit}` : (member?.currentWeight?.value ? `${member.currentWeight.value} ${member.currentWeight.unit || 'kg'}` : 'Not set');
    const displayStatus = activeGoal ? (activeGoal.type === 'lose' ? 'Cutting' : 'Bulking') : (member?.status?.toUpperCase() || 'Not Active');

    // Calculate Trend
    let weightTrend: 'up' | 'down' | undefined;
    let weightTrendValue: string | undefined;
    if (previousWeight > 0 && latestWeight > 0) {
        const diff = latestWeight - previousWeight;
        weightTrend = diff >= 0 ? 'up' : 'down';
        weightTrendValue = `${Math.abs(diff).toFixed(1)} kg`;
    }

    const bmiStatus = computedBmi < 18.5 ? "Underweight" : computedBmi < 25 ? "Healthy" : "Attention";
    const bmiTrend = weightTrend; // Use same trend as weight

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="w-12 h-12 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Premium Welcome Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative h-[220px] rounded-[2rem] overflow-hidden group shadow-xl shadow-primary-900/5 bg-white border border-primary-50"
            >
                {/* Background Image with Light Overlay */}
                <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105 opacity-20">
                    <img
                        src="/assets/images/welcome-bg.png"
                        alt="Gym Background"
                        className="w-full h-full object-cover grayscale brightness-150"
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent" />

                {/* Content Overlay */}
                <div className="relative h-full flex flex-col justify-center px-12 z-10">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h1 className="text-5xl font-headline font-black text-primary-900 leading-tight tracking-tight">
                            Welcome Back, <span className="text-secondary-500">{user?.firstName}!</span> 💪
                        </h1>
                        <div className="flex items-center gap-4 mt-3">
                            <p className="text-primary-600 text-xl font-medium">
                                Ready to crush your {member?.fitnessGoals?.[0]?.toLowerCase() || 'fitness goals'} today?
                            </p>
                            <div className="h-1 w-12 bg-secondary-500 rounded-full" />
                            <div className="px-3 py-1 rounded-full bg-primary-50 border border-primary-100 text-xs font-bold text-primary-600 uppercase tracking-widest">
                                {member?.membershipType ? `${member.membershipType.toUpperCase()} PROFILE ACTIVE` : 'MEMBER PROFILE ACTIVE'}
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute bottom-0 right-0 p-8 flex gap-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Dumbbell className="w-24 h-24 text-primary-900 rotate-12" />
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Current BMI"
                    value={displayBmi}
                    icon={Activity}
                    trend={bmiTrend}
                    trendValue={bmiStatus}
                    trendColor={bmiTrend === 'up' ? 'red' : 'green'}
                />
                <StatsCard
                    title="Current Weight"
                    value={displayCurrentWeight}
                    icon={ScaleIcon as any}
                    trend={weightTrend}
                    trendValue={weightTrendValue}
                    trendColor={weightTrend === 'up' ? 'red' : 'green'}
                />
                <StatsCard
                    title="Target Weight"
                    value={displayTarget}
                    icon={Target}
                />
                <StatsCard
                    title="Status"
                    value={displayStatus}
                    icon={Zap}
                />
            </div>

            {/* Quick Actions */}
            <Card className="glass-card border-border">
                <CardContent className="p-6">
                    <h2 className="text-xl font-bold text-foreground mb-4">Quick Actions</h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Link to="/classes" className="w-full">
                            <Button variant="gym" className="h-auto w-full py-4 flex-col gap-2">
                                <Calendar className="w-6 h-6" />
                                <span>Book a Class</span>
                            </Button>
                        </Link>
                        <Link to="/workouts" className="w-full">
                            <Button variant="outline" className="h-auto w-full py-4 flex-col gap-2">
                                <Dumbbell className="w-6 h-6" />
                                <span>Log Workout</span>
                            </Button>
                        </Link>
                        <Link to="/diet-plans" className="w-full">
                            <Button variant="outline" className="h-auto w-full py-4 flex-col gap-2">
                                <Plus className="w-6 h-6" />
                                <span>View Diet Plan</span>
                            </Button>
                        </Link>
                        <div className="w-full">
                            <Button variant="outline" className="h-auto w-full py-4 flex-col gap-2">
                                <Zap className="w-6 h-6" />
                                <span>Check-in</span>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Upcoming Classes and Activity */}
            <div className="grid gap-6 lg:grid-cols-2">
                <UpcomingClasses />
                <ActivityTimeline />
            </div>
        </div>
    );
}

// Internal helper icons if not available in lucide-react constants above
function ScaleIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
            <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
            <path d="M7 21h10" />
            <path d="M12 3v18" />
            <path d="M3 7h18" />
        </svg>
    );
}
