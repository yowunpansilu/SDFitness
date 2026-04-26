import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, ChefHat, Flame, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getDietPlan } from '@/lib/api/dietPlanApi';
import type { DietPlan, Meal, MealItem } from '@/lib/api/dietPlanApi';

export function MealRecipe() {
    const { id, mealId } = useParams<{ id: string; mealId: string }>();
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

    if (isLoading) return <div className="text-white">Loading recipe...</div>;
    if (!plan || !mealId) return <div className="text-white">Recipe not found.</div>;

    // Find the meal across all days
    let meal: Meal | undefined;
    let dayIndex: number = -1;
    for (let i = 0; i < plan.days.length; i++) {
        const found = plan.days[i].meals?.find(m => (m as any)._id === mealId || m.id === mealId);
        if (found) {
            meal = found;
            dayIndex = i;
            break;
        }
    }

    if (!meal) return <div className="text-white">Meal not found in plan.</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <Button variant="link" className="text-gray-400 p-0 mb-2" onClick={() => navigate(`/dashboard/diet-plans/${plan.id}/day/${dayIndex}`)}>
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Daily Plan
                </Button>
                <h1 className="text-3xl font-headline font-bold text-white">
                    {meal.name}
                </h1>
                <p className="text-gray-400 mt-1 capitalize">
                    {meal.mealType.replace('_', ' ')}
                </p>
                {meal.description && (
                    <p className="text-gray-300 mt-4 leading-relaxed max-w-2xl text-lg">
                        {meal.description}
                    </p>
                )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-4">
                <Card className="border-dark-700 bg-dark-800">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <Flame className="w-6 h-6 text-primary-500 mb-2" />
                        <span className="text-2xl font-bold text-white">{meal.calories}</span>
                        <span className="text-xs text-gray-400 uppercase tracking-wider">Calories</span>
                    </CardContent>
                </Card>
                <Card className="border-dark-700 bg-dark-800">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <Scale className="w-6 h-6 text-blue-500 mb-2" />
                        <span className="text-2xl font-bold text-white">{meal.macros?.protein || meal.protein || '---'}g</span>
                        <span className="text-xs text-gray-400 uppercase tracking-wider">Protein</span>
                    </CardContent>
                </Card>
                <Card className="border-dark-700 bg-dark-800">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <Scale className="w-6 h-6 text-green-500 mb-2" />
                        <span className="text-2xl font-bold text-white">{meal.macros?.carbs || meal.carbs || '---'}g</span>
                        <span className="text-xs text-gray-400 uppercase tracking-wider">Carbs</span>
                    </CardContent>
                </Card>
                <Card className="border-dark-700 bg-dark-800">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <Scale className="w-6 h-6 text-yellow-500 mb-2" />
                        <span className="text-2xl font-bold text-white">{meal.macros?.fats || meal.fats || '---'}g</span>
                        <span className="text-xs text-gray-400 uppercase tracking-wider">Fats</span>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Area */}
            <div className="grid md:grid-cols-3 gap-8">
                {/* Left Column: Ingredients */}
                <div className="md:col-span-1 space-y-4">
                    <h2 className="text-xl font-bold text-white mb-4">Ingredients</h2>
                    <ul className="space-y-3">
                        {meal.items?.length > 0 ? meal.items.map((item: MealItem, idx: number) => (
                            <li key={idx} className="flex justify-between items-center p-3 bg-dark-800 rounded-lg border border-dark-700">
                                <span className="text-gray-200">{item.food}</span>
                                <span className="font-semibold text-primary-400">{item.quantity} {item.unit}</span>
                            </li>
                        )) : meal.ingredients && meal.ingredients.length > 0 ? meal.ingredients.map((ing, idx) => (
                            <li key={idx} className="flex justify-between items-center p-3 bg-dark-800 rounded-lg border border-dark-700">
                                <span className="text-gray-200">{ing}</span>
                            </li>
                        )) : <div className="text-gray-500 italic">No ingredients listed.</div>}
                    </ul>
                </div>

                {/* Right Column: Instructions */}
                <div className="md:col-span-2 space-y-6">
                    {(meal.prepTime || meal.cookTime) && (
                        <div className="flex gap-6 mb-6">
                            {meal.prepTime && (
                                <div className="flex items-center gap-2 text-gray-300">
                                    <ChefHat className="w-5 h-5 text-gray-500" />
                                    <span>Prep: {meal.prepTime} mins</span>
                                </div>
                            )}
                            {meal.cookTime && (
                                <div className="flex items-center gap-2 text-gray-300">
                                    <Clock className="w-5 h-5 text-gray-500" />
                                    <span>Cook: {meal.cookTime} mins</span>
                                </div>
                            )}
                        </div>
                    )}

                    <div>
                        <h2 className="text-xl font-bold text-white mb-4">Making Procedure</h2>
                        {meal.instructions && meal.instructions.length > 0 ? (
                            <div className="space-y-4">
                                {meal.instructions.map((step: string, idx: number) => (
                                    <div key={idx} className="flex gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-500/20 text-primary-500 flex items-center justify-center font-bold">
                                            {idx + 1}
                                        </div>
                                        <p className="text-gray-300 pt-1 leading-relaxed">{step}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-gray-500 italic p-6 bg-dark-800 rounded-lg border border-dark-700 text-center">
                                Detailed instructions are not available for this meal.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
