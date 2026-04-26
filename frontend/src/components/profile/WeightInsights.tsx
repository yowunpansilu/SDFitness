import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, TrendingDown, TrendingUp, CalendarDays } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/authStore';

interface WeightLog {
    _id: string;
    weight: number;
    unit: string;
    date: string;
}

export function WeightInsights({ logs }: { logs: WeightLog[] }) {
    const { member } = useAuthStore();

    // Sort logs descending (newest first)
    const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const currentWeight = member?.currentWeight?.value || 0;
    const targetWeight = member?.targetWeight?.value || 0;
    const unit = member?.currentWeight?.unit || 'kg';
    const initWeight = sortedLogs.length > 0 ? sortedLogs[sortedLogs.length - 1].weight : currentWeight;

    // Calculations
    const totalDiff = currentWeight - initWeight;

    let rateOfChange = 0;
    let etaWeeks = 0;

    if (sortedLogs.length >= 2) {
        const oldestLog = sortedLogs[sortedLogs.length - 1];
        const newestLog = sortedLogs[0];
        const daysDiff = (new Date(newestLog.date).getTime() - new Date(oldestLog.date).getTime()) / (1000 * 3600 * 24);

        if (daysDiff > 0) {
            const weightDiff = newestLog.weight - oldestLog.weight;
            rateOfChange = (weightDiff / daysDiff) * 7; // per week

            if (targetWeight > 0 && rateOfChange !== 0) {
                const weightLeft = targetWeight - currentWeight;
                // If weightLeft and rateOfChange have same sign, we are moving towards goal
                if ((weightLeft < 0 && rateOfChange < 0) || (weightLeft > 0 && rateOfChange > 0)) {
                    etaWeeks = Math.abs(weightLeft / rateOfChange);
                }
            }
        }
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Change</CardTitle>
                    {totalDiff < 0 ? (
                        <TrendingDown className="h-4 w-4 text-emerald-500" />
                    ) : (
                        <TrendingUp className="h-4 w-4 text-rose-500" />
                    )}
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {totalDiff > 0 ? '+' : ''}{totalDiff.toFixed(1)} {unit}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Since starting program</p>
                </CardContent>
            </Card>

            <Card className="border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Rate of Change</CardTitle>
                    <TrendingDown className={`h-4 w-4 ${rateOfChange < 0 ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {rateOfChange > 0 ? '+' : ''}{rateOfChange.toFixed(2)} {unit}/wk
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Based on log history</p>
                </CardContent>
            </Card>

            <Card className="border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Distance to Goal</CardTitle>
                    <Target className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {Math.abs(targetWeight - currentWeight).toFixed(1)} {unit}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Remaining to hit target</p>
                </CardContent>
            </Card>

            <Card className="border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">ETA to Goal</CardTitle>
                    <CalendarDays className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {etaWeeks > 0 ? `${Math.ceil(etaWeeks)} Weeks` : '--'}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">At current weekly rate</p>
                </CardContent>
            </Card>
        </div>
    );
}
