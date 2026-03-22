import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dumbbell, Calendar, Apple, DollarSign, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api/axios';

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

function formatTimeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

export function ActivityTimeline() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchActivities();
    }, []);

    const fetchActivities = async () => {
        try {
            const res = await api.get('/attendance');
            const records = (Array.isArray(res.data) ? res.data : [])
                .slice(0, 5)
                .map((rec: any, idx: number) => ({
                    id: rec._id || String(idx),
                    type: 'checkin' as const,
                    title: rec.checkOutTime ? 'Gym Session' : 'Currently at Gym',
                    description: rec.facility || 'Main Gym',
                    timestamp: formatTimeAgo(rec.checkInTime),
                }));
            setActivities(records);
        } catch {
            setActivities([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Card className="glass-card border-dark-700">
                <CardHeader>
                    <CardTitle className="text-white">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="glass-card border-dark-700">
            <CardHeader>
                <CardTitle className="text-white">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
                {activities.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No recent activity</p>
                ) : (
                    <div className="space-y-4">
                        {activities.map((activity, index) => {
                            const Icon = activityIcons[activity.type];
                            const isLast = index === activities.length - 1;

                            return (
                                <div key={activity.id} className="relative flex gap-4">
                                    {/* Timeline line */}
                                    {!isLast && (
                                        <div className="absolute left-5 top-12 bottom-0 w-px bg-dark-700" />
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
                                            <h4 className="text-sm font-semibold text-white">
                                                {activity.title}
                                            </h4>
                                            <span className="text-xs text-gray-500">
                                                {activity.timestamp}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-400 mt-1">
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
