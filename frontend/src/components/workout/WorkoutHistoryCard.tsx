import { useState } from 'react';
import { Calendar, Clock, Flame, Trophy, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import type { Workout } from '@/lib/api/workoutApi';
import { format } from 'date-fns';

interface WorkoutHistoryCardProps {
    workout: Workout;
}

export function WorkoutHistoryCard({ workout }: WorkoutHistoryCardProps) {
    const [isOpen, setIsOpen] = useState(false);

    const formatDate = (date: Date) => {
        return format(new Date(date), 'MMM dd, yyyy');
    };

    const getDifficultyColor = (difficulty?: string) => {
        switch (difficulty) {
            case 'too_easy':
                return 'bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400';
            case 'just_right':
                return 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400';
            case 'too_hard':
                return 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400';
            default:
                return 'bg-muted text-muted-foreground border-border';
        }
    };

    const getEnergyColor = (energy?: string) => {
        switch (energy) {
            case 'high':
                return 'bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400';
            case 'medium':
                return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20 dark:text-yellow-400';
            case 'low':
                return 'bg-orange-500/10 text-orange-600 border-orange-500/20 dark:text-orange-400';
            default:
                return 'bg-muted text-muted-foreground border-border';
        }
    };

    const completedSets = workout.exercises.reduce(
        (total, exercise) => total + exercise.sets.filter(set => set.completed).length,
        0
    );

    const totalSets = workout.exercises.reduce(
        (total, exercise) => total + exercise.sets.length,
        0
    );

    return (
        <Card className="transition-all hover:shadow-md border-border">
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-4 h-4 text-primary-800" />
                                <CardTitle className="text-lg font-bold text-foreground">
                                    {formatDate(new Date(workout.workoutDate))}
                                </CardTitle>
                                {workout.personalRecords && workout.personalRecords.length > 0 && (
                                    <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 dark:text-yellow-400">
                                        <Trophy className="w-3 h-3 mr-1" />
                                        {workout.personalRecords.length} PR{workout.personalRecords.length > 1 ? 's' : ''}
                                    </Badge>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4 text-primary-800" />
                                    <span>{workout.duration} min</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Flame className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                    <span>{workout.totalCaloriesBurned} cal</span>
                                </div>
                                <div className="text-muted-foreground">
                                    {completedSets}/{totalSets} sets completed
                                </div>
                            </div>

                            {(workout.difficulty || workout.energyLevel) && (
                                <div className="flex gap-2 mt-3">
                                    {workout.difficulty && (
                                        <Badge className={getDifficultyColor(workout.difficulty)}>
                                            {workout.difficulty.replace('_', ' ')}
                                        </Badge>
                                    )}
                                    {workout.energyLevel && (
                                        <Badge className={getEnergyColor(workout.energyLevel)}>
                                            {workout.energyLevel} energy
                                        </Badge>
                                    )}
                                </div>
                            )}
                        </div>

                        <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                                {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </Button>
                        </CollapsibleTrigger>
                    </div>
                </CardHeader>

                <CollapsibleContent>
                    <CardContent className="pt-0">
                        <div className="space-y-4">
                            {/* Exercises */}
                            <div>
                                <h4 className="text-sm font-semibold text-muted-foreground mb-3">Exercises</h4>
                                <div className="space-y-3">
                                    {workout.exercises.map((exercise, idx) => (
                                        <div key={idx} className="bg-muted/30 rounded-lg p-3 border border-border">
                                            <p className="font-semibold text-foreground mb-2">{exercise.name || `Exercise ${idx + 1}`}</p>
                                            <div className="grid grid-cols-4 gap-2 text-xs">
                                                {exercise.sets.map((set, setIdx) => (
                                                    <div
                                                        key={setIdx}
                                                        className={`p-2 rounded text-center ${set.completed
                                                            ? 'bg-primary/20 text-primary-800 dark:text-primary-300'
                                                            : 'bg-background text-muted-foreground'
                                                            }`}
                                                    >
                                                        <div className="font-semibold">Set {set.setNumber}</div>
                                                        {set.reps && <div>{set.reps} reps</div>}
                                                        {set.weight && <div>{set.weight} kg</div>}
                                                        {set.duration && <div>{set.duration}s</div>}
                                                    </div>
                                                ))}
                                            </div>
                                            {exercise.notes && (
                                                <p className="text-xs text-muted-foreground mt-2 italic">{exercise.notes}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Personal Records */}
                            {workout.personalRecords && workout.personalRecords.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                                        <Trophy className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                                        Personal Records
                                    </h4>
                                    <div className="space-y-2">
                                        {workout.personalRecords.map((pr, idx) => (
                                            <div key={idx} className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-yellow-600 dark:text-yellow-400 font-semibold">
                                                        {pr.exerciseName || 'Exercise'}
                                                    </span>
                                                    <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 dark:text-yellow-400">
                                                        {pr.recordType.replace('_', ' ')}
                                                    </Badge>
                                                </div>
                                                <p className="text-foreground text-lg font-bold mt-1">
                                                    {pr.value} {pr.recordType === 'max_weight' ? 'kg' : pr.recordType === 'longest_duration' ? 's' : 'reps'}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            {workout.notes && (
                                <div>
                                    <h4 className="text-sm font-semibold text-muted-foreground mb-2">Notes</h4>
                                    <p className="text-muted-foreground text-sm bg-card/50 rounded-lg p-3 border border-border">
                                        {workout.notes}
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
}
