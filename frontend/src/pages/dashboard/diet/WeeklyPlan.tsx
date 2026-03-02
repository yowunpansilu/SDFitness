import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Brain, ShoppingCart, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getDietPlan } from '@/lib/api/dietPlanApi';
import type { DietPlan } from '@/lib/api/dietPlanApi';

export function WeeklyPlan() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [plan, setPlan] = useState<DietPlan | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            getDietPlan(id)
                .then(setPlan)
                .catch(console.error)
                .finally(() => setIsLoading(false));
        }
    }, [id]);

    if (isLoading) return <div className="text-white">Loading weekly plan...</div>;
    if (!plan) return <div className="text-white">Plan not found.</div>;

    const meta = plan.aiMetadata;
    const days = plan.days || [];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <Button variant="link" className="text-gray-400 p-0 mb-2" onClick={() => navigate('/dashboard/diet-plans')}>
                        ← Back to Diet Plans
                    </Button>
                    <h1 className="text-3xl font-headline font-bold text-white">
                        Weekly Outline: {plan.name}
                    </h1>
                    <p className="text-gray-400 mt-1">
                        7-Day {plan.goal} Plan • {plan.targetCalories} kcal/day
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="gym" onClick={() => navigate(`/dashboard/diet-plans/${plan.id}/grocery-list`)} className="gap-2">
                        <ShoppingCart className="w-4 h-4" />
                        View Grocery List
                    </Button>
                </div>
            </div>

            {/* AI Confidence Banner */}
            {meta && (
                <Card className="border-dark-700 bg-gradient-to-r from-primary-900/30 to-dark-800">
                    <CardContent className="p-4">
                        <div className="flex flex-wrap items-center gap-6">
                            <div className="flex items-center gap-2">
                                <Brain className="w-5 h-5 text-primary-500" />
                                <span className="text-sm text-gray-400">ML Confidence</span>
                                <span className="text-lg font-bold text-primary-500">
                                    {Math.round((meta.mlConfidenceScore || 0) * 100)}%
                                </span>
                            </div>
                            <div className="text-sm text-gray-500">
                                FitGenius AI Model v{meta.mlModelVersion || '1.0'}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Days Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {days.map((day, idx) => (
                    <Card
                        key={idx}
                        className="border-dark-700 hover:border-primary-500/50 transition-all cursor-pointer bg-dark-800"
                        onClick={() => navigate(`/dashboard/diet-plans/${plan.id}/day/${idx}`)}
                    >
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xl font-bold text-white">{day.dayName}</h3>
                                    <Calendar className="text-primary-500 w-5 h-5" />
                                </div>
                                <div className="flex justify-between text-sm text-gray-400 border-t border-dark-600 pt-3">
                                    <span>Meals: {day.meals?.length || 0}</span>
                                    <span>Cals: {day.meals?.reduce((acc, m) => acc + (m.calories || 0), 0)} kcal</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
