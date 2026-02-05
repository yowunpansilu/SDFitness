import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Clock, Users, MapPin, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface ClassSession {
    id: string;
    name: string;
    trainer: {
        id: string;
        name: string;
        photoUrl?: string;
    };
    time: string;
    duration: number;
    capacity: number;
    enrolled: number;
    location: string;
    type: 'yoga' | 'hiit' | 'spin' | 'strength' | 'cardio' | 'pilates';
    day: number; // 0-6 (Sunday-Saturday)
}

// Mock data
const mockClasses: ClassSession[] = [
    {
        id: '1',
        name: 'Morning Yoga Flow',
        trainer: { id: '3', name: 'Emma Wilson', photoUrl: undefined },
        time: '06:00 AM',
        duration: 60,
        capacity: 20,
        enrolled: 18,
        location: 'Studio A',
        type: 'yoga',
        day: 1,
    },
    {
        id: '2',
        name: 'HIIT Bootcamp',
        trainer: { id: '2', name: 'Mike Ross', photoUrl: undefined },
        time: '07:00 AM',
        duration: 45,
        capacity: 25,
        enrolled: 25,
        location: 'Gym Floor',
        type: 'hiit',
        day: 1,
    },
    {
        id: '3',
        name: 'Spin Class',
        trainer: { id: '2', name: 'Mike Ross', photoUrl: undefined },
        time: '06:00 PM',
        duration: 45,
        capacity: 30,
        enrolled: 22,
        location: 'Spin Room',
        type: 'spin',
        day: 1,
    },
    {
        id: '4',
        name: 'Power Strength',
        trainer: { id: '1', name: 'Sarah Johnson', photoUrl: undefined },
        time: '06:00 AM',
        duration: 60,
        capacity: 15,
        enrolled: 12,
        location: 'Weight Room',
        type: 'strength',
        day: 2,
    },
    {
        id: '5',
        name: 'Evening Yoga',
        trainer: { id: '3', name: 'Emma Wilson', photoUrl: undefined },
        time: '07:00 PM',
        duration: 60,
        capacity: 20,
        enrolled: 16,
        location: 'Studio A',
        type: 'yoga',
        day: 2,
    },
    {
        id: '6',
        name: 'CrossFit WOD',
        trainer: { id: '4', name: 'David Chen', photoUrl: undefined },
        time: '06:00 AM',
        duration: 60,
        capacity: 20,
        enrolled: 19,
        location: 'CrossFit Box',
        type: 'strength',
        day: 3,
    },
    {
        id: '7',
        name: 'Cardio Blast',
        trainer: { id: '2', name: 'Mike Ross', photoUrl: undefined },
        time: '06:00 PM',
        duration: 30,
        capacity: 25,
        enrolled: 20,
        location: 'Gym Floor',
        type: 'cardio',
        day: 3,
    },
];

