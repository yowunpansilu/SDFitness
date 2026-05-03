import { useEffect, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { getWeeklyProgress } from '@/lib/api/progressService';
import { Skeleton } from '@/components/ui/skeleton';

export function DailyProgressChart() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getWeeklyProgress();
                // Map data to chart format
                const chartData = res.data.map((item: any) => ({
                    date: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
                    workout: item.workoutCompleted ? 1 : 0,
                    diet: item.dietFollowed ? 1 : 0,
                }));
                setData(chartData);
            } catch (err) {
                console.error('Error fetching weekly progress:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <Skeleton className="w-full h-full rounded-xl" />;
    }

    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground border-2 border-dashed border-border rounded-xl">
                <p>No data recorded for the last 7 days.</p>
                <p className="text-xs">Start logging your progress to see charts!</p>
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis hide />
                <Tooltip
                    cursor={{ fill: 'hsl(var(--primary-50))' }}
                    contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '0.75rem',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                    }}
                />
                <Legend iconType="circle" />
                <Bar
                    name="Workout"
                    dataKey="workout"
                    fill="hsl(var(--primary-500))"
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                />
                <Bar
                    name="Diet"
                    dataKey="diet"
                    fill="hsl(var(--secondary-500))"
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                />
            </BarChart>
        </ResponsiveContainer>
    );
}
