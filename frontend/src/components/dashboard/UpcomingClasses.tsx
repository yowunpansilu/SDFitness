import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Calendar, Clock, X } from 'lucide-react';
import { Badge } from '../ui/badge';

interface ClassItem {
    id: string;
    name: string;
    type: string;
    trainer: {
        name: string;
        avatar?: string;
    };
    date: string;
    time: string;
    duration: string;
}

const mockClasses: ClassItem[] = [
    {
        id: '1',
        name: 'HIIT Training',
        type: 'High Intensity',
        trainer: { name: 'John Smith', avatar: '' },
        date: 'Today',
        time: '6:00 PM',
        duration: '45 min',
    },
    {
        id: '2',
        name: 'Yoga Flow',
        type: 'Flexibility',
        trainer: { name: 'Sarah Johnson', avatar: '' },
        date: 'Tomorrow',
        time: '8:00 AM',
        duration: '60 min',
    },
    {
        id: '3',
        name: 'Spin Class',
        type: 'Cardio',
        trainer: { name: 'Mike Davis', avatar: '' },
        date: 'Friday',
        time: '7:00 PM',
        duration: '50 min',
    },
];

export function UpcomingClasses() {
    return (
        <Card className="glass-card border-dark-700">
            <CardHeader>
                <CardTitle className="text-white">Upcoming Classes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {mockClasses.length === 0 ? (
                    <div className="text-center py-8">
                        <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400">No upcoming classes</p>
                        <Button variant="gym" className="mt-4">
                            Book a Class
                        </Button>
                    </div>
                ) : (
                    mockClasses.map((classItem) => (
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
                                        {classItem.date}
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
