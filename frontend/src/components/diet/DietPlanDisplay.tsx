import { useState } from 'react';
import { Download, Save, Share2, Brain, TrendingUp, TrendingDown } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { MealCard } from './MealCard';
import { ShoppingList } from './ShoppingList';
import type { DietPlan, ShoppingListData, ShoppingItem } from '@/lib/api/dietPlanApi';

interface DietPlanDisplayProps {
    plan: DietPlan;
    onSave?: () => void;
}

export function DietPlanDisplay({ plan, onSave }: DietPlanDisplayProps) {
    // Normalize shopping list to support both old and new formats
    const rawShoppingList = plan.shoppingList;
    const isNewFormat = rawShoppingList && 'items' in rawShoppingList && !Array.isArray(rawShoppingList);
    const shoppingData = isNewFormat ? rawShoppingList as ShoppingListData : null;
    const shoppingItems: ShoppingItem[] = isNewFormat
        ? (rawShoppingList as ShoppingListData).items.map((item, i) => ({ ...item, id: item.id || String(i), checked: item.checked ?? false }))
        : (rawShoppingList as ShoppingItem[]);

    const [items, setItems] = useState(shoppingItems);

    // Support both new `days` array and old `weeklyPlan` object
    const hasDays = plan.days && plan.days.length > 0;
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

    const toggleShoppingItem = (itemId: string) => {
        setItems(prev =>
            prev.map(item =>
                item.id === itemId ? { ...item, checked: !item.checked } : item
            )
        );
    };

    const handleExportPDF = () => {
        alert('PDF export functionality would be implemented here');
    };

    const handleShare = () => {
        alert('Share functionality would be implemented here');
    };

    const meta = plan.aiMetadata;

    return (
        <div className="space-y-6">
            {/* Header with Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-headline font-bold text-white">
                        {plan.planName || plan.name}
                    </h1>
                    <p className="text-gray-400 mt-1">
                        Generated on {new Date(plan.createdAt).toLocaleDateString()}
                    </p>
                </div>
                <div className="flex gap-2">
                    {onSave && (
                        <Button variant="gym" onClick={onSave} className="gap-2">
                            <Save className="w-4 h-4" />
                            Save Plan
                        </Button>
                    )}
                    <Button variant="outline" onClick={handleExportPDF} className="gap-2">
                        <Download className="w-4 h-4" />
                        Export PDF
                    </Button>
                    <Button variant="outline" onClick={handleShare} className="gap-2">
                        <Share2 className="w-4 h-4" />
                        Share
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
                                Model v{meta.mlModelVersion || '1.0'} • {meta.generationMethod === 'ml_plus_gemini' ? 'ML + Gemini' : 'Gemini Only'}
                            </div>
                            {meta.mlInferenceTimeMs && (
                                <div className="text-sm text-gray-500">
                                    ⚡ {meta.mlInferenceTimeMs}ms inference
                                </div>
                            )}
                            {plan.targetCalories && (
                                <div className="text-sm text-gray-500">
                                    🎯 {plan.targetCalories} cal/day target
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Budget Summary */}
            {shoppingData && (
                <Card className="border-dark-700">
                    <CardContent className="p-4">
                        <div className="flex flex-wrap items-center gap-6">
                            <div>
                                <span className="text-sm text-gray-400">Weekly Cost</span>
                                <div className="text-2xl font-bold text-white">
                                    {shoppingData.currency} {shoppingData.currentTotal?.toLocaleString()}
                                </div>
                            </div>
                            {shoppingData.priceChanged && (
                                <div className="flex items-center gap-1 text-yellow-500 text-sm">
                                    {shoppingData.currentTotal > shoppingData.totalAtGeneration
                                        ? <TrendingUp className="w-4 h-4" />
                                        : <TrendingDown className="w-4 h-4" />
                                    }
                                    Prices updated since generation
                                </div>
                            )}
                            {plan.budget && (
                                <div className="text-sm text-gray-500">
                                    Budget: {plan.budget.currency} {plan.budget.amount?.toLocaleString()} / {plan.budget.period}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Weekly Plan Tabs */}
            <Tabs defaultValue={hasDays ? '0' : 'monday'} className="w-full">
                <TabsList className="w-full justify-start overflow-x-auto">
                    {hasDays
                        ? plan.days.map((day, i) => (
                            <TabsTrigger key={i} value={String(i)}>
                                {day.dayName || dayNames[i]}
                            </TabsTrigger>
                        ))
                        : dayKeys.map(day => (
                            <TabsTrigger key={day} value={day}>
                                {day.charAt(0).toUpperCase() + day.slice(1)}
                            </TabsTrigger>
                        ))
                    }
                </TabsList>

                {hasDays
                    ? plan.days.map((day, i) => (
                        <TabsContent key={i} value={String(i)} className="space-y-6">
                            {/* Daily Totals */}
                            <Card className="border-dark-700">
                                <CardHeader>
                                    <CardTitle className="text-white">Daily Totals</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-primary-500">
                                                {day.totalCalories || day.meals?.reduce((s, m) => s + (m.calories || 0), 0) || 0}
                                            </div>
                                            <div className="text-sm text-gray-500">Calories</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-blue-500">
                                                {day.meals?.reduce((s, m) => s + (m.macros?.protein || m.protein || 0), 0).toFixed(0) || 0}g
                                            </div>
                                            <div className="text-sm text-gray-500">Protein</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-orange-500">
                                                {day.meals?.reduce((s, m) => s + (m.macros?.carbs || m.carbs || 0), 0).toFixed(0) || 0}g
                                            </div>
                                            <div className="text-sm text-gray-500">Carbs</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-yellow-500">
                                                {day.meals?.reduce((s, m) => s + (m.macros?.fats || m.fats || 0), 0).toFixed(0) || 0}g
                                            </div>
                                            <div className="text-sm text-gray-500">Fats</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Meals */}
                            <div className="space-y-4">
                                <h2 className="text-xl font-semibold text-white">Meals</h2>
                                <div className="grid gap-4 md:grid-cols-2">
                                    {day.meals?.map((meal, j) => (
                                        <div key={j}>
                                            <h3 className="text-sm font-medium text-gray-400 mb-2 uppercase">
                                                {meal.mealType?.replace('_', ' ') || meal.type}
                                            </h3>
                                            <MealCard meal={meal} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </TabsContent>
                    ))
                    : dayKeys.map(day => {
                        const dayPlan = plan.weeklyPlan?.[day];
                        if (!dayPlan) return null;
                        return (
                            <TabsContent key={day} value={day} className="space-y-6">
                                <Card className="border-dark-700">
                                    <CardHeader>
                                        <CardTitle className="text-white">Daily Totals</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="text-center">
                                                <div className="text-3xl font-bold text-primary-500">
                                                    {dayPlan.totalMacros?.calories}
                                                </div>
                                                <div className="text-sm text-gray-500">Calories</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-3xl font-bold text-blue-500">
                                                    {dayPlan.totalMacros?.protein}g
                                                </div>
                                                <div className="text-sm text-gray-500">Protein</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-3xl font-bold text-orange-500">
                                                    {dayPlan.totalMacros?.carbs}g
                                                </div>
                                                <div className="text-sm text-gray-500">Carbs</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-3xl font-bold text-yellow-500">
                                                    {dayPlan.totalMacros?.fats}g
                                                </div>
                                                <div className="text-sm text-gray-500">Fats</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <div className="space-y-4">
                                    <h2 className="text-xl font-semibold text-white">Meals</h2>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {dayPlan.breakfast && (
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-400 mb-2">BREAKFAST</h3>
                                                <MealCard meal={dayPlan.breakfast} />
                                            </div>
                                        )}
                                        {dayPlan.lunch && (
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-400 mb-2">LUNCH</h3>
                                                <MealCard meal={dayPlan.lunch} />
                                            </div>
                                        )}
                                        {dayPlan.dinner && (
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-400 mb-2">DINNER</h3>
                                                <MealCard meal={dayPlan.dinner} />
                                            </div>
                                        )}
                                        {dayPlan.snacks?.map((snack, index) => (
                                            <div key={snack.id}>
                                                <h3 className="text-sm font-medium text-gray-400 mb-2">SNACK {index + 1}</h3>
                                                <MealCard meal={snack} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </TabsContent>
                        );
                    })
                }
            </Tabs>

            {/* Shopping List */}
            <ShoppingList items={items} onToggleItem={toggleShoppingItem} priceData={shoppingData} />
        </div>
    );
}
