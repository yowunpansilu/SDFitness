import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dumbbell, Calendar, Apple, DollarSign, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAttendanceHistory } from '@/lib/api/attendanceService';
import { getWorkoutHistory } from '@/lib/api/workoutApi';
import { fetchDietPlans } from '@/lib/api/dietPlanApi';
import { getUserBookings } from '@/lib/api/classService';
import { useAuthStore } from '@/lib/stores/authStore';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
    id: string;
    type: 'workout' | 'class' | 'diet' | 'payment' | 'checkin';
    title: string;
    description: string;
    timestamp: string;
}

const activityIcons = {
    workout: Dumbbell,
    class: Calendar,
    diet: Apple,
    payment: DollarSign,
    checkin: CheckCircle,
};

const activityColors = {
    workout: 'text-primary-500 bg-primary-500/10',
    class: 'text-secondary-500 bg-secondary-500/10',
    diet: 'text-green-500 bg-green-500/10',
    payment: 'text-yellow-500 bg-yellow-500/10',
    checkin: 'text-blue-500 bg-blue-500/10',
};

export function ActivityTimeline() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const user = useAuthStore((state) => state.user);

    useEffect(() => {
        const fetchActivities = async () => {
            if (!user?.id) return;
            try {
                setLoading(true);
                const [attendance, workoutsResp, dietPlans, bookings] = await Promise.all([
                    getAttendanceHistory(user.id).catch(() => []),
                    getWorkoutHistory(user.id).catch(() => ({ data: [] })),
                    fetchDietPlans(user.id).catch(() => []),
                    getUserBookings(user.id).catch(() => [])
                ]);

                const mappedActivities: Activity[] = [];

                // 1. Attendance
                attendance.forEach((rec: any, idx: number) => {
                    mappedActivities.push({
                        id: `checkin-${rec._id || rec.id || idx}`,
                        type: 'checkin',
                        title: 'Gym Check-in',
                        description: `At ${rec.facility}`,
                        timestamp: rec.checkInTime
                    });
                });

                // 2. Workouts
                workoutsResp.data?.forEach((rec: any, idx: number) => {
                    mappedActivities.push({
                        id: `workout-${rec._id || rec.id || idx}`,
                        type: 'workout',
                        title: 'Completed Workout',
                        description: `Burned ${rec.totalCaloriesBurned || 0} kcal`,
                        timestamp: rec.workoutDate || rec.createdAt
                    });
                });

                // 3. Diet Plans
                dietPlans.forEach((rec: any, idx: number) => {
                    mappedActivities.push({
                        id: `diet-${rec._id || rec.id || idx}`,
                        type: 'diet',
                        title: 'Generated Diet Plan',
                        description: rec.name || 'AI Personalized Plan',
                        timestamp: rec.createdAt
                    });
                });

                // 4. Bookings
                bookings.forEach((rec: any, idx: number) => {
                    mappedActivities.push({
                        id: `booking-${rec._id || rec.id || idx}-${idx}`,
                        type: 'class',
                        title: `Class Booking: ${rec.gymClass?.name || 'Session'}`,
                        description: `Status: ${rec.status}`,
                        timestamp: rec.bookingDate || rec.createdAt
                    });
                });

                // Sort by timestamp descending and take top 10
                const sortedActivities = mappedActivities
                    .filter(a => a.timestamp)
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .slice(0, 10)
                    .map(a => ({
                        ...a,
                        timestamp: formatDistanceToNow(new Date(a.timestamp), { addSuffix: true })
                    }));

                setActivities(sortedActivities);
            } catch (error) {
                console.error('Failed to fetch activities:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
    }, [user?.id]);

    return (
        <Card className="glass-card border-border">
            <CardHeader>
                <CardTitle className="text-foreground">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : activities.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        No recent activity found.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {activities.map((activity, index) => {
                            const Icon = activityIcons[activity.type];
                            const isLast = index === activities.length - 1;

                            return (
                                <div key={activity.id} className="relative flex gap-4">
                                    {/* Timeline line */}
                                    {!isLast && (
                                        <div className="absolute left-5 top-12 bottom-0 w-px bg-muted" />
                                    )}

                                    {/* Icon */}
                                    <div
                                        className={cn(
                                            'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                                            activityColors[activity.type]
                                        )}
                                    >
                                        <Icon className="h-5 w-5" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 pb-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-semibold text-foreground">
                                                {activity.title}
                                            </h4>
                                            <span className="text-xs text-muted-foreground">
                                                {activity.timestamp}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {activity.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
