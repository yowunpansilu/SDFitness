import { useState } from 'react';
import { Brain, Zap, TrendingUp, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const modelInfo = {
    version: '1.0.0',
    trainedAt: '2026-02-21T10:00:00Z',
    algorithm: 'Gradient Boosting Regressor',
    samples: 10000,
    metrics: { r2: 0.963, rmse: 0.029 },
    avgInferenceMs: 22.7,
};

const featureImportanceData = [
    { feature: 'goal_alignment', importance: 28 },
    { feature: 'budget_fit', importance: 22 },
    { feature: 'protein_density', importance: 18 },
    { feature: 'calorie_density', importance: 12 },
    { feature: 'variety_score', importance: 8 },
    { feature: 'fiber_content', importance: 5 },
    { feature: 'price_per_gram', importance: 4 },
    { feature: 'bmi_factor', importance: 3 },
];

const comparisonData = [
    { metric: 'Budget OK', ml: 94.2, gemini: 71.5 },
    { metric: 'Macro Acc.', ml: 91.8, gemini: 68.3 },
    { metric: 'Confidence', ml: 87.0, gemini: 62.0 },
    { metric: 'Diet Adhere.', ml: 98.6, gemini: 88.1 },
];

const generationStats = { totalPlans: 142, mlPlans: 128, fallbackPlans: 14 };

export function MLDashboard() {
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => setIsRefreshing(false), 1500);
    };

    return (
        <div className="space-y-10 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900">
                        ML <span className="text-indigo-600 italic font-medium">Dashboard</span>
                    </h1>
                    <p className="text-slate-700 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">
                        Model performance, metrics, and generation analytics
                    </p>
                </div>
                <Button 
                    variant="outline" 
                    onClick={handleRefresh} 
                    className="bg-white border-2 border-slate-300 text-slate-900 font-bold uppercase tracking-widest text-xs h-11 px-6 rounded-xl hover:bg-slate-50 hover:border-indigo-400 transition-all" 
                    disabled={isRefreshing}
                >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh Matrix
                </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { label: 'R² Score', value: modelInfo.metrics.r2, color: 'text-purple-600', bg: 'bg-purple-100', icon: Brain },
                    { label: 'RMSE', value: modelInfo.metrics.rmse, color: 'text-indigo-600', bg: 'bg-indigo-100', icon: Zap },
                    { label: 'Avg Inference', value: `${modelInfo.avgInferenceMs}ms`, color: 'text-cyan-600', bg: 'bg-cyan-100', icon: Zap },
                    { label: 'ML Success Rate', value: `${((generationStats.mlPlans / generationStats.totalPlans) * 100).toFixed(1)}%`, color: 'text-emerald-600', bg: 'bg-emerald-100', icon: TrendingUp },
                ].map(({ label, value, color, bg, icon: Icon }) => (
                    <Card key={label} className="bg-white border-2 border-slate-300 shadow-sm rounded-3xl overflow-hidden group transition-all duration-300 hover:shadow-xl hover:border-indigo-400/50">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-2xl ${bg} ${color} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-700 mt-1">{label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Feature Importance */}
                <Card className="bg-white border-2 border-slate-300 shadow-sm rounded-3xl overflow-hidden transition-colors">
                    <CardHeader className="border-b border-slate-200/50 pb-6">
                        <CardTitle className="text-slate-900 font-black text-xl">Feature Importance</CardTitle>
                        <p className="text-sm font-medium text-slate-700">GBM model feature weights</p>
                    </CardHeader>
                    <CardContent className="pt-8">
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={featureImportanceData} layout="vertical" margin={{ left: 20, right: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={true} vertical={false} />
                                <XAxis type="number" stroke="#64748b" tickFormatter={v => `${v}%`} tick={{fontSize: 12, fontWeight: 600}} axisLine={false} tickLine={false} />
                                <YAxis type="category" dataKey="feature" stroke="#64748b" tick={{ fontSize: 11, fontWeight: 700, fill: '#334155' }} width={120}
                                    tickFormatter={v => v.replace(/_/g, ' ').toUpperCase()} axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{fill: '#f1f5f9'}}
                                    contentStyle={{ 
                                        backgroundColor: '#ffffff', 
                                        border: '2px solid #e2e8f0', 
                                        borderRadius: '12px', 
                                        color: '#0f172a',
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                                    }}
                                    itemStyle={{ color: '#4f46e5', fontWeight: 700 }}
                                    formatter={(v: number | undefined) => [`${v ?? 0}%`, 'Importance']}
                                />
                                <Bar dataKey="importance" radius={[0, 6, 6, 0]}>
                                    {featureImportanceData.map((_, i) => (
                                        <Cell key={i} fill={`hsl(${250 + i * 5}, 80%, ${60}%)`} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* ML vs Gemini Comparison */}
                <Card className="bg-white border-2 border-slate-300 shadow-sm rounded-3xl overflow-hidden transition-colors">
                    <CardHeader className="border-b border-slate-200/50 pb-6">
                        <CardTitle className="text-slate-900 font-black text-xl">ML vs Gemini-Only</CardTitle>
                        <p className="text-sm font-medium text-slate-700">Accuracy across key metrics</p>
                    </CardHeader>
                    <CardContent className="pt-8">
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={comparisonData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                <XAxis dataKey="metric" stroke="#64748b" tick={{ fontSize: 10, fontWeight: 800, fill: '#334155' }} axisLine={false} tickLine={false} dy={10} />
                                <YAxis stroke="#64748b" tickFormatter={v => `${v}%`} domain={[50, 100]} tick={{fontSize: 12, fontWeight: 600}} axisLine={false} tickLine={false} dx={-10} />
                                <Tooltip
                                    cursor={{fill: '#f1f5f9'}}
                                    contentStyle={{ 
                                        backgroundColor: '#ffffff', 
                                        border: '2px solid #e2e8f0', 
                                        borderRadius: '12px', 
                                        color: '#0f172a',
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                                    }}
                                    itemStyle={{ fontWeight: 700 }}
                                />
                                <Bar dataKey="ml" fill="#4f46e5" radius={[6, 6, 0, 0]} name="ML + Gemini" />
                                <Bar dataKey="gemini" fill="#cbd5e1" radius={[6, 6, 0, 0]} name="Gemini Only" />
                            </BarChart>
                        </ResponsiveContainer>

                        {/* ML vs fallback counts */}
                        <div className="mt-6 flex flex-col gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-slate-700">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> ML + Gemini plans
                                </span>
                                <span className="font-black text-lg text-emerald-600">{generationStats.mlPlans}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-slate-700">
                                    <AlertTriangle className="w-4 h-4 text-amber-500" /> Gemini fallback plans
                                </span>
                                <span className="font-black text-lg text-amber-600">{generationStats.fallbackPlans}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Model Info */}
            <Card className="bg-white border-2 border-slate-300 shadow-sm rounded-3xl overflow-hidden transition-colors">
                <CardHeader className="border-b border-slate-200/50 pb-6">
                    <CardTitle className="text-slate-900 font-black text-xl">Model Information</CardTitle>
                    <p className="text-sm font-medium text-slate-700">Core parameters and training data</p>
                </CardHeader>
                <CardContent className="pt-8">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {[
                            ['Version', modelInfo.version],
                            ['Algorithm', modelInfo.algorithm],
                            ['Training Samples', modelInfo.samples.toLocaleString()],
                            ['Trained On', new Date(modelInfo.trainedAt).toLocaleDateString()],
                            ['RMSE', modelInfo.metrics.rmse.toFixed(4)],
                            ['R² Score', modelInfo.metrics.r2.toFixed(3)],
                        ].map(([label, value]) => (
                            <div key={label as string} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/50 transition-colors">
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2">{label}</div>
                                <div className="text-lg font-black text-slate-900 tracking-tight">{value}</div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
