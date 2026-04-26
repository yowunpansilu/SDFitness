import { useState, useMemo } from 'react';
import api from '@/lib/api/axios';
import { useAuthStore } from '@/lib/stores/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';

interface WeightLog {
    _id: string;
    weight: number;
    unit: string;
    date: string;
}

export function ProgressChart({ logs, onRefresh }: { logs: WeightLog[], onRefresh: () => void }) {
    const { member } = useAuthStore();
    const [newWeight, setNewWeight] = useState('');
    const [timeFilter, setTimeFilter] = useState<'1M' | '3M' | '6M' | 'ALL'>('ALL');

    const handleLogWeight = async () => {
        if (!newWeight) {
            alert('Please type in a weight amount first!');
            document.getElementById('weight-input')?.focus();
            return;
        }
        try {
            await api.post(`/progress/weight`, {
                weightValue: parseFloat(newWeight),
                weightUnit: member?.currentWeight?.unit || 'kg'
            });
            setNewWeight('');
            onRefresh(); // refresh data via parent
        } catch (error) {
            console.error('Error logging weight:', error);
            alert('Failed to log weight');
        }
    };

    // Filter logs based on selection
    const filteredLogs = useMemo(() => {
        const now = new Date();
        let cutoff = new Date(0); // ALL by default

        if (timeFilter === '1M') cutoff = new Date(now.setMonth(now.getMonth() - 1));
        if (timeFilter === '3M') cutoff = new Date(now.setMonth(now.getMonth() - 3));
        if (timeFilter === '6M') cutoff = new Date(now.setMonth(now.getMonth() - 6));

        return logs.filter(log => new Date(log.date) >= cutoff).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [logs, timeFilter]);

    // Format data for Recharts, optionally calculating a simple moving average for trend line
    const chartData = useMemo(() => {
        const result = [];
        for (let i = 0; i < filteredLogs.length; i++) {
            const currentObj = filteredLogs[i];

            // simple 3-point moving average trend line
            let trendSum = currentObj.weight;
            let trendDivisor = 1;

            if (i > 0) { trendSum += filteredLogs[i - 1].weight; trendDivisor++; }
            if (i > 1) { trendSum += filteredLogs[i - 2].weight; trendDivisor++; }

            result.push({
                fullDate: currentObj.date,
                date: new Date(currentObj.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                weight: currentObj.weight,
                trend: parseFloat((trendSum / trendDivisor).toFixed(2))
            });
        }
        return result;
    }, [filteredLogs]);

    const targetWeight = member?.targetWeight?.value;
    const unit = member?.currentWeight?.unit || 'kg';

    return (
        <Card className="border-border">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-4">
                <CardTitle>Weight Trajectory</CardTitle>
                <div className="flex gap-2 items-center w-full justify-between sm:w-auto sm:justify-end">

                    {/* Time Filters */}
                    <div className="hidden md:flex bg-secondary/10 rounded-lg p-1 mr-4">
                        {['1M', '3M', '6M', 'ALL'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setTimeFilter(f as any)}
                                className={`px-3 py-1 text-xs rounded-md transition-all ${timeFilter === f ? 'bg-background shadow-sm text-foreground font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/20'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    <Input
                        id="weight-input"
                        type="number"
                        placeholder={`Weight (${unit})`}
                        value={newWeight}
                        onChange={(e) => setNewWeight(e.target.value)}
                        className="w-24 h-8 text-sm"
                        onKeyDown={(e) => { if (e.key === 'Enter') handleLogWeight() }}
                    />
                    <Button variant="gym" size="sm" onClick={handleLogWeight}>Log</Button>
                </div>
            </CardHeader>
            <CardContent>
                {/* Mobile time filters */}
                <div className="flex md:hidden bg-secondary/10 rounded-lg p-1 mb-4 w-full justify-between">
                    {['1M', '3M', '6M', 'ALL'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setTimeFilter(f as any)}
                            className={`flex-1 px-3 py-1 text-xs rounded-md transition-all ${timeFilter === f ? 'bg-background shadow-sm text-foreground font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/20'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                <div className="h-[300px] w-full mt-4">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <AreaChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <defs>
                                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#e60000" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#e60000" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ccc" vertical={false} opacity={0.5} />
                                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#888' }} axisLine={false} tickLine={false} />
                                <YAxis
                                    domain={['auto', 'auto']}
                                    tick={{ fontSize: 12, fill: '#888' }}
                                    axisLine={false}
                                    tickLine={false}
                                    label={{ value: unit, angle: -90, position: 'insideLeft', fill: '#888' }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ fontWeight: 500 }}
                                />
                                {targetWeight && (
                                    <ReferenceLine y={targetWeight} label={{ position: 'top', value: 'Target', fill: '#10b981', fontSize: 12 }} stroke="#10b981" strokeDasharray="3 3" />
                                )}
                                <Area
                                    type="monotone"
                                    dataKey="weight"
                                    stroke="#e60000"
                                    fillOpacity={1}
                                    fill="url(#colorWeight)"
                                    strokeWidth={3}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                    name="Weight"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground text-sm border-2 border-dashed border-border rounded-xl">
                            {logs.length > 0 ? 'No logs in this specific time range.' : 'No weight logs recorded yet.'}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
