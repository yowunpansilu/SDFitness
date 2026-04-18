import { motion } from 'framer-motion';
import { Dumbbell, Flame, Calendar, Zap, Plus } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { UpcomingClasses } from '@/components/dashboard/UpcomingClasses';
import { ActivityTimeline } from '@/components/dashboard/ActivityTimeline';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/lib/stores/authStore';

export function Dashboard() {
    const { user } = useAuthStore();

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Premium Welcome Section */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative min-h-[160px] md:h-[220px] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden group shadow-xl shadow-primary-900/5 bg-white border border-primary-50"
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
                <div className="relative h-full flex flex-col justify-center px-6 md:px-12 z-10 py-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h1 className="text-3xl md:text-5xl font-headline font-black text-primary-900 leading-tight tracking-tight">
                            Welcome Back, <span className="text-secondary-500">{user?.firstName}!</span> 💪
                        </h1>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mt-3">
                            <p className="text-primary-600 text-lg md:text-xl font-medium">
                                Ready to crush your fitness goals today?
                            </p>
                            <div className="hidden sm:block h-1 w-12 bg-secondary-500 rounded-full" />
                            <div className="w-fit px-3 py-1 rounded-full bg-primary-50 border border-primary-100 text-[10px] md:text-xs font-bold text-primary-600 uppercase tracking-widest">
                                Member Profile Active
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
            <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Workouts"
                    value="24"
                    icon={Dumbbell}
                    trend="up"
                    trendValue="+12%"
                />
                <StatsCard
                    title="Calories Burned"
                    value="12,450"
                    icon={Flame}
                    trend="up"
                    trendValue="+8%"
                />
                <StatsCard
                    title="Classes Attended"
                    value="18"
                    icon={Calendar}
                    trend="up"
                    trendValue="+15%"
                />
                <StatsCard
                    title="Attendance Streak"
                    value="7 days"
                    icon={Zap}
                    trend="up"
                    trendValue="+2"
                />
            </div>

            {/* Quick Actions */}
            <Card className="glass-card border-border">
                <CardContent className="p-4 md:p-6">
                    <h2 className="text-lg md:text-xl font-bold text-foreground mb-4">Quick Actions</h2>
                    <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
                        <Button variant="gym" className="h-auto py-3 md:py-4 flex-col gap-2 text-xs md:text-sm">
                            <Calendar className="w-5 h-5 md:w-6 md:h-6" />
                            <span>Book a Class</span>
                        </Button>
                        <Button variant="outline" className="h-auto py-3 md:py-4 flex-col gap-2 text-xs md:text-sm">
                            <Dumbbell className="w-5 h-5 md:w-6 md:h-6" />
                            <span>Log Workout</span>
                        </Button>
                        <Button variant="outline" className="h-auto py-3 md:py-4 flex-col gap-2 text-xs md:text-sm">
                            <Plus className="w-5 h-5 md:w-6 md:h-6" />
                            <span>View Diet Plan</span>
                        </Button>
                        <Button variant="outline" className="h-auto py-3 md:py-4 flex-col gap-2 text-xs md:text-sm">
                            <Zap className="w-5 h-5 md:w-6 md:h-6" />
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
