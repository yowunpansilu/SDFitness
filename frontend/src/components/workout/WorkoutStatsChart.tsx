import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingUp, Flame, Dumbbell } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { Workout } from '@/lib/api/workoutApi';
import { format, subDays, isSameDay } from 'date-fns';

interface WorkoutStatsChartProps {
    stats: {
        totalWorkouts: number;
        totalCaloriesBurned: number;
        averageDuration: number;
        thisWeek?: number;
        thisMonth?: number;
    };
    history?: Workout[];
}

export function WorkoutStatsChart({ stats, history = [] }: WorkoutStatsChartProps) {
    // Prepare data for the chart (last 7 days)
    const getLast7DaysData = () => {
        const data = [];
        for (let i = 6; i >= 0; i--) {
            const date = subDays(new Date(), i);
            const workoutsOnDay = history.filter(w => isSameDay(new Date(w.workoutDate), date));

            data.push({
                date: format(date, 'MMM dd'),
                workouts: workoutsOnDay.length,
                calories: workoutsOnDay.reduce((acc, w) => acc + w.totalCaloriesBurned, 0),
                duration: workoutsOnDay.reduce((acc, w) => acc + w.duration, 0),
            });
        }
        return data;
    };

    const chartData = getLast7DaysData();

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Workout Statistics
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="trends">Trends</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4 mt-4 animate-fade-in">
                        <div className="grid grid-cols-2 gap-4">
                            {/* Total Workouts */}
                            <div className="bg-muted/30 rounded-lg p-4 border border-border">
                                <div className="flex items-center gap-2 mb-2">
                                    <Dumbbell className="w-4 h-4 text-primary" />
                                    <p className="text-xs text-muted-foreground">Total Workouts</p>
                                </div>
                                <p className="text-2xl font-bold">{stats.totalWorkouts}</p>
                                {stats.thisMonth !== undefined && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {stats.thisMonth} this month
                                    </p>
                                )}
                            </div>

                            {/* Total Calories */}
                            <div className="bg-muted/30 rounded-lg p-4 border border-border">
                                <div className="flex items-center gap-2 mb-2">
                                    <Flame className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                    <p className="text-xs text-muted-foreground">Calories Burned</p>
                                </div>
                                <p className="text-2xl font-bold">
                                    {stats.totalCaloriesBurned.toLocaleString()}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Avg: {Math.round(stats.totalCaloriesBurned / (stats.totalWorkouts || 1))} per workout
                                </p>
                            </div>

                            {/* Average Duration */}
                            <div className="bg-muted/30 rounded-lg p-4 border border-border">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    <p className="text-xs text-muted-foreground">Avg Duration</p>
                                </div>
                                <p className="text-2xl font-bold">{stats.averageDuration} min</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Per workout session
                                </p>
                            </div>

                            {/* This Week */}
                            {stats.thisWeek !== undefined && (
                                <div className="bg-muted/30 rounded-lg p-4 border border-border">
                                    <div className="flex items-center gap-2 mb-2">
                                        <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        <p className="text-xs text-muted-foreground">This Week</p>
                                    </div>
                                    <p className="text-2xl font-bold">{stats.thisWeek}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Workouts completed
                                    </p>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="trends" className="mt-4 animate-fade-in">
                        <div className="bg-muted/30 rounded-lg p-4 border border-border h-[300px]">
                            <h3 className="text-sm font-semibold text-muted-foreground mb-4">Activity (Last 7 Days)</h3>
                            <ResponsiveContainer width="100%" height="90%" minWidth={0}>
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        stroke="currentColor"
                                        opacity={0.5}
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="currentColor"
                                        opacity={0.5}
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0.5rem' }}
                                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                                        cursor={{ fill: 'currentColor', opacity: 0.1 }}
                                    />
                                    <Bar dataKey="duration" name="Duration (min)" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="calories" name="Calories" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} hide />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
