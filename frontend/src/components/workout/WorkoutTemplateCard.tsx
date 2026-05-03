import { Clock, Flame, Dumbbell, Star, TrendingUp, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import type { WorkoutTemplate } from '@/lib/api/workoutApi';

interface WorkoutTemplateCardProps {
    template: WorkoutTemplate;
    onStartWorkout: (template: WorkoutTemplate) => void;
    onRename?: (template: WorkoutTemplate) => void;
    onDelete?: (template: WorkoutTemplate) => void;
}

export function WorkoutTemplateCard({ template, onStartWorkout, onRename, onDelete }: WorkoutTemplateCardProps) {
    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'beginner':
                return 'bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400';
            case 'intermediate':
                return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20 dark:text-yellow-400';
            case 'advanced':
                return 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400';
            default:
                return 'bg-muted text-muted-foreground border-border';
        }
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            strength: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400',
            cardio: 'bg-orange-500/10 text-orange-600 border-orange-500/20 dark:text-orange-400',
            hiit: 'bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400',
            endurance: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20 dark:text-cyan-400',
            flexibility: 'bg-pink-500/10 text-pink-600 border-pink-500/20 dark:text-pink-400',
            full_body: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20 dark:text-indigo-400',
            upper_body: 'bg-teal-500/10 text-teal-600 border-teal-500/20 dark:text-teal-400',
            lower_body: 'bg-lime-500/10 text-lime-600 border-lime-500/20 dark:text-lime-400',
            core: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400',
        };
        return colors[category] || 'bg-muted text-muted-foreground border-border';
    };

    return (
        <Card className="transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30 group">
            <CardHeader className="relative">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors pr-8">
                        {template.name}
                    </CardTitle>

                    <div className="flex items-start gap-2">
                        {template.rating && template.rating.count > 0 && (
                            <div className="flex items-center gap-1 text-yellow-500 dark:text-yellow-400">
                                <Star className="w-4 h-4 fill-current" />
                                <span className="text-sm font-semibold">{template.rating.average.toFixed(1)}</span>
                            </div>
                        )}

                        {(onRename || onDelete) && (
                            <div className="absolute right-4 top-4">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        {onRename && (
                                            <DropdownMenuItem onClick={() => onRename(template)}>
                                                <Edit2 className="mr-2 h-4 w-4" />
                                                Rename Plan
                                            </DropdownMenuItem>
                                        )}
                                        {onDelete && (
                                            <DropdownMenuItem
                                                onClick={() => onDelete(template)}
                                                className="text-destructive focus:text-destructive"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete Plan
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className={getDifficultyColor(template.difficulty)}>
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {template.difficulty}
                    </Badge>
                    <Badge variant="secondary" className={getCategoryColor(template.category)}>
                        {template.category.replace('_', ' ')}
                    </Badge>
                </div>
                {template.description && (
                    <CardDescription className="line-clamp-2 mt-2">
                        {template.description}
                    </CardDescription>
                )}
            </CardHeader>

            <CardContent>
                <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <div>
                            <p className="text-xs text-muted-foreground">Duration</p>
                            <p className="font-semibold">{template.duration} min</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-orange-500 dark:text-orange-400" />
                        <div>
                            <p className="text-xs text-muted-foreground">Calories</p>
                            <p className="font-semibold">~{template.estimatedCaloriesBurned}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Dumbbell className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                        <div>
                            <p className="text-xs text-muted-foreground">Exercises</p>
                            <p className="font-semibold">{template.exercises.length}</p>
                        </div>
                    </div>
                </div>
            </CardContent>

            <CardFooter>
                <Button
                    className="w-full"
                    onClick={() => onStartWorkout(template)}
                >
                    Start Workout
                </Button>
            </CardFooter>
        </Card>
    );
}
