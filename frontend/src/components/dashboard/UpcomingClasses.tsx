import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Calendar, Clock, X, Loader2 } from 'lucide-react';
import { Badge } from '../ui/badge';
import { getClasses } from '@/lib/api/classService';
import type { GymClass } from '@/lib/api/classService';
import { format } from 'date-fns';

export function UpcomingClasses() {
    const [classes, setClasses] = useState<GymClass[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                setLoading(true);
                const data = await getClasses();
                // Ensure data is an array
                if (Array.isArray(data)) {
                    setClasses(data.slice(0, 3));
                } else {
                    setClasses([]);
                }
            } catch (error) {
                console.error('Failed to fetch classes:', error);
                setClasses([]);
            } finally {
                setLoading(false);
            }
        };

        fetchClasses();
    }, []);

    const formatSafeDate = (dateString: string | undefined, formatStr: string) => {
        if (!dateString) return 'TBA';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                // Try parsing without assuming ISO
                const fallbackDate = new Date(dateString.replace(' ', 'T'));
                if (isNaN(fallbackDate.getTime())) return 'TBA';
                return format(fallbackDate, formatStr);
            }
            return format(date, formatStr);
        } catch (e) {
            return 'TBA';
        }
    };

    return (
        <Card className="glass-card border-border">
            <CardHeader>
                <CardTitle className="text-foreground">Upcoming Classes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : classes.length === 0 ? (
                    <div className="text-center py-8">
                        <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-muted-foreground">No upcoming classes</p>
                        <Button variant="gym" className="mt-4">
                            Book a Class
                        </Button>
                    </div>
                ) : (
                    classes.map((classItem) => (
                        <div
                            key={classItem.id}
                            className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border hover:border-primary-500/50 transition-all"
                        >
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={classItem.image} />
                                <AvatarFallback>
                                    {(classItem.trainerName || 'Trainer')
                                        .split(' ')
                                        .map((n) => n[0])
                                        .join('')}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-foreground">{classItem.name || 'Unnamed Class'}</h4>
                                    <Badge variant="secondary" className="text-xs">
                                        {classItem.type || 'General'}
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{classItem.trainerName || 'TBA'}</p>
                                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {formatSafeDate(classItem.startTime, 'EEEE')}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {formatSafeDate(classItem.startTime, 'p')} ({classItem.duration || 60} min)
                                    </span>
                                </div>
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-red-500"
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