const classTypeColors = {
    yoga: 'from-purple-500 to-pink-600',
    hiit: 'from-orange-500 to-red-600',
    spin: 'from-blue-500 to-cyan-600',
    strength: 'from-amber-500 to-orange-600',
    cardio: 'from-green-500 to-emerald-600',
    pilates: 'from-indigo-500 to-purple-600',
};

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function ClassSchedule() {
    const navigate = useNavigate();
    const [currentWeek, setCurrentWeek] = useState(0);

    const getClassesForDay = (day: number) => {
        return mockClasses.filter(c => c.day === day).sort((a, b) => a.time.localeCompare(b.time));
    };

    const today = new Date().getDay();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Class Schedule
                    </h1>
                    <p className="text-gray-400 mt-2">
                        Manage group fitness classes and schedules
                    </p>
                </div>
                <Button
                    onClick={() => navigate('/classes/add')}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg shadow-purple-500/20"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Class
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Total Classes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">{mockClasses.length}</div>
                    </CardContent>
                </Card>
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">This Week</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">42</div>
                    </CardContent>
                </Card>
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Total Enrolled</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">
                            {mockClasses.reduce((sum, c) => sum + c.enrolled, 0)}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Avg Attendance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">87%</div>
                    </CardContent>
                </Card>
            </div>

            {/* Week Navigation */}
            <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setCurrentWeek(currentWeek - 1)}
                            className="text-gray-400 hover:text-white hover:bg-dark-800"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <div className="flex items-center gap-2 text-white font-semibold">
                            <CalendarIcon className="h-5 w-5 text-purple-400" />
                            <span>Current Week</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setCurrentWeek(currentWeek + 1)}
                            className="text-gray-400 hover:text-white hover:bg-dark-800"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Weekly Schedule Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
                {daysOfWeek.map((day, index) => {
                    const dayClasses = getClassesForDay(index);
                    const isToday = index === today;

                    return (
                        <div key={day} className="space-y-3">
                            {/* Day Header */}
                            <div className={cn(
                                "text-center p-3 rounded-lg",
                                isToday
                                    ? "bg-gradient-to-r from-purple-500 to-pink-600"
                                    : "bg-dark-900/50 border border-dark-800"
                            )}>
                                <p className={cn(
                                    "font-semibold",
                                    isToday ? "text-white" : "text-gray-400"
                                )}>
                                    {day}
                                </p>
                                {isToday && (
                                    <p className="text-xs text-white/80 mt-1">Today</p>
                                )}
                            </div>

                            {/* Classes for this day */}
                            <div className="space-y-3">
                                {dayClasses.length > 0 ? (
                                    dayClasses.map((classSession) => {
                                        const isFull = classSession.enrolled >= classSession.capacity;

                                        return (
                                            <Card
                                                key={classSession.id}
                                                onClick={() => navigate(`/classes/${classSession.id}`)}
                                                className="bg-dark-900/50 border-dark-800 backdrop-blur-sm hover:bg-dark-900/70 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-0.5 cursor-pointer group"
                                            >
                                                <CardContent className="p-4 space-y-3">
                                                    {/* Class Name & Type */}
                                                    <div>
                                                        <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors text-sm mb-1">
                                                            {classSession.name}
                                                        </h3>
                                                        <Badge className={cn(
                                                            "text-xs bg-gradient-to-r text-white",
                                                            classTypeColors[classSession.type]
                                                        )}>
                                                            {classSession.type}
                                                        </Badge>
                                                    </div>

                                                    {/* Time & Duration */}
                                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                                        <Clock className="h-3 w-3" />
                                                        <span>{classSession.time} ({classSession.duration}min)</span>
                                                    </div>

                                                    {/* Trainer */}
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-6 w-6">
                                                            <AvatarImage src={classSession.trainer.photoUrl} />
                                                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                                                                {classSession.trainer.name.split(' ').map(n => n[0]).join('')}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-xs text-gray-400">{classSession.trainer.name}</span>
                                                    </div>

                                                    {/* Location */}
                                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                                        <MapPin className="h-3 w-3" />
                                                        <span>{classSession.location}</span>
                                                    </div>

                                                    {/* Enrollment */}
                                                    <div className="pt-2 border-t border-dark-700">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <div className="flex items-center gap-1 text-xs text-gray-400">
                                                                <Users className="h-3 w-3" />
                                                                <span>{classSession.enrolled}/{classSession.capacity}</span>
                                                            </div>
                                                            {isFull && (
                                                                <Badge className="text-xs bg-red-500/20 text-red-400 border-red-500/30">
                                                                    Full
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="w-full bg-dark-800 rounded-full h-1.5">
                                                            <div
                                                                className={cn(
                                                                    "h-1.5 rounded-full transition-all",
                                                                    isFull
                                                                        ? "bg-gradient-to-r from-red-500 to-orange-600"
                                                                        : "bg-gradient-to-r from-purple-500 to-pink-600"
                                                                )}
                                                                style={{ width: `${(classSession.enrolled / classSession.capacity) * 100}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })
                                ) : (
                                    <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm border-dashed">
                                        <CardContent className="p-8 text-center">
                                            <p className="text-gray-500 text-sm">No classes scheduled</p>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
