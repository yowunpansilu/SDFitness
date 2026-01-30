import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingUp, Flame, Dumbbell } from 'lucide-react';

interface WorkoutStatsChartProps {
    stats: {
        totalWorkouts: number;
        totalCaloriesBurned: number;
        averageDuration: number;
        thisWeek?: number;
        thisMonth?: number;
    };
}

export function WorkoutStatsChart({ stats }: WorkoutStatsChartProps) {
    return (
        <Card className="glass-card border-dark-700">
            <CardHeader>
                <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary-400" />
                    Workout Statistics
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-dark-800">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="trends">Trends</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                            {/* Total Workouts */}
                            <div className="bg-dark-800/50 rounded-lg p-4 border border-dark-700">
                                <div className="flex items-center gap-2 mb-2">
                                    <Dumbbell className="w-4 h-4 text-primary-400" />
                                    <p className="text-xs text-gray-500">Total Workouts</p>
                                </div>
                                <p className="text-2xl font-bold text-white">{stats.totalWorkouts}</p>
                                {stats.thisMonth !== undefined && (
                                    <p className="text-xs text-gray-400 mt-1">
                                        {stats.thisMonth} this month
                                    </p>
                                )}
                            </div>

                            {/* Total Calories */}
                            <div className="bg-dark-800/50 rounded-lg p-4 border border-dark-700">
                                <div className="flex items-center gap-2 mb-2">
                                    <Flame className="w-4 h-4 text-orange-400" />
                                    <p className="text-xs text-gray-500">Calories Burned</p>
                                </div>
                                <p className="text-2xl font-bold text-white">
                                    {stats.totalCaloriesBurned.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Avg: {Math.round(stats.totalCaloriesBurned / (stats.totalWorkouts || 1))} per workout
                                </p>
                            </div>

                            {/* Average Duration */}
                            <div className="bg-dark-800/50 rounded-lg p-4 border border-dark-700">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className="w-4 h-4 text-green-400" />
                                    <p className="text-xs text-gray-500">Avg Duration</p>
                                </div>
                                <p className="text-2xl font-bold text-white">{stats.averageDuration} min</p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Per workout session
                                </p>
                            </div>

                            {/* This Week */}
                            {stats.thisWeek !== undefined && (
                                <div className="bg-dark-800/50 rounded-lg p-4 border border-dark-700">
                                    <div className="flex items-center gap-2 mb-2">
                                        <BarChart3 className="w-4 h-4 text-blue-400" />
                                        <p className="text-xs text-gray-500">This Week</p>
                                    </div>
                                    <p className="text-2xl font-bold text-white">{stats.thisWeek}</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Workouts completed
                                    </p>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="trends" className="mt-4">
                        <div className="bg-dark-800/50 rounded-lg p-8 border border-dark-700 text-center">
                            <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-400 text-sm">
                                Detailed charts and trends will be available once you log more workouts.
                            </p>
                            <p className="text-gray-500 text-xs mt-2">
                                Keep tracking your progress to see your improvement over time!
                            </p>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
