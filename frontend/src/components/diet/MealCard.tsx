import { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, Coins } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import type { Meal } from '@/lib/api/dietPlanApi';

interface MealCardProps {
    meal: Meal;
}

export function MealCard({ meal }: MealCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Support both old (flat macros) and new (nested macros) format
    const protein = meal.macros?.protein ?? meal.protein ?? 0;
    const carbs = meal.macros?.carbs ?? meal.carbs ?? 0;
    const fats = meal.macros?.fats ?? meal.fats ?? 0;
    const fiber = meal.macros?.fiber ?? 0;

    // Support both old (ingredients[]) and new (items[]) format
    const hasItems = meal.items && meal.items.length > 0;
    const hasIngredients = meal.ingredients && meal.ingredients.length > 0;

    return (
        <Card className="border-border hover:border-primary-500/50 transition-all">
            <CardContent className="p-6">
                <div className="space-y-4">
                    {/* Meal Header */}
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-lg font-semibold text-foreground mb-1">{meal.name}</h3>
                            {meal.description && (
                                <p className="text-sm text-muted-foreground mb-2">{meal.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                {(meal.prepTime || meal.cookTime) && (
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {(meal.prepTime || 0) + (meal.cookTime || 0)} min
                                    </span>
                                )}
                                {meal.estimatedCost && (
                                    <span className="flex items-center gap-1">
                                        <Coins className="w-4 h-4" />
                                        {meal.estimatedCost.currency} {meal.estimatedCost.amount?.toFixed(0)}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-primary-500">{meal.calories}</div>
                            <div className="text-xs text-muted-foreground">calories</div>
                        </div>
                    </div>

                    {/* Macros */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-card rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-blue-500">{typeof protein === 'number' ? protein.toFixed(0) : protein}g</div>
                            <div className="text-xs text-muted-foreground">Protein</div>
                        </div>
                        <div className="bg-card rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-orange-500">{typeof carbs === 'number' ? carbs.toFixed(0) : carbs}g</div>
                            <div className="text-xs text-muted-foreground">Carbs</div>
                        </div>
                        <div className="bg-card rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-yellow-500">{typeof fats === 'number' ? fats.toFixed(0) : fats}g</div>
                            <div className="text-xs text-muted-foreground">Fats</div>
                        </div>
                    </div>

                    {/* Expandable Section */}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-full flex items-center justify-between text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <span>{isExpanded ? 'Hide' : 'Show'} Details</span>
                        {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                        ) : (
                            <ChevronDown className="w-4 h-4" />
                        )}
                    </button>

                    {isExpanded && (
                        <div className="space-y-4 pt-4 border-t border-border">

                            {/* Food Items (new ML format) */}
                            {hasItems && (
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">Ingredients</h4>
                                    <ul className="space-y-1">
                                        {meal.items.map((item, index) => (
                                            <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                                <span className="text-primary-500 mt-1">•</span>
                                                <span>{item.food} — {item.quantity}{item.unit}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Legacy ingredients */}
                            {!hasItems && hasIngredients && (
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">Ingredients</h4>
                                    <ul className="space-y-1">
                                        {meal.ingredients!.map((ingredient, index) => (
                                            <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                                <span className="text-primary-500 mt-1">•</span>
                                                <span>{ingredient}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Instructions */}
                            {meal.instructions && meal.instructions.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">Instructions</h4>
                                    <ol className="space-y-2">
                                        {meal.instructions.map((instruction, index) => (
                                            <li key={index} className="text-sm text-muted-foreground flex gap-3">
                                                <span className="font-semibold text-primary-500 min-w-[20px]">
                                                    {index + 1}.
                                                </span>
                                                <span>{instruction}</span>
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            )}

                            {/* Extra nutrition info */}
                            {fiber > 0 && (
                                <div className="text-sm text-muted-foreground">
                                    Fiber: {fiber.toFixed(1)}g
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
