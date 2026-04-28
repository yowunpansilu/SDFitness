import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api/axios';
import { Target, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProgressChart } from '@/components/profile/ProgressChart';
import { WeightInsights } from '@/components/profile/WeightInsights';
import { WeightHistoryTable } from '@/components/profile/WeightHistoryTable';
import { useAuthStore } from '@/lib/stores/authStore';

interface WeightLog {
    _id: string;
    weight: number;
    unit: string;
    date: string;
}

export function MemberProgress() {
    const { token, user, login } = useAuthStore();
    const navigate = useNavigate();

    const [logs, setLogs] = useState<WeightLog[]>([]);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005';

    const fetchLatestData = useCallback(async () => {
        try {
            // Fetch latest profile to ensure store is synced
            const profileRes = await api.get(`/auth/me`);
            if (profileRes.data.success) {
                login(profileRes.data.user, token!, profileRes.data.memberProfile);
            }

            // Fetch Logs
            const logsRes = await api.get(`/progress/weight`);
            if (logsRes.data.success) {
                setLogs(logsRes.data.data);
            }
        } catch (error) {
            console.error('Error fetching progress data:', error);
        }
    }, [API_URL, token, login]);

    useEffect(() => {
        if (token) fetchLatestData();
    }, [token, fetchLatestData]);

    if (user?.role === 'admin' || user?.role === 'trainer') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] text-center space-y-4 animate-fade-in bg-card border border-border rounded-xl">
                <Target className="w-12 h-12 text-muted-foreground opacity-50" />
                <h2 className="text-2xl font-bold font-headline text-foreground">Member Feature Only</h2>
                <p className="text-muted-foreground max-w-md">
                    You are currently logged in with an <strong>{user?.role}</strong> account. Fitness tracking, daily logs, and body measurements are functionally exclusively assigned to gym members.
                </p>
                <Button variant="outline" onClick={() => navigate('/dashboard')} className="mt-4">
                    Return to Dashboard
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-headline font-bold text-foreground">Weight Tracking</h1>
                    <p className="text-muted-foreground mt-2">
                        Monitor your trajectory, evaluate your rate of progress, and crush your goals.
                    </p>
                </div>
            </div>

            {/* Premium Insights Row */}
            <WeightInsights logs={logs} />

            {/* Main Interactive Chart & History Table Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <ProgressChart logs={logs} onRefresh={fetchLatestData} />
                </div>
                <div className="lg:col-span-1">
                    <WeightHistoryTable logs={logs} onRefresh={fetchLatestData} />
                </div>
            </div>

            {/* Other Metrics Section */}
            <div className="grid md:grid-cols-2 gap-6 mt-6">
                <Card className="border-border overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-0" />
                    <CardHeader className="relative z-10">
                        <CardTitle className="text-lg">Body Measurements</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground text-sm mb-4">
                            Keep track of your body measurements over time for better accuracy.
                        </p>
                        <Link to="/dashboard/body-measurements" className="relative z-10 inline-flex flex-row items-center gap-2 text-sm font-medium text-primary hover:text-primary-600 transition-colors">
                            Add Measurements <ArrowRight className="w-4 h-4" />
                        </Link>
                    </CardContent>
                </Card>

                <Card className="border-border overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-0" />
                    <CardHeader className="relative z-10">
                        <CardTitle className="text-lg">Workout PRs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground text-sm mb-4">
                            Track your personal records for major lifts.
                        </p>
                        <button
                            onClick={() => alert('Workout PRs module is coming soon!')}
                            className="relative z-10 flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-600 transition-colors"
                        >
                            View Records <ArrowRight className="w-4 h-4" />
                        </button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
