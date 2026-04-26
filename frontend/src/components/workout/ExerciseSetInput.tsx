import { Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import type { ExerciseSet } from '@/lib/api/workoutApi';

interface ExerciseSetInputProps {
    set: ExerciseSet;
    onChange: (set: ExerciseSet) => void;
    showWeight?: boolean;
    showDuration?: boolean;
}

export function ExerciseSetInput({ set, onChange, showWeight = true, showDuration = false }: ExerciseSetInputProps) {
    const handleChange = (field: keyof ExerciseSet, value: number | boolean) => {
        onChange({ ...set, [field]: value });
    };

    return (
        <div className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${set.completed
            ? 'bg-primary/10 border-primary/30'
            : 'bg-muted/30 border-border'
            }`}>
            {/* Set Number */}
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-foreground font-semibold text-sm">
                {set.setNumber}
            </div>

            {/* Reps Input */}
            {!showDuration && (
                <div className="flex-1">
                    <label className="text-xs text-muted-foreground mb-1 block">Reps</label>
                    <Input
                        type="number"
                        min="0"
                        value={set.reps || ''}
                        onChange={(e) => handleChange('reps', parseInt(e.target.value) || 0)}
                        className="h-9"
                        placeholder="12"
                    />
                </div>
            )}

            {/* Weight Input */}
            {showWeight && !showDuration && (
                <div className="flex-1">
                    <label className="text-xs text-muted-foreground mb-1 block">Weight (kg)</label>
                    <Input
                        type="number"
                        min="0"
                        step="0.5"
                        value={set.weight || ''}
                        onChange={(e) => handleChange('weight', parseFloat(e.target.value) || 0)}
                        className="h-9"
                        placeholder="60"
                    />
                </div>
            )}

            {/* Duration Input (for timed exercises) */}
            {showDuration && (
                <div className="flex-1">
                    <label className="text-xs text-muted-foreground mb-1 block">Duration (sec)</label>
                    <Input
                        type="number"
                        min="0"
                        value={set.duration || ''}
                        onChange={(e) => handleChange('duration', parseInt(e.target.value) || 0)}
                        className="h-9"
                        placeholder="60"
                    />
                </div>
            )}

            {/* Completed Checkbox */}
            <div className="flex flex-col items-center gap-1">
                <label className="text-xs text-muted-foreground">Done</label>
                <Checkbox
                    checked={set.completed}
                    onCheckedChange={(checked) => handleChange('completed', checked as boolean)}
                    className="w-6 h-6 border-2"
                />
            </div>

            {/* Completion Indicator */}
            {set.completed && (
                <div className="absolute -right-2 -top-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg">
                    <Check className="w-4 h-4 text-primary-foreground" />
                </div>
            )}
        </div>
    );
}
