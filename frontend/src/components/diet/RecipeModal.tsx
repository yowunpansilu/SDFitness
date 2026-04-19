import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from '../ui/dialog';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Clock, Flame, Utensils } from 'lucide-react';
import type { Meal } from '@/lib/api/dietPlanApi';

interface RecipeModalProps {
    meal: Meal | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function RecipeModal({ meal, open, onOpenChange }: RecipeModalProps) {
    if (!meal) return null;

    const protein = meal.macros?.protein ?? meal.protein ?? 0;
    const carbs = meal.macros?.carbs ?? meal.carbs ?? 0;
    const fats = meal.macros?.fats ?? meal.fats ?? 0;
    const calories = meal.calories ?? 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl p-0 overflow-y-auto max-h-[90vh] rounded-[2.5rem] border-none shadow-2xl">
                <DialogDescription className="sr-only">
                    Information and instructions for {meal.name}
                </DialogDescription>
                <div className="relative h-48 w-full">
                    <img
                        src={meal.image || 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=800&auto=format&fit=crop'}
                        alt={meal.name}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                    <div className="absolute bottom-6 left-8 right-8">
                        <Badge variant="secondary" className="mb-2 bg-primary-500 text-white border-none hover:bg-primary-600 transition-colors uppercase tracking-widest font-black text-[10px] px-3 py-1">
                            {meal.mealType?.replace('_', ' ') || 'Meal'}
                        </Badge>
                        <DialogTitle className="text-3xl font-black text-white leading-tight">
                            {meal.name}
                        </DialogTitle>
                    </div>
                </div>

                <div className="p-8">
                    <div className="flex flex-wrap gap-8 mb-8">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-primary-50 rounded-xl text-primary-600">
                                <Clock className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cook Time</p>
                                <p className="text-sm font-bold text-primary-900">{(meal.prepTime || 10) + (meal.cookTime || 15)} mins</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-primary-50 rounded-xl text-primary-600">
                                <Flame className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Calories</p>
                                <p className="text-sm font-bold text-primary-900">{calories} kcal</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-primary-50 rounded-xl text-primary-600">
                                <Utensils className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Macros (P/C/F)</p>
                                <p className="text-sm font-bold text-primary-900">{protein}g / {carbs}g / {fats}g</p>
                            </div>
                        </div>
                    </div>

                    <ScrollArea className="h-auto max-h-[500px] w-full">
                        <div className="space-y-8 px-4 md:px-0 pr-0 md:pr-6 pb-6">
                            {/* Preparation Guide */}
                            <div className="p-6 rounded-3xl bg-amber-50 border border-amber-100">
                                <h4 className="text-sm font-black text-amber-900 mb-3 uppercase tracking-widest flex items-center gap-2">
                                    <Utensils className="w-4 h-4" />
                                    Preparation Guide
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                                        <p className="text-sm text-amber-900/80 font-medium">
                                            Wash all vegetables and fresh herbs thoroughly before starting.
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                                        <p className="text-sm text-amber-900/80 font-medium">
                                            Prepare all ingredients (chopping, measuring) to ensure a smooth cooking flow.
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                                        <p className="text-sm text-amber-900/80 font-medium">
                                            Check if you have all "Pantry & Spices" items listed below.
                                        </p>
                                    </div>
                                    {meal.prepTime && (
                                        <div className="flex items-start gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                                            <p className="text-sm text-amber-900/80 font-medium">
                                                Estimated active preparation time: {meal.prepTime} minutes.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Ingredients */}
                            <div>
                                <h4 className="text-lg font-black text-primary-900 mb-4 flex items-center gap-2">
                                    Ingredients
                                    <span className="w-2 h-2 rounded-full bg-primary-500" />
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {(meal.items || meal.ingredients || []).map((ingredient: any, idx) => (
                                        <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-secondary-50 border border-secondary-100 group hover:border-primary-100 hover:bg-white transition-all">
                                            <div className="w-6 h-6 rounded-lg bg-white border border-secondary-200 flex items-center justify-center text-[10px] font-bold text-secondary-400 group-hover:border-primary-200 group-hover:text-primary-500 transition-colors">
                                                {idx + 1}
                                            </div>
                                            <span className="text-sm font-medium text-secondary-700">
                                                {typeof ingredient === 'string' ? ingredient : `${ingredient.food || ingredient.name}: ${ingredient.quantity}${ingredient.unit || ''}`}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Essential Ingredients (Pantry) */}
                            {meal.essentialIngredients && meal.essentialIngredients.length > 0 && (
                                <div>
                                    <h4 className="text-lg font-black text-orange-600 mb-4 flex items-center gap-2">
                                        Pantry & Spices Needed
                                        <span className="w-2 h-2 rounded-full bg-orange-500" />
                                    </h4>
                                    <div className="grid grid-cols-1 gap-3 p-5 rounded-3xl bg-orange-50/70 border border-orange-100/50">
                                        {meal.essentialIngredients.map((ingredient: string, idx) => (
                                            <div key={idx} className="flex items-center gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                                                <span className="text-sm font-bold text-orange-900/80">
                                                    {ingredient}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Instructions */}
                            <div>
                                <h4 className="text-lg font-black text-primary-900 mb-4 flex items-center gap-2">
                                    Instructions
                                    <span className="w-2 h-2 rounded-full bg-primary-500" />
                                </h4>
                                <div className="space-y-4">
                                    {(() => {
                                        const rawInstructions = meal.instructions || [];
                                        const instructions = rawInstructions.length === 1 && (rawInstructions[0].includes('\n') || /\d+\.\s/.test(rawInstructions[0]))
                                            ? rawInstructions[0].split(/\n|\d+\.\s+/).filter(s => s.trim().length > 0)
                                            : rawInstructions;

                                        return instructions.length > 0 ? (
                                            instructions.map((step, idx) => (
                                                <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-white border border-secondary-100 shadow-sm">
                                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-black shadow-lg shadow-primary-500/20">
                                                        {idx + 1}
                                                    </div>
                                                    <p className="text-sm text-secondary-800 leading-relaxed font-medium pt-1">
                                                        {step.replace(/^Step\s*\d+[:.]?\s*/i, '').trim()}
                                                    </p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-6 rounded-2xl border-2 border-dashed border-secondary-100 flex flex-col items-center justify-center text-center">
                                                <Utensils className="w-8 h-8 text-secondary-200 mb-2" />
                                                <p className="text-xs font-bold text-secondary-400 uppercase tracking-widest">No detailed instructions available</p>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>

                            {/* Description/Tips */}
                            {meal.description && (
                                <div className="p-6 rounded-3xl bg-primary-50/50 border border-primary-100">
                                    <p className="text-sm italic text-primary-700 font-medium">
                                        " {meal.description} "
                                    </p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
}
