import { useState } from 'react';
import { Brain, Zap, TrendingUp, BarChart3, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Mock data — in production this would come from /api/ml/model-info & /api/ml/health
const modelInfo = {
    version: '1.0.0',
    trainedAt: '2026-02-21T10:00:00Z',
    algorithm: 'Gradient Boosting Regressor',
    samples: 10000,
    metrics: { r2: 0.963, rmse: 0.029 },
    avgInferenceMs: 22.7,
};

const featureImportance = [
    { feature: 'goal_alignment', importance: 0.28 },
    { feature: 'budget_fit', importance: 0.22 },
    { feature: 'protein_density', importance: 0.18 },
    { feature: 'calorie_density', importance: 0.12 },
    { feature: 'variety_score', importance: 0.08 },
    { feature: 'fiber_content', importance: 0.05 },
    { feature: 'price_per_gram', importance: 0.04 },
    { feature: 'bmi_factor', importance: 0.03 },
];

const generationStats = {
    totalPlans: 142,
    mlPlans: 128,
    fallbackPlans: 14,
    avgConfidence: 0.87,
    budgetCompliance: 94.2,
};

export function MLDashboard() {
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => setIsRefreshing(false), 1500);
    };

    const maxImportance = Math.max(...featureImportance.map(f => f.importance));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">ML Dashboard</h1>
                    <p className="text-gray-400 mt-1">Model performance, metrics, and generation analytics</p>
                </div>
                <Button variant="outline" onClick={handleRefresh} className="gap-2" disabled={isRefreshing}>
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-dark-700 bg-gradient-to-br from-purple-900/30 to-dark-800">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-500/20">
                                <Brain className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Model R² Score</p>
                                <p className="text-2xl font-bold text-white">{modelInfo.metrics.r2}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-dark-700 bg-gradient-to-br from-blue-900/30 to-dark-800">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/20">
                                <Zap className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Avg Inference</p>
                                <p className="text-2xl font-bold text-white">{modelInfo.avgInferenceMs}ms</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-dark-700 bg-gradient-to-br from-green-900/30 to-dark-800">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-500/20">
                                <TrendingUp className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Budget Compliance</p>
                                <p className="text-2xl font-bold text-white">{generationStats.budgetCompliance}%</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-dark-700 bg-gradient-to-br from-orange-900/30 to-dark-800">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-orange-500/20">
                                <BarChart3 className="w-5 h-5 text-orange-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Total Plans Generated</p>
                                <p className="text-2xl font-bold text-white">{generationStats.totalPlans}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Feature Importance */}
                <Card className="border-dark-700">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-purple-400" />
                            Feature Importance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {featureImportance.map(f => (
                                <div key={f.feature} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-300">{f.feature.replace(/_/g, ' ')}</span>
                                        <span className="text-gray-500">{(f.importance * 100).toFixed(0)}%</span>
                                    </div>
                                    <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                                            style={{ width: `${(f.importance / maxImportance) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Model Info & Generation Stats */}
                <div className="space-y-6">
                    <Card className="border-dark-700">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Brain className="w-5 h-5 text-purple-400" />
                                Model Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {[
                                    ['Version', modelInfo.version],
                                    ['Algorithm', modelInfo.algorithm],
                                    ['Training Samples', modelInfo.samples.toLocaleString()],
                                    ['Trained', new Date(modelInfo.trainedAt).toLocaleDateString()],
                                    ['RMSE', modelInfo.metrics.rmse.toFixed(4)],
                                    ['R² Score', modelInfo.metrics.r2.toFixed(3)],
                                ].map(([label, value]) => (
                                    <div key={label as string} className="flex justify-between items-center py-2 border-b border-dark-700 last:border-0">
                                        <span className="text-gray-400 text-sm">{label}</span>
                                        <span className="text-white font-medium text-sm">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-dark-700">
                        <CardHeader>
                            <CardTitle className="text-white text-base">ML vs Fallback Generation</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        <span className="text-sm text-gray-300">ML + Gemini</span>
                                    </div>
                                    <span className="text-lg font-bold text-green-400">{generationStats.mlPlans}</span>
                                </div>
                                <div className="h-3 bg-dark-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                                        style={{ width: `${(generationStats.mlPlans / generationStats.totalPlans) * 100}%` }}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                                        <span className="text-sm text-gray-300">Gemini Fallback</span>
                                    </div>
                                    <span className="text-lg font-bold text-yellow-400">{generationStats.fallbackPlans}</span>
                                </div>
                                <div className="text-xs text-gray-500 text-center">
                                    ML success rate: {((generationStats.mlPlans / generationStats.totalPlans) * 100).toFixed(1)}%
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
