import { useState } from 'react';
import {
    Brain, TrendingUp, Scale, ShoppingCart, BarChart3,
    CheckCircle2, AlertTriangle, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// ── Mock analytics data (in production, fetched from /api/ml/analytics) ──
const modelMetrics = {
    rmse: 0.029,
    r2: 0.963,
    budgetComplianceRate: 94.2,
    macroAccuracyRate: 91.8,
    avgConfidence: 0.87,
    plansGenerated: 142,
    mlSuccessRate: 90.1,
};

const biasResults = [
    { dimension: 'Dietary Preference', group: 'Vegetarian vs Omnivore', confidenceDiff: 1.3, status: 'ok', detail: 'Avg confidence: 0.86 vs 0.88 — within acceptable range' },
    { dimension: 'Dietary Preference', group: 'Vegan vs Omnivore', confidenceDiff: 2.1, status: 'ok', detail: 'Avg confidence: 0.85 vs 0.88 — slightly lower due to smaller food pool' },
    { dimension: 'Budget Range', group: 'Low (<3K LKR) vs High (>8K LKR)', confidenceDiff: 4.2, status: 'warning', detail: 'Lower-budget users get slightly lower variety scores — expected given fewer food options' },
    { dimension: 'Gender', group: 'Male vs Female', confidenceDiff: 0.8, status: 'ok', detail: 'No significant difference detected (0.87 vs 0.88)' },
    { dimension: 'Age Group', group: 'Under 25 vs Over 40', confidenceDiff: 1.5, status: 'ok', detail: 'No meaningful difference in recommendation quality' },
];

const priceAnalytics = [
    { food: 'Chicken Breast', store: 'Arpico', avgPrice: 1290, trend: +8.5, budgetBreaches: 3 },
    { food: 'Rice (1kg)', store: 'Sathosa', avgPrice: 190, trend: +2.1, budgetBreaches: 0 },
    { food: 'Red Lentils', store: 'Sathosa', avgPrice: 490, trend: -3.2, budgetBreaches: 0 },
    { food: 'Spinach', store: 'Keells', avgPrice: 240, trend: +12.4, budgetBreaches: 5 },
    { food: 'Yogurt', store: 'Keells', avgPrice: 380, trend: +1.8, budgetBreaches: 1 },
    { food: 'Sweet Potato', store: 'Sathosa', avgPrice: 260, trend: -5.1, budgetBreaches: 0 },
    { food: 'Coconut Oil', store: 'Arpico', avgPrice: 780, trend: +6.3, budgetBreaches: 2 },
];

const storeComparison = [
    { store: 'Sathosa', avgSavings: 18.4, cheapestItems: 8, rating: 'Best Value' },
    { store: 'Keells', avgSavings: 6.2, cheapestItems: 5, rating: 'Good' },
    { store: 'Cargills', avgSavings: 3.1, cheapestItems: 4, rating: 'Average' },
    { store: 'Arpico', avgSavings: 1.8, cheapestItems: 3, rating: 'Premium' },
];

const lossHistory = [
    { epoch: 10, trainLoss: 0.42, valLoss: 0.44 },
    { epoch: 20, trainLoss: 0.28, valLoss: 0.31 },
    { epoch: 30, trainLoss: 0.18, valLoss: 0.22 },
    { epoch: 40, trainLoss: 0.12, valLoss: 0.16 },
    { epoch: 50, trainLoss: 0.08, valLoss: 0.11 },
    { epoch: 60, trainLoss: 0.055, valLoss: 0.082 },
    { epoch: 70, trainLoss: 0.040, valLoss: 0.065 },
    { epoch: 80, trainLoss: 0.033, valLoss: 0.052 },
    { epoch: 90, trainLoss: 0.029, valLoss: 0.044 },
    { epoch: 100, trainLoss: 0.029, valLoss: 0.041 },
];

export function AnalyticsDashboard() {
    const [activeTab, setActiveTab] = useState<'evaluation' | 'bias' | 'prices'>('evaluation');

    const maxLoss = Math.max(...lossHistory.map(h => h.valLoss));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">Analytics & Evaluation</h1>
                <p className="text-gray-400 mt-1">Model performance, bias detection, and price analytics</p>
            </div>

            {/* Top KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                    { label: 'R² Score', value: modelMetrics.r2, color: 'text-purple-400', icon: Brain },
                    { label: 'RMSE', value: modelMetrics.rmse, color: 'text-blue-400', icon: BarChart3 },
                    { label: 'Budget OK', value: `${modelMetrics.budgetComplianceRate}%`, color: 'text-green-400', icon: ShoppingCart },
                    { label: 'Macro Acc.', value: `${modelMetrics.macroAccuracyRate}%`, color: 'text-orange-400', icon: Scale },
                    { label: 'Avg Conf.', value: `${Math.round(modelMetrics.avgConfidence * 100)}%`, color: 'text-cyan-400', icon: TrendingUp },
                    { label: 'ML Success', value: `${modelMetrics.mlSuccessRate}%`, color: 'text-yellow-400', icon: CheckCircle2 },
                ].map(({ label, value, color, icon: Icon }) => (
                    <Card key={label} className="border-dark-700">
                        <CardContent className="p-4">
                            <Icon className={`w-4 h-4 mb-2 ${color}`} />
                            <div className={`text-xl font-bold ${color}`}>{value}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 border-b border-dark-700 pb-1">
                {(['evaluation', 'bias', 'prices'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-medium rounded-t-lg capitalize transition-colors ${activeTab === tab
                                ? 'bg-dark-800 text-white border-b-2 border-purple-500'
                                : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        {tab === 'evaluation' ? '📊 Model Evaluation' : tab === 'bias' ? '⚖️ Bias Detection' : '📈 Price Analytics'}
                    </button>
                ))}
            </div>

            {/* ── Tab: Model Evaluation ─────────────────────────────── */}
            {activeTab === 'evaluation' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Training Loss Curve */}
                    <Card className="border-dark-700">
                        <CardHeader>
                            <CardTitle className="text-white text-base">Training Loss Curve</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {lossHistory.map(h => (
                                    <div key={h.epoch} className="flex items-center gap-2 text-xs">
                                        <span className="text-gray-500 w-14">Ep {h.epoch}</span>
                                        <div className="flex-1 flex gap-1 items-center">
                                            <div className="flex-1 h-2 bg-dark-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-purple-500 rounded-full"
                                                    style={{ width: `${(h.trainLoss / maxLoss) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-purple-400 w-10 text-right">{h.trainLoss}</span>
                                        </div>
                                        <div className="flex-1 flex gap-1 items-center">
                                            <div className="flex-1 h-2 bg-dark-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-pink-500 rounded-full"
                                                    style={{ width: `${(h.valLoss / maxLoss) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-pink-400 w-10 text-right">{h.valLoss}</span>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex gap-4 text-xs text-gray-400 mt-2">
                                    <span className="flex items-center gap-1"><span className="w-3 h-2 bg-purple-500 rounded inline-block" /> Train Loss</span>
                                    <span className="flex items-center gap-1"><span className="w-3 h-2 bg-pink-500 rounded inline-block" /> Val Loss</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* ML vs Gemini-only comparison */}
                    <Card className="border-dark-700">
                        <CardHeader>
                            <CardTitle className="text-white text-base">ML Model vs Gemini-Only Accuracy</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-5">
                                {[
                                    { metric: 'Budget Compliance', ml: 94.2, gemini: 71.5 },
                                    { metric: 'Macro Accuracy', ml: 91.8, gemini: 68.3 },
                                    { metric: 'Avg Confidence', ml: 87.0, gemini: 62.0 },
                                    { metric: 'Dietary Adherence', ml: 98.6, gemini: 88.1 },
                                ].map(({ metric, ml, gemini }) => (
                                    <div key={metric}>
                                        <div className="flex justify-between text-sm text-gray-300 mb-1">
                                            <span>{metric}</span>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-purple-400 w-14">ML</span>
                                                <div className="flex-1 h-2 bg-dark-700 rounded-full overflow-hidden">
                                                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${ml}%` }} />
                                                </div>
                                                <span className="text-xs font-bold text-purple-400 w-12 text-right">{ml}%</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-500 w-14">Gemini</span>
                                                <div className="flex-1 h-2 bg-dark-700 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gray-600 rounded-full" style={{ width: `${gemini}%` }} />
                                                </div>
                                                <span className="text-xs text-gray-400 w-12 text-right">{gemini}%</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* ── Tab: Bias Detection ───────────────────────────────── */}
            {activeTab === 'bias' && (
                <Card className="border-dark-700">
                    <CardHeader>
                        <CardTitle className="text-white">Bias Analysis Results</CardTitle>
                        <p className="text-sm text-gray-400 mt-1">
                            Confidence score differences between demographic groups. Differences &lt;3% are considered acceptable.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {biasResults.map((result, i) => (
                                <div key={i} className="p-4 rounded-lg border border-dark-700 hover:bg-dark-800/40 transition-colors">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-medium px-2 py-0.5 bg-dark-700 rounded text-gray-400">
                                                    {result.dimension}
                                                </span>
                                                {result.status === 'warning' ? (
                                                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                                                ) : (
                                                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                                                )}
                                            </div>
                                            <p className="text-white font-medium text-sm">{result.group}</p>
                                            <p className="text-gray-400 text-sm mt-1">{result.detail}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-2xl font-bold ${result.status === 'warning' ? 'text-yellow-400' : 'text-green-400'}`}>
                                                {result.confidenceDiff}%
                                            </div>
                                            <div className="text-xs text-gray-500">difference</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-sm text-blue-300">
                            📋 Full analysis: <code className="text-blue-200">ml-service/notebooks/bias_analysis.py</code>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* ── Tab: Price Analytics ──────────────────────────────── */}
            {activeTab === 'prices' && (
                <div className="space-y-6">
                    {/* Price Trends Table */}
                    <Card className="border-dark-700">
                        <CardHeader>
                            <CardTitle className="text-white">Price Trends (Last 30 Days)</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-dark-700">
                                        <th className="text-left text-xs text-gray-400 uppercase p-4">Food</th>
                                        <th className="text-left text-xs text-gray-400 uppercase p-4">Cheapest Store</th>
                                        <th className="text-right text-xs text-gray-400 uppercase p-4">Avg Price</th>
                                        <th className="text-right text-xs text-gray-400 uppercase p-4">30-Day Change</th>
                                        <th className="text-right text-xs text-gray-400 uppercase p-4">Budget Breaches</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {priceAnalytics.map(item => (
                                        <tr key={item.food} className="border-b border-dark-800 hover:bg-dark-800/40 transition-colors">
                                            <td className="p-4 text-white font-medium">{item.food}</td>
                                            <td className="p-4">
                                                <span className="text-xs px-2 py-1 bg-dark-700 text-gray-300 rounded">{item.store}</span>
                                            </td>
                                            <td className="p-4 text-right text-gray-300">LKR {item.avgPrice}</td>
                                            <td className="p-4 text-right">
                                                <span className={`flex items-center justify-end gap-1 font-medium ${item.trend > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                                    {item.trend > 0
                                                        ? <ArrowUpRight className="w-3 h-3" />
                                                        : <ArrowDownRight className="w-3 h-3" />
                                                    }
                                                    {Math.abs(item.trend)}%
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <span className={`font-bold ${item.budgetBreaches > 0 ? 'text-yellow-400' : 'text-gray-500'}`}>
                                                    {item.budgetBreaches}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>

                    {/* Store Comparison */}
                    <Card className="border-dark-700">
                        <CardHeader>
                            <CardTitle className="text-white">Store Comparison — Best Value Rankings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                {storeComparison.map((store, i) => (
                                    <div key={store.store} className={`p-4 rounded-lg border ${i === 0 ? 'border-green-500/50 bg-green-500/10' : 'border-dark-700'}`}>
                                        <div className={`text-lg font-bold ${i === 0 ? 'text-green-400' : 'text-white'}`}>
                                            {i === 0 ? '🏆 ' : `${i + 1}. `}{store.store}
                                        </div>
                                        <div className={`text-xs mt-1 ${i === 0 ? 'text-green-500' : 'text-gray-500'}`}>{store.rating}</div>
                                        <div className="mt-3 space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Avg savings</span>
                                                <span className={i === 0 ? 'text-green-400 font-bold' : 'text-gray-300'}>{store.avgSavings}%</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Cheapest items</span>
                                                <span className="text-gray-300">{store.cheapestItems}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
