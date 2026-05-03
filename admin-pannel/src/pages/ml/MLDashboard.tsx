import { useState, useEffect } from 'react';
import { Activity, TrendingUp, CheckCircle2, AlertTriangle, RefreshCw, Loader2, Gauge } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { mlService } from '@/services/mlService';

// Colors for bar chart
const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#f97316', '#84cc16'];

export function MLDashboard() {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<{
        modelInfo: { metrics: { r2: number; rmse: number }; avgInferenceMs: number; version: string; algorithm: string; samples: number; trainedAt: string };
        generationStats: { successRate: number; mlPlans: number; fallbackPlans: number };
        featureImportance: { feature: string; importance: number }[];
        comparison: { metric: string; ml: number; gemini: number }[];
    } | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await mlService.getMLStats();
            setData(result);
        } catch (error) {
            console.error('Failed to fetch ML stats:', error);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchData();
    };

    if (loading || !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="h-10 w-10 text-indigo-600 dark:text-indigo-400 animate-spin" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Synchronizing AI Models...</p>
            </div>
        );
    }

    const { modelInfo, generationStats, featureImportance, comparison } = data;

    return (
        <div className="space-y-10 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 text-slate-900 dark:text-white">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white uppercase transition-colors">
                        AI Model <span className="text-indigo-600 dark:text-indigo-400">Analytics</span>
                    </h1>
                    <p className="text-slate-500 dark:text-navy-400 font-medium mt-1">
                        Predictive model performance, generation metrics, and feature importance.
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={handleRefresh}
                    className="h-11 px-6 bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 rounded-xl font-bold text-slate-600 dark:text-white focus:ring-4 focus:ring-indigo-500/10 shadow-sm transition-all hover:border-indigo-500/50 gap-2"
                    disabled={isRefreshing}
                >
                    <RefreshCw className={`w-4 h-4 text-indigo-500 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh Stats
                </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { label: 'Model Accuracy', value: modelInfo.metrics.r2, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10', icon: Gauge },
                    { label: 'Error Rate (RMSE)', value: modelInfo.metrics.rmse, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-500/10', icon: Activity },
                    { label: 'Latency (Avg)', value: `${modelInfo.avgInferenceMs}ms`, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', icon: TrendingUp },
                    { label: 'Plan Success Rate', value: `${generationStats.successRate}%`, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', icon: CheckCircle2 },
                ].map(({ label, value, color, bg, icon: Icon }) => (
                    <Card key={label} className="bg-white dark:bg-navy-900 border-navy-100/50 dark:border-navy-800 shadow-sm rounded-2xl overflow-hidden group hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500">
                        <CardContent className="p-6">
                            <div className={cn("inline-flex p-2 rounded-xl mb-3 transition-transform group-hover:scale-110", bg, color)}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white transition-colors">{value}</div>
                            <div className="text-xs font-bold text-slate-400 dark:text-navy-500 uppercase tracking-widest mt-1 transition-colors">{label}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Feature Importance */}
                <Card className="bg-white dark:bg-navy-900 border-navy-100/50 dark:border-navy-800 shadow-sm rounded-[2rem] overflow-hidden transition-all duration-500 hover:shadow-lg">
                    <CardHeader className="p-8 pb-4">
                        <CardTitle className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Generation Factors</CardTitle>
                        <p className="text-xs font-bold text-slate-400 dark:text-navy-500 uppercase tracking-widest mt-1">Impact of individual parameters on plan generation</p>
                    </CardHeader>
                    <CardContent className="p-8 pt-4">
                        <ResponsiveContainer width="100%" height={320} minWidth={0}>
                            <BarChart data={featureImportance} layout="vertical" margin={{ left: 0, right: 30 }}>
                                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="currentColor" className="text-slate-100 dark:text-navy-800 transition-colors" />
                                <XAxis type="number" hide />
                                <YAxis
                                    type="category"
                                    dataKey="feature"
                                    tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 700 }}
                                    className="text-slate-400 dark:text-navy-500 transition-colors font-bold"
                                    width={120}
                                    tickFormatter={v => v.replace(/_/g, ' ').toUpperCase()}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: 'none',
                                        borderRadius: '16px',
                                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                                        color: '#1e293b'
                                    }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase' }}
                                    formatter={(v: unknown) => [`${Math.round(Number(v) * 100)}%`, 'Weight']}
                                />
                                <Bar dataKey="importance" radius={[0, 12, 12, 0]} barSize={24}>
                                    {featureImportance.map((_: unknown, i: number) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* ML vs Gemini Comparison */}
                <Card className="bg-white dark:bg-navy-900 border-navy-100/50 dark:border-navy-800 shadow-sm rounded-[2rem] overflow-hidden transition-all duration-500 hover:shadow-lg">
                    <CardHeader className="p-8 pb-4">
                        <CardTitle className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Model Performance Comparison</CardTitle>
                        <p className="text-xs font-bold text-slate-400 dark:text-navy-500 uppercase tracking-widest mt-1">Accuracy improvement with hybrid architecture</p>
                    </CardHeader>
                    <CardContent className="p-8 pt-4">
                        <ResponsiveContainer width="100%" height={240} minWidth={0}>
                            <BarChart data={comparison}>
                                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="currentColor" className="text-slate-100 dark:text-navy-800 transition-colors" />
                                <XAxis dataKey="metric" tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 700 }} className="text-slate-400 dark:text-navy-500 transition-colors font-bold uppercase" />
                                <YAxis stroke="currentColor" className="text-slate-400 dark:text-navy-500 transition-colors font-bold" tickFormatter={v => `${v}%`} domain={[0, 100]} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: 'none',
                                        borderRadius: '16px',
                                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                                        color: '#1e293b'
                                    }}
                                    itemStyle={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase' }}
                                    formatter={(v: unknown) => [`${v}%`]}
                                />
                                <Bar dataKey="ml" fill="#6366f1" radius={[8, 8, 0, 0]} name="Hybrid Architecture" barSize={30} />
                                <Bar dataKey="gemini" fill="#cbd5e1" radius={[8, 8, 0, 0]} name="Baseline Model" barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>

                        {/* ML vs fallback counts */}
                        <div className="mt-8 grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100/50 dark:border-emerald-500/20">
                                <span className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">
                                    <CheckCircle2 className="w-4 h-4" /> AI Validated Plans
                                </span>
                                <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">{generationStats.mlPlans}</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100/50 dark:border-amber-500/20">
                                <span className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2">
                                    <AlertTriangle className="w-4 h-4" /> Manual Fallbacks
                                </span>
                                <div className="text-3xl font-bold text-amber-700 dark:text-amber-300">{generationStats.fallbackPlans}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Model Info */}
            <Card className="bg-white dark:bg-navy-900 border-navy-100/50 dark:border-navy-800 shadow-sm rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:shadow-lg">
                <CardHeader className="p-10 pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-normal">Model Architecture</CardTitle>
                            <p className="text-xs font-bold text-slate-400 dark:text-navy-500 uppercase tracking-widest mt-1 transition-colors">Current production deployment specifications</p>
                        </div>
                        <Badge className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-navy-800 font-bold text-xs uppercase py-1 px-3 rounded-xl shadow-none">Active Production</Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-10 pt-6">
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            ['System Version', modelInfo.version],
                            ['Architecture', modelInfo.algorithm],
                            ['Training Dataset', `${modelInfo.samples.toLocaleString()} samples`],
                            ['Last Deployment', new Date(modelInfo.trainedAt).toLocaleDateString()],
                            ['Validation RMSE', modelInfo.metrics.rmse.toFixed(4)],
                            ['Confidence Score', (modelInfo.metrics.r2 * 100).toFixed(1) + '%'],
                        ].map(([label, value]) => (
                            <div key={label as string} className="p-5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800/50 transition-colors">
                                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400 dark:text-navy-500 font-black mb-2">{label}</div>
                                <div className="text-lg font-bold text-slate-900 dark:text-white">{value}</div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
