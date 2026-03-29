import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Calendar, Zap, Plus, Target, Activity } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { UpcomingClasses } from '@/components/dashboard/UpcomingClasses';
import { ActivityTimeline } from '@/components/dashboard/ActivityTimeline';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/lib/stores/authStore';

export function Dashboard() {
    const { user, member, fetchProfile } = useAuthStore();

    useEffect(() => {
        if (fetchProfile) fetchProfile();
    }, [fetchProfile]);

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
                                Ready to crush your fitness goals today?
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
                    value={member?.bmi?.toFixed(1) || '--'}
                    icon={Activity}
                    trend={member?.bmi && member.bmi < 25 ? "down" : "up"}
                    trendValue={member?.bmi ? (member.bmi < 25 ? "Healthy" : "Attention") : ""}
                />
                <StatsCard
                    title="Current Weight"
                    value={`${member?.currentWeight?.value || '--'} ${member?.currentWeight?.unit || 'kg'}`}
                    icon={ScaleIcon as any}
                />
                <StatsCard
                    title="Target Weight"
                    value={`${member?.targetWeight?.value || '--'} ${member?.targetWeight?.unit || 'kg'}`}
                    icon={Target}
                />
                <StatsCard
                    title="Status"
                    value={member?.status?.toUpperCase() || 'ACTIVE'}
                    icon={Zap}
                />
            </div>

            {/* Quick Actions */}
            <Card className="glass-card border-border">
                <CardContent className="p-6">
                    <h2 className="text-xl font-bold text-foreground mb-4">Quick Actions</h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Button variant="gym" className="h-auto py-4 flex-col gap-2">
                            <Calendar className="w-6 h-6" />
                            <span>Book a Class</span>
                        </Button>
                        <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                            <Dumbbell className="w-6 h-6" />
                            <span>Log Workout</span>
                        </Button>
                        <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                            <Plus className="w-6 h-6" />
                            <span>View Diet Plan</span>
                        </Button>
                        <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                            <Zap className="w-6 h-6" />
                            <span>Check-in</span>
                        </Button>
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
