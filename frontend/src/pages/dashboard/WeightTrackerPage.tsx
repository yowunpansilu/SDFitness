import React, { useState, useEffect } from 'react';
import { History, Plus, Trash2, Target, Trophy, ChevronRight, Flag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { addWeightLog, getWeightHistory, deleteWeightLog, setWeightGoal, getActiveGoal } from '@/lib/api/weightService';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import confetti from 'canvas-confetti';
import { FitnessRoadmap } from '@/components/dashboard/FitnessRoadmap';

export function WeightTrackerPage() {
    const [weight, setWeight] = useState('');
    const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');
    const [note, setNote] = useState('');
    const [history, setHistory] = useState<any[]>([]);
    const [activeGoal, setActiveGoal] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [goalModalOpen, setGoalModalOpen] = useState(false);
    const [targetWeight, setTargetWeight] = useState('');
    const [goalType, setGoalType] = useState<'lose' | 'gain'>('lose');

    const { toast } = useToast();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [historyRes, goalRes] = await Promise.all([
                getWeightHistory(),
                getActiveGoal()
            ]);
            setHistory(historyRes.data);
            setActiveGoal(goalRes.data);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!weight) return;

        setSubmitting(true);
        try {
            const res = await addWeightLog({
                weight: parseFloat(weight),
                unit,
                note
            });

            toast({
                title: res.goalReached ? "GOAL REACHED! 🎉" : "Weight Logged",
                description: res.goalReached
                    ? `Congratulations! You've reached your target of ${res.activeGoal.targetWeight}kg!`
                    : `Successfully logged ${weight}${unit}.`,
            });

            if (res.goalReached) {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#3b82f6', '#10b981', '#f59e0b']
                });
            }

            setWeight('');
            setNote('');
            fetchData();
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.response?.data?.message || "Failed to log weight",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleSetGoal = async () => {
        if (!targetWeight) return;

        try {
            await setWeightGoal({
                targetWeight: parseFloat(targetWeight),
                type: goalType
            });
            toast({
                title: "Goal Set",
                description: `New ${goalType} goal set to ${targetWeight}kg.`,
            });
            setGoalModalOpen(false);
            setTargetWeight('');
            fetchData();
        } catch (err: any) {
            toast({
                title: "Error",
                description: "Failed to set goal",
                variant: "destructive",
            });
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteWeightLog(id);
            toast({
                title: "Log Deleted",
                description: "Weight log removed successfully.",
            });
            fetchData();
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to delete log",
                variant: "destructive",
            });
        }
    };

    const calculateProgress = () => {
        if (!activeGoal || history.length === 0) return 0;
        const current = history[0].weightKg;
        const start = activeGoal.startWeight;
        const target = activeGoal.targetWeight;

        if (activeGoal.type === 'lose') {
            const total = start - target;
            const progress = start - current;
            return Math.min(100, Math.max(0, (progress / total) * 100));
        } else {
            const total = target - start;
            const progress = current - start;
            return Math.min(100, Math.max(0, (progress / total) * 100));
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Weight Tracking</h1>
                    <p className="text-muted-foreground">Monitor your weight progress and reach your goals.</p>
                </div>
                {!activeGoal && !loading && (
                    <Dialog open={goalModalOpen} onOpenChange={setGoalModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-primary-500 hover:bg-primary-600 text-primary-foreground shadow-lg shadow-primary-500/30">
                                <Plus className="w-4 h-4 mr-2" />
                                Set Weight Goal
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="glass-card border-white/20">
                            <DialogHeader>
                                <DialogTitle>Set Your Goal</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">I want to...</label>
                                    <Select value={goalType} onValueChange={(val: any) => setGoalType(val)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="lose">Lose Weight</SelectItem>
                                            <SelectItem value="gain">Gain Weight</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Target Weight (kg)</label>
                                    <Input
                                        type="number"
                                        placeholder="70.0"
                                        value={targetWeight}
                                        onChange={(e) => setTargetWeight(e.target.value)}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="ghost" onClick={() => setGoalModalOpen(false)}>Cancel</Button>
                                <Button onClick={handleSetGoal}>Set Goal</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {/* Overview Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="glass-card">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-muted-foreground">Target Weight</p>
                                <p className="text-3xl font-bold text-foreground mt-2">
                                    {activeGoal ? `${activeGoal.targetWeight}kg` : 'Not set'}
                                </p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-500/10">
                                <Target className="h-6 w-6 text-primary-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-muted-foreground">Starting Weight</p>
                                <p className="text-3xl font-bold text-foreground mt-2">
                                    {activeGoal ? `${activeGoal.startWeight}kg` : (history[history.length - 1]?.weightKg || '0') + 'kg'}
                                </p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary-500/10">
                                <Flag className="h-6 w-6 text-secondary-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-muted-foreground">Current Weight</p>
                                <p className="text-3xl font-bold text-foreground mt-2">
                                    {history[0] ? `${history[0].weightKg}kg` : 'No logs'}
                                </p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-500/10">
                                <History className="h-6 w-6 text-accent-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-muted-foreground">Status</p>
                                <p className="text-2xl font-bold text-foreground mt-2">
                                    {activeGoal ? (
                                        activeGoal.type === 'lose' ? 'Cutting' : 'Bulking'
                                    ) : 'Steady'}
                                </p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success-500/10">
                                <Trophy className="h-6 w-6 text-success" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Fitness Journey Roadmap */}
            {history.length > 0 && (
                <Card className="glass-card overflow-hidden border-primary-500/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <ChevronRight className="w-5 h-5 text-primary-500" />
                            Your Fitness Journey
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FitnessRoadmap logs={history} goal={activeGoal} />
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-1">
                    {/* Active Goal Progress */}
                    {activeGoal && (
                        <Card className="glass-card border-secondary-500/30 shadow-lg shadow-secondary-500/10">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-md flex items-center gap-2">
                                            <Target className="w-4 h-4 text-secondary-500" />
                                            Active Goal
                                        </CardTitle>
                                        <CardDescription>
                                            {activeGoal.type === 'lose' ? 'Losing' : 'Gaining'} to {activeGoal.targetWeight}kg
                                        </CardDescription>
                                    </div>
                                    <Trophy className="w-8 h-8 text-secondary-500/30" />
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between text-sm font-medium">
                                    <span>{Math.round(calculateProgress())}% Progress</span>
                                    <span className="text-muted-foreground">{history[0]?.weightKg || activeGoal.startWeight} / {activeGoal.targetWeight}kg</span>
                                </div>
                                <Progress value={calculateProgress()} className="h-3 bg-secondary-500/10" />
                                <Button
                                    variant="outline"
                                    className="w-full text-xs h-8 border-dashed"
                                    onClick={() => setGoalModalOpen(true)}
                                >
                                    New Goal
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Log Weight Form */}
                    <Card className="glass-card">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-md">
                                <Plus className="w-5 h-5 text-primary-500" />
                                Log Weight
                            </CardTitle>
                            <CardDescription>Keep tracking your progress.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="flex gap-2">
                                    <div className="space-y-2 flex-1">
                                        <label className="text-sm font-medium">Weight</label>
                                        <Input
                                            type="number"
                                            step="0.1"
                                            placeholder="0.0"
                                            value={weight}
                                            onChange={(e) => setWeight(e.target.value)}
                                            className="bg-background/50"
                                        />
                                    </div>
                                    <div className="space-y-2 w-28">
                                        <label className="text-sm font-medium">Unit</label>
                                        <Select value={unit} onValueChange={(val: any) => setUnit(val)}>
                                            <SelectTrigger className="bg-background/50">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="kg">kg</SelectItem>
                                                <SelectItem value="lbs">lbs</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Note (Optional)</label>
                                    <Input
                                        placeholder="e.g. After morning run"
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        className="bg-background/50"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-11 font-bold shadow-lg shadow-primary-500/20"
                                    disabled={submitting || !weight}
                                >
                                    {submitting ? 'Saving...' : 'Log Weight'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* History Table */}
                <Card className="glass-card lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-md">
                            <History className="w-5 h-5 text-secondary-500" />
                            Weight History
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-2">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ) : history.length > 0 ? (
                            <div className="rounded-xl border border-border overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Weight</TableHead>
                                            <TableHead>Note</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {history.map((log: any) => (
                                            <TableRow key={log._id} className="hover:bg-muted/20 transition-colors">
                                                <TableCell className="font-medium">
                                                    {format(new Date(log.date), 'MMM dd, yyyy')}
                                                </TableCell>
                                                <TableCell>
                                                    {log.weight} {log.unit}
                                                    {log.unit === 'lbs' && (
                                                        <span className="text-xs text-muted-foreground ml-2">
                                                            ({Math.round(log.weightKg * 10) / 10} kg)
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground max-w-[200px] truncate">
                                                    {log.note || '-'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(log._id)}
                                                        className="text-destructive hover:bg-destructive/10"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-xl">
                                <p>No weight logs found.</p>
                                <p className="text-xs">Your progress will appear here once you start logging.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
