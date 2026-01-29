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
            {/* Welcome Section */}
            <div className="glass-card border-dark-700 p-8 rounded-lg bg-gradient-to-br from-primary-900/20 via-dark-900 to-secondary-900/20">
                <h1 className="text-4xl font-headline font-bold text-white mb-2">
                    Welcome Back, {user?.firstName}! 💪
                </h1>
                <p className="text-gray-400 text-lg">
                    Ready to crush your fitness goals today?
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
            <Card className="glass-card border-dark-700">
                <CardContent className="p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
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
