import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Droplet, Flame, ArrowLeft, Beef, Wheat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getDietPlan } from '@/lib/api/dietPlanApi';
import type { DietPlan, DayPlan, Meal } from '@/lib/api/dietPlanApi';

export function DailyPlan() {
    const { id, dayIndex } = useParams<{ id: string; dayIndex: string }>();
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

    if (isLoading) return <div className="text-white">Loading daily plan...</div>;
    if (!plan || !dayIndex) return <div className="text-white">Day not found.</div>;

    const day: DayPlan = plan.days[parseInt(dayIndex)];
    if (!day) return <div className="text-white">Invalid day index.</div>;

    // Helper macro cards
    const MacroCard = ({ icon: Icon, label, value, color }: any) => (
        <Card className="border-dark-700 bg-dark-800">
            <CardContent className="p-4 flex items-center gap-4">
                <div className={`p-3 rounded-lg bg-${color}-500/10`}>
                    <Icon className={`w-6 h-6 text-${color}-500`} />
                </div>
                <div>
                    <p className="text-sm text-gray-400">{label}</p>
                    <p className="text-xl font-bold text-white">{value}</p>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <Button variant="link" className="text-gray-400 p-0 mb-2" onClick={() => navigate(`/dashboard/diet-plans/${plan.id}`)}>
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Weekly Plan
                </Button>
                <h1 className="text-3xl font-headline font-bold text-white">
                    {day.dayName}
                </h1>
                <p className="text-gray-400 mt-1">
                    Meals for {day.dayName}
                </p>
            </div>

            {/* Daily Macros Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MacroCard icon={Flame} label="Calories" value={`${day.meals?.reduce((acc, m) => acc + (m.calories || 0), 0) || 0} kcal`} color="primary" />
                <MacroCard icon={Beef} label="Protein" value={`${day.meals?.reduce((acc, m) => acc + (m.macros?.protein || m.protein || 0), 0) || 0} g`} color="blue" />
                <MacroCard icon={Wheat} label="Carbs" value={`${day.meals?.reduce((acc, m) => acc + (m.macros?.carbs || m.carbs || 0), 0) || 0} g`} color="green" />
                <MacroCard icon={Droplet} label="Fats" value={`${day.meals?.reduce((acc, m) => acc + (m.macros?.fats || m.fats || 0), 0) || 0} g`} color="yellow" />
            </div>

            {/* Meals List */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white">Meals ({day.meals?.length || 0})</h2>
                {day.meals?.map((meal: Meal, idx: number) => (
                    <Card
                        key={idx}
                        className="border-dark-700 hover:border-primary-500/50 transition-all cursor-pointer bg-dark-800"
                        onClick={() => navigate(`/dashboard/diet-plans/${plan.id}/meal/${(meal as any)._id || meal.id}`)}
                    >
                        <CardContent className="p-4 sm:p-6 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-white mb-1">{meal.name}</h3>
                                <p className="text-sm text-gray-400 capitalize">{meal.mealType.replace('_', ' ')} • {meal.calories} kcal</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-500" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
