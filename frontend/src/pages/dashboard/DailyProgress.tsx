import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';
import { getDailyProgress, toggleDailyProgress, type DailyProgress as DailyProgressType } from '@/lib/api/progressApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DailyGoalCelebration from '@/components/ui/DailyGoalCelebration';
import { Dumbbell, Apple, CheckCircle2, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function DailyProgress() {
    const { user } = useAuthStore();
    const { toast } = useToast();
    const [progress, setProgress] = useState<DailyProgressType | null>(null);
    const [loading, setLoading] = useState(true);
    const [showCelebration, setShowCelebration] = useState(false);

    const today = new Date();
    const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
    // Unique key per user per day so it shows once per day only
    const celebrationKey = `daily_goal_celebrated_${user?.id}_${today.toISOString().split('T')[0]}`;

    useEffect(() => {
        if (user?.id) {
            fetchDailyProgress();
        }
    }, [user?.id]);

    // Watch for goal completion whenever progress changes
    useEffect(() => {
        if (!progress) return;
        const bothDone = progress.workoutCompleted && progress.dietLogged;
        const alreadyShown = localStorage.getItem(celebrationKey);
        if (bothDone && !alreadyShown) {
            // Small delay to let the button animation finish first
            const timer = setTimeout(() => {
                setShowCelebration(true);
                localStorage.setItem(celebrationKey, 'true');
            }, 600);
            return () => clearTimeout(timer);
        }
    }, [progress?.workoutCompleted, progress?.dietLogged]);

    const fetchDailyProgress = async () => {
        try {
            setLoading(true);
            const data = await getDailyProgress(user!.id, today);
            setProgress(data);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load daily progress.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (type: 'workout' | 'diet', currentValue: boolean) => {
        if (!user?.id) return;
        try {
            // Optimistic update
            setProgress(prev =>
                prev
                    ? { ...prev, [type === 'workout' ? 'workoutCompleted' : 'dietLogged']: !currentValue }
                    : null
            );
            await toggleDailyProgress(user.id, today, type, !currentValue);

            if (type === 'workout' && !currentValue) {
                toast({ title: '💪 Workout logged!', description: 'Great work — keep pushing!' });
            } else if (type === 'diet' && !currentValue) {
                toast({ title: '🥗 Diet logged!', description: 'Nutrition on point today!' });
            }
        } catch (error) {
            fetchDailyProgress();
            toast({
                title: 'Error',
                description: `Failed to update ${type} progress.`,
                variant: 'destructive',
            });
        }
    };

    const bothCompleted = !!(progress?.workoutCompleted && progress?.dietLogged);

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10 mt-6">

            {/* Celebration overlay */}
            {showCelebration && (
                <DailyGoalCelebration onClose={() => setShowCelebration(false)} />
            )}

            {/* Header */}
            <div className="border-b pb-4">
                <h1 className="text-3xl font-bold text-foreground">Daily Progress</h1>
                <p className="text-sm text-muted-foreground mt-1 flex items-center">
                    Log your activities for{' '}
                    <span className="font-semibold text-foreground ml-2">
                        {today.toLocaleDateString(undefined, dateOptions)}
                    </span>
                </p>
            </div>

            {/* Daily goal status banner */}
            {!loading && (
                <div className={`rounded-2xl border-2 px-6 py-4 flex items-center gap-4 transition-all duration-500 ${bothCompleted
                        ? 'border-emerald-400 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20'
                        : 'border-border bg-secondary/10'
                    }`}>
                    <div className={`p-2 rounded-full ${bothCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>
                        <Target className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-sm">
                            {bothCompleted
                                ? '🎉 Daily Goal Complete! Both workout and diet done!'
                                : `Daily Goal: ${[!progress?.workoutCompleted && 'Complete workout', !progress?.dietLogged && 'Log diet'].filter(Boolean).join(' + ')} remaining`}
                        </p>
                        <div className="flex gap-3 mt-1">
                            <span className={`text-xs flex items-center gap-1 ${progress?.workoutCompleted ? 'text-emerald-600 font-semibold' : 'text-muted-foreground'}`}>
                                <Dumbbell className="w-3 h-3" />
                                Workout {progress?.workoutCompleted ? '✓' : '○'}
                            </span>
                            <span className={`text-xs flex items-center gap-1 ${progress?.dietLogged ? 'text-emerald-600 font-semibold' : 'text-muted-foreground'}`}>
                                <Apple className="w-3 h-3" />
                                Diet {progress?.dietLogged ? '✓' : '○'}
                            </span>
                        </div>
                    </div>
                    {bothCompleted && (
                        <span className="text-2xl animate-bounce">🏆</span>
                    )}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center p-10 text-muted-foreground">Loading your daily goals...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                    {/* Workout Card */}
                    <Card className={`border-2 transition-all duration-300 ${progress?.workoutCompleted ? 'border-emerald-500 bg-emerald-50/10 shadow-emerald-100 shadow-md' : 'border-border'}`}>
                        <CardContent className="flex flex-col items-center text-center p-10">
                            <div className={`p-4 rounded-full mb-6 transition-colors ${progress?.workoutCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-secondary/30 text-secondary-600'}`}>
                                <Dumbbell className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Workout</h2>
                            <p className="text-muted-foreground mb-8">Did you complete your daily exercise goals?</p>

                            <Button
                                variant={progress?.workoutCompleted ? 'default' : 'outline'}
                                onClick={() => handleToggle('workout', !!progress?.workoutCompleted)}
                                className={`w-48 transition-all ${progress?.workoutCompleted ? 'bg-emerald-600 hover:bg-emerald-700' : 'border-emerald-600 text-emerald-600 hover:bg-emerald-50'}`}
                            >
                                {progress?.workoutCompleted ? (
                                    <><CheckCircle2 className="w-4 h-4 mr-2" /> Completed</>
                                ) : (
                                    'Mark as Complete'
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Diet Card */}
                    <Card className={`border-2 transition-all duration-300 ${progress?.dietLogged ? 'border-emerald-500 bg-emerald-50/10 shadow-emerald-100 shadow-md' : 'border-border'}`}>
                        <CardContent className="flex flex-col items-center text-center p-10">
                            <div className={`p-4 rounded-full mb-6 transition-colors ${progress?.dietLogged ? 'bg-amber-100 text-amber-800' : 'bg-secondary/30 text-secondary-600'}`}>
                                <Apple className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Diet Log</h2>
                            <p className="text-muted-foreground mb-8">Did you strictly follow your diet plan today?</p>

                            <Button
                                variant={progress?.dietLogged ? 'default' : 'outline'}
                                onClick={() => handleToggle('diet', !!progress?.dietLogged)}
                                className={`w-48 transition-all ${progress?.dietLogged ? 'bg-amber-600 hover:bg-amber-700' : 'border-amber-600 text-amber-600 hover:bg-amber-50'}`}
                            >
                                {progress?.dietLogged ? (
                                    <><CheckCircle2 className="w-4 h-4 mr-2" /> Logged</>
                                ) : (
                                    'Mark as Logged'
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Re-trigger button (for demo/testing) */}
            {bothCompleted && !showCelebration && (
                <div className="flex justify-center pt-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-xs text-muted-foreground"
                        onClick={() => {
                            localStorage.removeItem(celebrationKey);
                            setShowCelebration(true);
                        }}
                    >
                        🎉 Replay Celebration
                    </Button>
                </div>
            )}
        </div>
    );
}
