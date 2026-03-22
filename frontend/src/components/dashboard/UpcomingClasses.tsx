import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Calendar, Clock, X, Loader2 } from 'lucide-react';
import { Badge } from '../ui/badge';
import api from '@/lib/api/axios';

interface ClassItem {
    id: string;
    name: string;
    type: string;
    trainer: {
        name: string;
        avatar?: string;
    };
    day: string;
    time: string;
    duration: string;
}

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function UpcomingClasses() {
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const res = await api.get('/classes');
            const allClasses = Array.isArray(res.data) ? res.data : [];

            const todayIdx = new Date().getDay();
            const todayName = dayNames[todayIdx];

            const mapped: ClassItem[] = allClasses
                .filter((c: any) => c.schedule)
                .map((c: any) => {
                    const sched = c.schedule;
                    const startHour = sched.startTime?.split(':')[0] || '00';
                    const startMin = sched.startTime?.split(':')[1] || '00';
                    const endHour = sched.endTime?.split(':')[0] || '00';
                    const endMin = sched.endTime?.split(':')[1] || '00';
                    const durationMins = (parseInt(endHour) * 60 + parseInt(endMin)) - (parseInt(startHour) * 60 + parseInt(startMin));

                    const trainerUser = c.trainer?.user;
                    const trainerName = trainerUser ? `${trainerUser.firstName || ''} ${trainerUser.lastName || ''}`.trim() : 'TBD';

                    let displayDay = sched.dayOfWeek || 'TBD';
                    if (displayDay === todayName) displayDay = 'Today';
                    else {
                        const targetIdx = dayNames.indexOf(displayDay);
                        if (targetIdx > -1) {
                            const daysUntil = (targetIdx - todayIdx + 7) % 7;
                            if (daysUntil === 1) displayDay = 'Tomorrow';
                        }
                    }

                    return {
                        id: c._id,
                        name: c.name,
                        type: c.trainer?.specialization?.[0] || 'Fitness',
                        trainer: { name: trainerName },
                        day: displayDay,
                        time: `${startHour}:${startMin}`,
                        duration: `${durationMins} min`,
                    };
                })
                .slice(0, 3);

            setClasses(mapped);
        } catch {
            setClasses([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Card className="glass-card border-dark-700">
                <CardHeader>
                    <CardTitle className="text-white">Upcoming Classes</CardTitle>
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
                <CardTitle className="text-white">Upcoming Classes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {classes.length === 0 ? (
                    <div className="text-center py-8">
                        <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400">No upcoming classes</p>
                        <Button variant="gym" className="mt-4">
                            Book a Class
                        </Button>
                    </div>
                ) : (
                    classes.map((classItem) => (
                        <div
                            key={classItem.id}
                            className="flex items-center gap-4 p-4 rounded-lg bg-dark-800 border border-dark-700 hover:border-primary-500/50 transition-all"
                        >
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={classItem.trainer.avatar} />
                                <AvatarFallback>
                                    {classItem.trainer.name
                                        .split(' ')
                                        .map((n) => n[0])
                                        .join('')}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-white">{classItem.name}</h4>
                                    <Badge variant="secondary" className="text-xs">
                                        {classItem.type}
                                    </Badge>
                                </div>
                                <p className="text-sm text-gray-400">{classItem.trainer.name}</p>
                                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {classItem.day}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {classItem.time} ({classItem.duration})
                                    </span>
                                </div>
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-gray-400 hover:text-red-500"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}
