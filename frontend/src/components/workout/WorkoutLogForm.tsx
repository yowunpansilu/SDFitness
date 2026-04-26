import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, Timer } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExerciseSetInput } from './ExerciseSetInput';
import type { WorkoutTemplate, Exercise, ExerciseSet } from '@/lib/api/workoutApi';
import { useToast } from '@/hooks/use-toast';

interface WorkoutLogFormProps {
    open: boolean;
    onClose: () => void;
    template?: WorkoutTemplate;
    onSave: (workout: {
        exercises: Exercise[];
        notes?: string;
        difficulty?: 'too_easy' | 'just_right' | 'too_hard';
        energyLevel?: 'low' | 'medium' | 'high';
        duration: number;
    }) => Promise<void>;
}

export function WorkoutLogForm({ open, onClose, template, onSave }: WorkoutLogFormProps) {
    const { toast } = useToast();
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [notes, setNotes] = useState('');
    const [difficulty, setDifficulty] = useState<'too_easy' | 'just_right' | 'too_hard' | undefined>();
    const [energyLevel, setEnergyLevel] = useState<'low' | 'medium' | 'high' | undefined>();
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isSaving, setIsSaving] = useState(false);

    // Initialize exercises from template
    useEffect(() => {
        if (template && open) {
            const initialExercises: Exercise[] = template.exercises.map(ex => ({
                exerciseId: ex.exerciseId,
                name: ex.name,
                sets: Array.from({ length: ex.sets }, (_, i) => ({
                    setNumber: i + 1,
                    reps: ex.reps,
                    weight: ex.weight,
                    duration: ex.duration,
                    completed: false,
                })),
            }));
            setExercises(initialExercises);
            setStartTime(new Date());
        }
    }, [template, open]);

    // Timer effect
    useEffect(() => {
        if (!startTime || !open) return;

        const interval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
            setElapsedTime(elapsed);
        }, 1000);

        return () => clearInterval(interval);
    }, [startTime, open]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSetChange = (exerciseIndex: number, setIndex: number, updatedSet: ExerciseSet) => {
        const newExercises = [...exercises];
        newExercises[exerciseIndex].sets[setIndex] = updatedSet;
        setExercises(newExercises);
    };

    const handleAddSet = (exerciseIndex: number) => {
        const newExercises = [...exercises];
        const exercise = newExercises[exerciseIndex];
        const lastSet = exercise.sets[exercise.sets.length - 1];

        exercise.sets.push({
            setNumber: exercise.sets.length + 1,
            reps: lastSet?.reps,
            weight: lastSet?.weight,
            duration: lastSet?.duration,
            completed: false,
        });

        setExercises(newExercises);
    };

    const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
        const newExercises = [...exercises];
        newExercises[exerciseIndex].sets = newExercises[exerciseIndex].sets
            .filter((_, idx) => idx !== setIndex)
            .map((set, idx) => ({ ...set, setNumber: idx + 1 }));
        setExercises(newExercises);
    };

    const handleSave = async () => {
        if (exercises.length === 0) {
            toast({
                title: 'No exercises',
                description: 'Please add at least one exercise to log your workout.',
                variant: 'destructive',
            });
            return;
        }

        setIsSaving(true);
        try {
            await onSave({
                exercises,
                notes: notes || undefined,
                difficulty,
                energyLevel,
                duration: Math.floor(elapsedTime / 60),
            });

            toast({
                title: 'Workout logged!',
                description: 'Your workout has been saved successfully.',
            });

            handleClose();
        } catch {
            toast({
                title: 'Error',
                description: 'Failed to save workout. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleClose = () => {
        setExercises([]);
        setNotes('');
        setDifficulty(undefined);
        setEnergyLevel(undefined);
        setStartTime(null);
        setElapsedTime(0);
        onClose();
    };

    const completedSets = exercises.reduce(
        (total, ex) => total + ex.sets.filter(s => s.completed).length,
        0
    );
    const totalSets = exercises.reduce((total, ex) => total + ex.sets.length, 0);

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center justify-between">
                        <span>Log Workout</span>
                        <div className="flex items-center gap-2 text-primary">
                            <Timer className="w-5 h-5" />
                            <span className="text-xl font-mono">{formatTime(elapsedTime)}</span>
                        </div>
                    </DialogTitle>
                    <DialogDescription>
                        {template ? `Logging: ${template.name}` : 'Custom workout'}
                        {' • '}
                        <span className="text-primary font-medium">
                            {completedSets}/{totalSets} sets completed
                        </span>
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[60vh] pr-4">
                    <div className="space-y-6">
                        {/* Exercises */}
                        {exercises.map((exercise, exerciseIndex) => (
                            <div key={exerciseIndex} className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-foreground">
                                        {exercise.name || `Exercise ${exerciseIndex + 1}`}
                                    </h3>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleAddSet(exerciseIndex)}
                                        className="text-primary hover:text-primary/80"
                                    >
                                        <Plus className="w-4 h-4 mr-1" />
                                        Add Set
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    {exercise.sets.map((set, setIndex) => (
                                        <div key={setIndex} className="relative">
                                            <ExerciseSetInput
                                                set={set}
                                                onChange={(updatedSet) => handleSetChange(exerciseIndex, setIndex, updatedSet)}
                                                showWeight={true}
                                                showDuration={false}
                                            />
                                            {exercise.sets.length > 1 && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveSet(exerciseIndex, setIndex)}
                                                    className="absolute -right-2 top-1/2 -translate-y-1/2 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Workout Feedback */}
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                            <div className="space-y-2">
                                <Label htmlFor="difficulty" className="text-muted-foreground">
                                    How was the difficulty?
                                </Label>
                                <Select value={difficulty} onValueChange={(value: any) => setDifficulty(value)}>
                                    <SelectTrigger id="difficulty">
                                        <SelectValue placeholder="Select difficulty" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="too_easy">Too Easy</SelectItem>
                                        <SelectItem value="just_right">Just Right</SelectItem>
                                        <SelectItem value="too_hard">Too Hard</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="energy" className="text-muted-foreground">
                                    Energy Level
                                </Label>
                                <Select value={energyLevel} onValueChange={(value: any) => setEnergyLevel(value)}>
                                    <SelectTrigger id="energy">
                                        <SelectValue placeholder="Select energy level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label htmlFor="notes" className="text-muted-foreground">
                                Notes (optional)
                            </Label>
                            <Textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="How did you feel? Any observations?"
                                className="min-h-[100px]"
                            />
                        </div>
                    </div>
                </ScrollArea>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={handleClose} disabled={isSaving}>
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? 'Saving...' : 'Save Workout'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
