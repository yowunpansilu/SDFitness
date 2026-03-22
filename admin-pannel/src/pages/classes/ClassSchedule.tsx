import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Clock, Users, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import api from '@/lib/api/axios';

interface GymClass {
    _id: string;
    name: string;
    trainer: {
        _id: string;
        user?: {
            firstName: string;
            lastName: string;
        };
    } | string;
    schedule: {
        dayOfWeek: string;
        startTime: string;
        endTime: string;
    };
    capacity: number;
    enrolled: number;
    description?: string;
}

const classTypeColors: Record<string, string> = {
    yoga: 'from-purple-500 to-pink-600',
    hiit: 'from-orange-500 to-red-600',
    spin: 'from-blue-500 to-cyan-600',
    strength: 'from-amber-500 to-orange-600',
    cardio: 'from-green-500 to-emerald-600',
    pilates: 'from-indigo-500 to-purple-600',
    crossfit: 'from-rose-500 to-red-600',
    boxing: 'from-red-500 to-pink-600',
    zumba: 'from-yellow-500 to-orange-600',
};

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function ClassSchedule() {
    const navigate = useNavigate();
    const [classes, setClasses] = useState<GymClass[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentWeek, setCurrentWeek] = useState(0);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const response = await api.get('/classes');
                setClasses(response.data);
            } catch (err) {
                console.error('Failed to fetch classes:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchClasses();
    }, []);

    const getTrainerName = (trainer: GymClass['trainer']): string => {
        if (typeof trainer === 'string') return 'Unknown';
        if (trainer?.user) return `${trainer.user.firstName} ${trainer.user.lastName}`;
        return 'Unknown';
    };

    const getTrainerInitials = (trainer: GymClass['trainer']): string => {
        if (typeof trainer === 'string') return '??';
        if (trainer?.user) return `${trainer.user.firstName[0]}${trainer.user.lastName[0]}`;
        return '??';
    };

    const getClassesForDay = (dayName: string) => {
        return classes.filter(c => c.schedule?.dayOfWeek === dayName).sort((a, b) =>
            (a.schedule?.startTime || '').localeCompare(b.schedule?.startTime || '')
        );
    };

    const today = new Date().getDay();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                <span className="ml-3 text-gray-400">Loading classes...</span>
            </div>
        );
    }

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
                        <div className="text-3xl font-bold text-white">{classes.length}</div>
                    </CardContent>
                </Card>
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">
                            {new Set(classes.map(c => c.name.split(' ')[0] || 'General')).size}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Total Capacity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">
                            {classes.reduce((sum, c) => sum + (c.capacity || 0), 0)}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Enrolled</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">
                            {classes.reduce((sum, c) => sum + (c.enrolled || 0), 0)}
                        </div>
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
                    const dayClasses = getClassesForDay(day);
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
                                        const isFull = (classSession.enrolled || 0) >= (classSession.capacity || 1);
                                        const category = (classSession.name || 'cardio').toLowerCase();
                                        const colorKey = Object.keys(classTypeColors).find(k => category.includes(k)) || 'cardio';

                                        return (
                                            <Card
                                                key={classSession._id}
                                                onClick={() => navigate(`/classes/${classSession._id}`)}
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
                                                            classTypeColors[colorKey]
                                                        )}>
                                                            {classSession.name.split(' ')[0] || 'Class'}
                                                        </Badge>
                                                    </div>

                                                    {/* Time */}
                                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                                        <Clock className="h-3 w-3" />
                                                        <span>{classSession.schedule?.startTime} - {classSession.schedule?.endTime}</span>
                                                    </div>

                                                    {/* Trainer */}
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-6 w-6">
                                                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                                                                {getTrainerInitials(classSession.trainer)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-xs text-gray-400">{getTrainerName(classSession.trainer)}</span>
                                                    </div>

                                                    {/* Enrollment */}
                                                    <div className="pt-2 border-t border-dark-700">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <div className="flex items-center gap-1 text-xs text-gray-400">
                                                                <Users className="h-3 w-3" />
                                                                <span>{classSession.enrolled || 0}/{classSession.capacity || 0}</span>
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
                                                                style={{ width: `${Math.min(((classSession.enrolled || 0) / (classSession.capacity || 1)) * 100, 100)}%` }}
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
