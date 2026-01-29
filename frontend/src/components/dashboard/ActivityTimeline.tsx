import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dumbbell, Calendar, Apple, DollarSign, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Activity {
    id: string;
    type: 'workout' | 'class' | 'diet' | 'payment' | 'checkin';
    title: string;
    description: string;
    timestamp: string;
}

const mockActivities: Activity[] = [
    {
        id: '1',
        type: 'workout',
        title: 'Completed Workout',
        description: 'Upper Body Strength Training',
        timestamp: '2 hours ago',
    },
    {
        id: '2',
        type: 'class',
        title: 'Attended Class',
        description: 'HIIT Training with John Smith',
        timestamp: '1 day ago',
    },
    {
        id: '3',
        type: 'diet',
        title: 'Generated Diet Plan',
        description: 'High Protein Muscle Gain Plan',
        timestamp: '2 days ago',
    },
    {
        id: '4',
        type: 'payment',
        title: 'Payment Successful',
        description: 'Monthly Membership - $99.00',
        timestamp: '3 days ago',
    },
    {
        id: '5',
        type: 'checkin',
        title: 'Gym Check-in',
        description: 'Morning session',
        timestamp: '3 days ago',
    },
];

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
    return (
        <Card className="glass-card border-dark-700">
            <CardHeader>
                <CardTitle className="text-white">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {mockActivities.map((activity, index) => {
                        const Icon = activityIcons[activity.type];
                        const isLast = index === mockActivities.length - 1;

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
            </CardContent>
        </Card>
    );
}
