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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        ML Dashboard
                    </h1>
                    <p className="text-gray-400 mt-2">Model performance, metrics, and generation analytics</p>
                </div>
                <Button variant="outline" onClick={handleRefresh} className="gap-2 bg-dark-800/50 border-dark-700 text-white hover:bg-dark-700" disabled={isRefreshing}>
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'R² Score', value: modelInfo.metrics.r2, color: 'text-purple-400', bg: 'from-purple-500/20', icon: Brain },
                    { label: 'RMSE', value: modelInfo.metrics.rmse, color: 'text-blue-400', bg: 'from-blue-500/20', icon: Zap },
                    { label: 'Avg Inference', value: `${modelInfo.avgInferenceMs}ms`, color: 'text-cyan-400', bg: 'from-cyan-500/20', icon: Zap },
                    { label: 'ML Success Rate', value: `${((generationStats.mlPlans / generationStats.totalPlans) * 100).toFixed(1)}%`, color: 'text-green-400', bg: 'from-green-500/20', icon: TrendingUp },
                ].map(({ label, value, color, bg, icon: Icon }) => (
                    <Card key={label} className={`bg-dark-900/50 border-dark-800 backdrop-blur-sm bg-gradient-to-br ${bg} to-transparent`}>
                        <CardContent className="p-5">
                            <Icon className={`w-5 h-5 mb-2 ${color}`} />
                            <div className={`text-2xl font-bold ${color}`}>{value}</div>
                            <div className="text-xs text-gray-500 mt-1">{label}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Feature Importance */}
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-white">Feature Importance</CardTitle>
                        <p className="text-sm text-gray-400">GBM model feature weights</p>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={featureImportanceData} layout="vertical" margin={{ left: 20, right: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis type="number" stroke="#94a3b8" tickFormatter={v => `${v}%`} />
                                <YAxis type="category" dataKey="feature" stroke="#94a3b8" tick={{ fontSize: 11 }} width={110}
                                    tickFormatter={v => v.replace(/_/g, ' ')} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                                    formatter={(v: number | undefined) => [`${v ?? 0}%`, 'Importance']}
                                />
                                <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                                    {featureImportanceData.map((_, i) => (
                                        <Cell key={i} fill={`hsl(${270 + i * 10}, 70%, ${60 - i * 4}%)`} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* ML vs Gemini Comparison */}
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-white">ML vs Gemini-Only</CardTitle>
                        <p className="text-sm text-gray-400">Accuracy across key metrics</p>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={comparisonData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="metric" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                                <YAxis stroke="#94a3b8" tickFormatter={v => `${v}%`} domain={[50, 100]} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                                    formatter={(v: number | undefined) => [`${v ?? 0}%`]}
                                />
                                <Bar dataKey="ml" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="ML + Gemini" />
                                <Bar dataKey="gemini" fill="#475569" radius={[4, 4, 0, 0]} name="Gemini Only" />
                            </BarChart>
                        </ResponsiveContainer>

                        {/* ML vs fallback counts */}
                        <div className="mt-4 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2 text-gray-300">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" /> ML + Gemini plans
                                </span>
                                <span className="font-bold text-green-400">{generationStats.mlPlans}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2 text-gray-300">
                                    <AlertTriangle className="w-4 h-4 text-yellow-500" /> Gemini fallback plans
                                </span>
                                <span className="font-bold text-yellow-400">{generationStats.fallbackPlans}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Model Info */}
            <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-white">Model Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[
                            ['Version', modelInfo.version],
                            ['Algorithm', modelInfo.algorithm],
                            ['Training Samples', modelInfo.samples.toLocaleString()],
                            ['Trained On', new Date(modelInfo.trainedAt).toLocaleDateString()],
                            ['RMSE', modelInfo.metrics.rmse.toFixed(4)],
                            ['R² Score', modelInfo.metrics.r2.toFixed(3)],
                        ].map(([label, value]) => (
                            <div key={label as string} className="p-3 rounded-lg bg-dark-800/50 border border-dark-700">
                                <div className="text-xs text-gray-500 mb-1">{label}</div>
                                <div className="text-white font-medium">{value}</div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
