import { ChefHat, Info, Clock, Loader2, RefreshCw, MoreHorizontal } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import type { Meal } from '@/lib/api/dietPlanApi';

interface MealCardProps {
    meal: Meal;
    onSwap?: (meal: Meal) => void;
    isSwapping?: boolean;
}

export function MealCard({ meal, onSwap, isSwapping }: MealCardProps) {
    // Support both old (flat macros) and new (nested macros) format
    const protein = meal.macros?.protein ?? meal.protein ?? 0;
    const carbs = meal.macros?.carbs ?? meal.carbs ?? 0;
    const fats = meal.macros?.fats ?? meal.fats ?? 0;

    // Default images based on meal type for better aesthetics
    const getMealImage = (type: string) => {
        const t = (type || 'dinner').toLowerCase();
        if (t.includes('breakfast')) return 'https://images.unsplash.com/photo-1484723088339-fe7838eb0d3d?q=80&w=200&h=200&auto=format&fit=crop';
        if (t.includes('lunch')) return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200&h=200&auto=format&fit=crop';
        if (t.includes('snack')) return 'https://images.unsplash.com/photo-1614735241165-6756e1df61ab?q=80&w=200&h=200&auto=format&fit=crop';
        return 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=200&h=200&auto=format&fit=crop'; // Dinner
    };

    return (
        <Card 
            className="group relative border-border bg-white overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary-900/5 hover:border-primary-100"
        >
            <CardContent className="p-4 flex items-center gap-6">
                {/* Meal Image */}
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg shadow-black/10">
                    <img 
                        src={getMealImage(meal.mealType || meal.type || '')} 
                        alt={meal.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>

                {/* Meal Content */}
                <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-lg font-bold text-primary-900 leading-tight group-hover:text-primary-600 transition-colors">
                                {meal.name}
                            </h3>
                            <div className="flex items-center gap-4 mt-1">
                                <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                    <Clock className="w-3.5 h-3.5" />
                                    {(meal.prepTime || 15) + (meal.cookTime || 10)} min
                                </span>
                                {meal.calories && (
                                    <span className="px-2 py-0.5 rounded-full bg-primary-50 text-[10px] uppercase font-bold text-primary-600">
                                        {meal.calories} kcal
                                    </span>
                                )}
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary-600">
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Macro Stats */}
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-primary-900">{protein}g</span>
                            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-tight">Protein</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-primary-900">{carbs}g</span>
                            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-tight">Carbs</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-primary-900">{fats}g</span>
                            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-tight">Fats</span>
                        </div>
                    </div>
                </div>

                {/* Action Column */}
                <div className="flex flex-col gap-2">
                    <Button 
                        size="sm"
                        variant="gym"
                        onClick={() => onSwap?.(meal)}
                        disabled={isSwapping}
                        className="bg-secondary-500 hover:bg-secondary-600 text-white gap-2 text-xs font-bold rounded-xl h-10 shadow-lg shadow-secondary-500/20 relative group/btn"
                    >
                        {isSwapping ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                        AI Swap
                        <span className="absolute -top-2 -right-1 px-1.5 py-0.5 bg-primary-900 text-[8px] text-white rounded-md scale-75 font-black uppercase tracking-tighter shadow-sm">Beta</span>
                    </Button>
                    <div className="flex justify-center gap-4">
                        <button title="View Recipe" className="text-muted-foreground hover:text-primary-600 transition-colors">
                            <ChefHat className="w-4 h-4" />
                        </button>
                        <button title="Nutrition Info" className="text-muted-foreground hover:text-primary-600 transition-colors">
                            <Info className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </CardContent>

            {/* Subtle Progress Bar Placeholder at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-50 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="h-full bg-secondary-500 w-1/3 rounded-r-full" />
            </div>
        </Card>
    );
}

