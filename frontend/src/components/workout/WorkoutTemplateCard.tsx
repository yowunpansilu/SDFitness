import { Clock, Flame, Dumbbell, Star, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { WorkoutTemplate } from '@/lib/api/workoutApi';

interface WorkoutTemplateCardProps {
    template: WorkoutTemplate;
    onStartWorkout: (template: WorkoutTemplate) => void;
}

export function WorkoutTemplateCard({ template, onStartWorkout }: WorkoutTemplateCardProps) {
    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'beginner':
                return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'intermediate':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'advanced':
                return 'bg-red-500/20 text-red-400 border-red-500/30';
            default:
                return 'bg-gray-500/20 text-muted-foreground border-gray-500/30';
        }
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            strength: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            cardio: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
            hiit: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
            endurance: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
            flexibility: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
            full_body: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
            upper_body: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
            lower_body: 'bg-lime-500/20 text-lime-400 border-lime-500/30',
            core: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        };
        return colors[category] || 'bg-gray-500/20 text-muted-foreground border-gray-500/30';
    };

    return (
        <Card className="glass-card border-border hover:border-primary-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/10 group">
            <CardHeader>
                <div className="flex items-start justify-between gap-2 mb-2">
                    <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary-800 transition-colors">
                        {template.name}
                    </CardTitle>
                    {template.rating && template.rating.count > 0 && (
                        <div className="flex items-center gap-1 text-yellow-400">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="text-sm font-semibold">{template.rating.average.toFixed(1)}</span>
                        </div>
                    )}
                </div>
                <div className="flex flex-wrap gap-2">
                    <Badge className={getDifficultyColor(template.difficulty)}>
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {template.difficulty}
                    </Badge>
                    <Badge className={getCategoryColor(template.category)}>
                        {template.category.replace('_', ' ')}
                    </Badge>
                </div>
                {template.description && (
                    <CardDescription className="text-muted-foreground mt-2 line-clamp-2">
                        {template.description}
                    </CardDescription>
                )}
            </CardHeader>

            <CardContent>
                <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4 text-primary-800" />
                        <div>
                            <p className="text-xs text-muted-foreground">Duration</p>
                            <p className="font-semibold">{template.duration} min</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Flame className="w-4 h-4 text-orange-400" />
                        <div>
                            <p className="text-xs text-muted-foreground">Calories</p>
                            <p className="font-semibold">~{template.estimatedCaloriesBurned}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Dumbbell className="w-4 h-4 text-secondary-400" />
                        <div>
                            <p className="text-xs text-muted-foreground">Exercises</p>
                            <p className="font-semibold">{template.exercises.length}</p>
                        </div>
                    </div>
                </div>
            </CardContent>

            <CardFooter>
                <Button
                    variant="gym"
                    className="w-full"
                    onClick={() => onStartWorkout(template)}
                >
                    Start Workout
                </Button>
            </CardFooter>
        </Card>
    );
}
