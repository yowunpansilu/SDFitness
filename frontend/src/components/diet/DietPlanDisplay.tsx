import { useState } from 'react';
import { Download, Save, Share2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { MealCard } from './MealCard';
import { ShoppingList } from './ShoppingList';
import type { DietPlan } from '@/lib/api/dietPlanApi';

interface DietPlanDisplayProps {
    plan: DietPlan;
    onSave?: () => void;
}

export function DietPlanDisplay({ plan, onSave }: DietPlanDisplayProps) {
    const [shoppingList, setShoppingList] = useState(plan.shoppingList);

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

    const dayLabels: Record<typeof days[number], string> = {
        monday: 'Monday',
        tuesday: 'Tuesday',
        wednesday: 'Wednesday',
        thursday: 'Thursday',
        friday: 'Friday',
        saturday: 'Saturday',
        sunday: 'Sunday',
    };

    const toggleShoppingItem = (itemId: string) => {
        setShoppingList(prev =>
            prev.map(item =>
                item.id === itemId ? { ...item, checked: !item.checked } : item
            )
        );
    };

    const handleExportPDF = () => {
        // Mock PDF export
        alert('PDF export functionality would be implemented here');
    };

    const handleShare = () => {
        // Mock share functionality
        alert('Share functionality would be implemented here');
    };

    return (
        <div className="space-y-6">
            {/* Header with Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-headline font-bold text-white">{plan.name}</h1>
                    <p className="text-gray-400 mt-1">
                        Generated on {plan.createdAt.toLocaleDateString()}
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

            {/* Weekly Plan Tabs */}
            <Tabs defaultValue="monday" className="w-full">
                <TabsList className="w-full justify-start overflow-x-auto">
                    {days.map((day) => (
                        <TabsTrigger key={day} value={day}>
                            {dayLabels[day]}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {days.map((day) => {
                    const dayPlan = plan.weeklyPlan[day];
                    return (
                        <TabsContent key={day} value={day} className="space-y-6">
                            {/* Daily Macros Summary */}
                            <Card className="border-dark-700">
                                <CardHeader>
                                    <CardTitle className="text-white">Daily Totals</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-primary-500">
                                                {dayPlan.totalMacros.calories}
                                            </div>
                                            <div className="text-sm text-gray-500">Calories</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-blue-500">
                                                {dayPlan.totalMacros.protein}g
                                            </div>
                                            <div className="text-sm text-gray-500">Protein</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-orange-500">
                                                {dayPlan.totalMacros.carbs}g
                                            </div>
                                            <div className="text-sm text-gray-500">Carbs</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-yellow-500">
                                                {dayPlan.totalMacros.fats}g
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
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-400 mb-2">BREAKFAST</h3>
                                        <MealCard meal={dayPlan.breakfast} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-400 mb-2">LUNCH</h3>
                                        <MealCard meal={dayPlan.lunch} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-400 mb-2">DINNER</h3>
                                        <MealCard meal={dayPlan.dinner} />
                                    </div>
                                    {dayPlan.snacks.map((snack, index) => (
                                        <div key={snack.id}>
                                            <h3 className="text-sm font-medium text-gray-400 mb-2">
                                                SNACK {index + 1}
                                            </h3>
                                            <MealCard meal={snack} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </TabsContent>
                    );
                })}
            </Tabs>

            {/* Shopping List */}
            <ShoppingList items={shoppingList} onToggleItem={toggleShoppingItem} />
        </div>
    );
}
