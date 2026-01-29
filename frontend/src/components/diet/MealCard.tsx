import { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, Users } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import type { Meal } from '@/lib/api/dietPlanApi';

interface MealCardProps {
    meal: Meal;
}

export function MealCard({ meal }: MealCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <Card className="border-dark-700 hover:border-primary-500/50 transition-all">
            <CardContent className="p-6">
                <div className="space-y-4">
                    {/* Meal Header */}
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-1">{meal.name}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {meal.prepTime} min
                                </span>
                                <span className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    {meal.servings} serving{meal.servings > 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-primary-500">{meal.calories}</div>
                            <div className="text-xs text-gray-500">calories</div>
                        </div>
                    </div>

                    {/* Macros */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-dark-800 rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-blue-500">{meal.protein}g</div>
                            <div className="text-xs text-gray-500">Protein</div>
                        </div>
                        <div className="bg-dark-800 rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-orange-500">{meal.carbs}g</div>
                            <div className="text-xs text-gray-500">Carbs</div>
                        </div>
                        <div className="bg-dark-800 rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-yellow-500">{meal.fats}g</div>
                            <div className="text-xs text-gray-500">Fats</div>
                        </div>
                    </div>

                    {/* Expandable Section */}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-full flex items-center justify-between text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        <span>{isExpanded ? 'Hide' : 'Show'} Recipe Details</span>
                        {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                        ) : (
                            <ChevronDown className="w-4 h-4" />
                        )}
                    </button>

                    {isExpanded && (
                        <div className="space-y-4 pt-4 border-t border-dark-700">
                            {/* Ingredients */}
                            <div>
                                <h4 className="font-semibold text-white mb-2">Ingredients</h4>
                                <ul className="space-y-1">
                                    {meal.ingredients.map((ingredient, index) => (
                                        <li key={index} className="text-sm text-gray-400 flex items-start gap-2">
                                            <span className="text-primary-500 mt-1">•</span>
                                            <span>{ingredient}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Instructions */}
                            <div>
                                <h4 className="font-semibold text-white mb-2">Instructions</h4>
                                <ol className="space-y-2">
                                    {meal.instructions.map((instruction, index) => (
                                        <li key={index} className="text-sm text-gray-400 flex gap-3">
                                            <span className="font-semibold text-primary-500 min-w-[20px]">
                                                {index + 1}.
                                            </span>
                                            <span>{instruction}</span>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
