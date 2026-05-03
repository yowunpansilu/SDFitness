import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, TrendingUp, Calendar, Dumbbell, Apple, Trophy } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/authStore';
import { getWeeklyProgress, type DailyProgress } from '@/lib/api/progressApi';
import { useToast } from '@/hooks/use-toast';
import { format, startOfToday, subDays, isSameDay } from 'date-fns';

export default function WeeklySchedule() {
    const { user } = useAuthStore();
    const { toast } = useToast();
    const [weeklyData, setWeeklyData] = useState<DailyProgress[]>([]);

    useEffect(() => {
        if (user?.id) {
            fetchWeeklyData();
        }
    }, [user?.id]);

    const fetchWeeklyData = async () => {
        try {
            const data = await getWeeklyProgress(user!.id);
            setWeeklyData(data);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load weekly progress data.',
                variant: 'destructive',
            });
        }
    };

    const last7Days = Array.from({ length: 7 }, (_, i) => subDays(startOfToday(), 6 - i));

    const getStatus = (date: Date) => {
        const entry = weeklyData.find(d => isSameDay(new Date(d.date), date));
        return {
            workout: entry?.workoutCompleted || false,
            diet: entry?.dietLogged || false
        };
    };

    const stats = weeklyData.reduce((acc, curr) => ({
        workouts: acc.workouts + (curr.workoutCompleted ? 1 : 0),
        diets: acc.diets + (curr.dietLogged ? 1 : 0)
    }), { workouts: 0, diets: 0 });

    const totalPossible = 7;
    const workoutPercentage = (stats.workouts / totalPossible) * 100;
    const dietPercentage = (stats.diets / totalPossible) * 100;

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-10 mt-6 animate-in fade-in duration-500">
            <div className="border-b pb-6">
                <h1 className="text-3xl font-black bg-gradient-to-r from-primary-900 to-secondary-500 bg-clip-text text-transparent">
                    Weekly Consistency Tracker
                </h1>
                <p className="text-muted-foreground mt-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-secondary-500" />
                    Review your performance over the last 7 days.
                </p>
            </div>

            {/* Weekly Overview Grid */}
            <div className="grid gap-6">
                <Card className="border-none shadow-2xl shadow-primary-900/5 bg-white/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary-500" />
                            7-Day Consistency Map
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
                            {last7Days.map((date, idx) => {
                                const status = getStatus(date);
                                const isToday = isSameDay(date, startOfToday());

                                return (
                                    <div key={idx} className={`p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all ${isToday ? 'border-secondary-500 bg-secondary-50/30 scale-105 ring-4 ring-secondary-500/10' : 'border-border bg-white'}`}>
                                        <div className="text-center">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                {format(date, 'EEE')}
                                            </div>
                                            <div className={`text-lg font-bold ${isToday ? 'text-secondary-600' : 'text-primary-900'}`}>
                                                {format(date, 'd')}
                                            </div>
                                        </div>

                                        <div className="space-y-2 w-full">
                                            <div className={`flex items-center justify-between p-2 rounded-lg ${status.workout ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-400'}`}>
                                                <Dumbbell className="w-4 h-4" />
                                                {status.workout ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4 opacity-30" />}
                                            </div>
                                            <div className={`flex items-center justify-between p-2 rounded-lg ${status.diet ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-400'}`}>
                                                <Apple className="w-4 h-4" />
                                                {status.diet ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4 opacity-30" />}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Performance Summary */}
                <div className="grid md:grid-cols-3 gap-6">
                    <Card className="border-none bg-emerald-600 text-white shadow-xl shadow-emerald-600/20">
                        <CardContent className="p-8">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-white/20 rounded-xl">
                                    <Dumbbell className="w-6 h-6" />
                                </div>
                                <Trophy className="w-8 h-8 opacity-20" />
                            </div>
                            <h3 className="text-lg font-bold opacity-80 uppercase tracking-widest text-xs">Workout Completion</h3>
                            <div className="text-4xl font-black mt-2">{stats.workouts}/7</div>
                            <div className="mt-4 h-2 w-full bg-white/20 rounded-full overflow-hidden">
                                <div className="h-full bg-white transition-all duration-1000" style={{ width: `${workoutPercentage}%` }} />
                            </div>
                            <p className="mt-4 text-sm opacity-80">
                                {workoutPercentage === 100 ? "Perfect week! Beast mode." : "Keep pushing for that perfect 7/7!"}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-none bg-secondary-500 text-white shadow-xl shadow-secondary-500/20">
                        <CardContent className="p-8">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-white/20 rounded-xl">
                                    <Apple className="w-6 h-6" />
                                </div>
                                <TrendingUp className="w-8 h-8 opacity-20" />
                            </div>
                            <h3 className="text-lg font-bold opacity-80 uppercase tracking-widest text-xs">Diet Adherence</h3>
                            <div className="text-4xl font-black mt-2">{stats.diets}/7</div>
                            <div className="mt-4 h-2 w-full bg-white/20 rounded-full overflow-hidden">
                                <div className="h-full bg-white transition-all duration-1000" style={{ width: `${dietPercentage}%` }} />
                            </div>
                            <p className="mt-4 text-sm opacity-80">
                                {dietPercentage === 100 ? "Nutritional excellence!" : "Consistency is key to results."}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-border border-2 border-dashed bg-transparent">
                        <CardContent className="p-8 flex flex-col items-center justify-center text-center h-full">
                            <div className="p-4 bg-primary-50 rounded-full mb-4">
                                <Trophy className="w-8 h-8 text-primary-500" />
                            </div>
                            <h3 className="font-bold text-primary-900">Weekly Score</h3>
                            <div className="text-3xl font-black text-primary-800 mt-2">
                                {Math.round((workoutPercentage + dietPercentage) / 2)}%
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                                Combined consistency score for the last 7 days.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
