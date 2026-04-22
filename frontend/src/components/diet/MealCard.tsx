import { useState } from 'react';
import { ChefHat, Clock, MoreHorizontal, ChevronDown, Sparkles } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import type { Meal } from '@/lib/api/dietPlanApi';

interface MealCardProps {
    meal: Meal;
    onMakeNow?: (meal: Meal) => void;
}

export function MealCard({ meal, onMakeNow }: MealCardProps) {
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

    const [isOpen, setIsOpen] = useState(false);
    return (
        <Card
            className="group relative border-border bg-white overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary-900/5 hover:border-primary-100"
        >
            <CardContent className="p-3 md:p-4 flex items-start md:items-center gap-4 md:gap-6">
                {/* Meal Image */}
                <div className="relative w-16 h-16 md:w-24 md:h-24 rounded-xl md:rounded-2xl overflow-hidden flex-shrink-0 shadow-lg shadow-black/10 mt-1 md:mt-0">
                    <img
                        src={getMealImage(meal.mealType || meal.type || '')}
                        alt={meal.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                </div>

                {/* Meal Content */}
                <div className="flex-1 space-y-2 md:space-y-3 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                            <h3 className="text-base md:text-lg font-bold text-primary-900 leading-tight group-hover:text-primary-600 transition-colors truncate">
                                {meal.name}
                            </h3>
                            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
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

                    {/* Macro Stats and Collapsible Essentials */}
                    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full space-y-2">
                        <div className="flex items-center gap-4 md:gap-6">
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

                        {meal.essentialIngredients && meal.essentialIngredients.length > 0 && (
                            <>
                                <CollapsibleContent className="pt-2">
                                    <div className="p-2.5 rounded-xl bg-orange-50/50 border border-orange-100/50">
                                        <div className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                            <Sparkles className="w-3 h-3" />
                                            Authentic Ingredients
                                        </div>
                                        <div className="text-xs text-orange-900/80 font-medium leading-relaxed leading-snug">
                                            {meal.essentialIngredients.join(' • ')}
                                        </div>
                                    </div>
                                </CollapsibleContent>
                                <CollapsibleTrigger asChild>
                                    <button className="text-[10px] font-bold text-primary-500 uppercase tracking-wider flex items-center gap-1 hover:text-primary-700 transition-colors mt-2">
                                        {isOpen ? 'Hide Spices' : 'View Spices'}
                                        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                </CollapsibleTrigger>
                            </>
                        )}
                    </Collapsible>
                </div>

                {/* Action Column */}
                <div className="flex flex-col gap-2 pt-1 md:pt-0">
                    <Button
                        size="sm"
                        variant="gym"
                        onClick={() => onMakeNow?.(meal)}
                        className="bg-primary-600 hover:bg-primary-700 text-white gap-1.5 text-[11px] md:text-xs font-bold rounded-xl h-9 md:h-10 shadow-lg shadow-primary-600/20 px-3 md:px-4"
                    >
                        <ChefHat className="w-3.5 h-3.5" />
                        Make Now
                    </Button>
                </div>
            </CardContent>

            {/* Subtle Progress Bar Placeholder at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-50 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="h-full bg-secondary-500 w-1/3 rounded-r-full" />
            </div>
        </Card>
    );
}

