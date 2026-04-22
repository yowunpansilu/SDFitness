import { useState, useEffect } from 'react';
import { Activity, Target, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { submitDailyProgress, getDailyProgress } from '@/lib/api/progressService';
import { DailyProgressChart } from '../../components/dashboard/DailyProgressChart';

export function ProgressPage() {
    const [workoutCompleted, setWorkoutCompleted] = useState(false);
    const [dietFollowed, setDietFollowed] = useState(false);
    const [notes, setNotes] = useState('');
    const [isLoggedToday, setIsLoggedToday] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        checkTodayStatus();
    }, []);

    const checkTodayStatus = async () => {
        try {
            const res = await getDailyProgress();
            if (res.data) {
                setIsLoggedToday(true);
                setWorkoutCompleted(res.data.workoutCompleted);
                setDietFollowed(res.data.dietFollowed);
                setNotes(res.data.notes || '');
            }
        } catch (err) {
            console.error('Error fetching today status:', err);
        }
    };

    const handleSubmit = async () => {
        try {
            await submitDailyProgress({ workoutCompleted, dietFollowed, notes });
            toast({
                title: "Progress Saved",
                description: "Your daily progress has been logged successfully.",
            });
            setIsLoggedToday(true);
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.response?.data?.message || "Failed to save progress",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Daily Progress</h1>
                    <p className="text-muted-foreground">Keep track of your consistency and metrics.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-primary-500" />
                            Daily Log
                        </CardTitle>
                        <CardDescription>
                            Mark your activities for {new Date().toLocaleDateString()}.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center space-x-4 p-4 rounded-xl bg-primary-50/50 border border-primary-100">
                            <Checkbox
                                id="workout"
                                checked={workoutCompleted}
                                onCheckedChange={(checked) => setWorkoutCompleted(!!checked)}
                                disabled={isLoggedToday}
                            />
                            <label htmlFor="workout" className="text-sm font-medium leading-none cursor-pointer flex-1">
                                Workout Completed
                            </label>
                            {workoutCompleted && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                        </div>

                        <div className="flex items-center space-x-4 p-4 rounded-xl bg-primary-50/50 border border-primary-100">
                            <Checkbox
                                id="diet"
                                checked={dietFollowed}
                                onCheckedChange={(checked) => setDietFollowed(!!checked)}
                                disabled={isLoggedToday}
                            />
                            <label htmlFor="diet" className="text-sm font-medium leading-none cursor-pointer flex-1">
                                Followed Diet Plan
                            </label>
                            {dietFollowed && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Daily Notes</label>
                            <Textarea
                                placeholder="How was your day? Any struggles or wins?"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                disabled={isLoggedToday}
                                className="min-h-[100px] bg-background/50"
                            />
                        </div>

                        {!isLoggedToday ? (
                            <Button onClick={handleSubmit} className="w-full h-12 text-base font-bold shadow-lg shadow-primary-500/20">
                                Save Daily Progress
                            </Button>
                        ) : (
                            <div className="flex items-center justify-center gap-2 py-4 text-green-600 font-semibold bg-green-50 rounded-xl border border-green-100">
                                <CheckCircle2 className="w-5 h-5" />
                                Progress Logged for Today
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="glass-card lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="w-5 h-5 text-secondary-500" />
                            Weekly Overview
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <DailyProgressChart />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
