import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { logWorkout } from '@/lib/api/workoutApi';
import { useAuthStore } from '@/lib/stores/authStore';
import { useWorkoutStore } from '@/lib/stores/workoutStore';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function WorkoutLogModal({ template, durationMinutes, loggedExercises, onClose }: { template: any, durationMinutes: number, loggedExercises: any[], onClose: () => void }) {
    const { user } = useAuthStore();
    const { addWorkoutToHistory } = useWorkoutStore();
    const { toast } = useToast();

    const [difficulty, setDifficulty] = useState('just_right');
    const [energyLevel, setEnergyLevel] = useState('medium');
    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!user?.id) return;
        setSaving(true);
        try {
            const result = await logWorkout({
                memberId: user.id,
                templateId: template._id,
                workoutDate: new Date(),
                exercises: loggedExercises,
                notes,
                difficulty: difficulty as 'too_easy' | 'just_right' | 'too_hard',
                energyLevel: energyLevel as 'low' | 'medium' | 'high'
            });

            addWorkoutToHistory(result);
            toast({ title: 'Workout Saved!', description: `Great job! You exercised for ${durationMinutes} minutes.` });
            onClose();
        } catch {
            toast({ title: 'Error', description: 'Failed to save workout log', variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black">Workout Complete! 🎉</DialogTitle>
                    <DialogDescription>
                        Awesome job! You've crushed {durationMinutes} minutes of cardio. How did it feel?
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-6">
                    <div className="space-y-3">
                        <Label>Difficulty</Label>
                        <Select value={difficulty} onValueChange={setDifficulty}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="too_easy">Too Easy 🥱</SelectItem>
                                <SelectItem value="just_right">Just Right 👍</SelectItem>
                                <SelectItem value="too_hard">Too Hard 🥵</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-3">
                        <Label>Energy Level</Label>
                        <Select value={energyLevel} onValueChange={setEnergyLevel}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">Low Battery 🔋</SelectItem>
                                <SelectItem value="medium">Feeling Good ⚡</SelectItem>
                                <SelectItem value="high">Unstoppable 🔥</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-3">
                        <Label>Notes & Reflections</Label>
                        <Textarea
                            placeholder="e.g. Heart rate was steady, felt a bit winded near the end."
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>
                </div>

                <DialogFooter className="sm:justify-between">
                    <Button variant="ghost" onClick={onClose} disabled={saving}>
                        Discard
                    </Button>
                    <Button onClick={handleSave} disabled={saving} className="px-8">
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Result'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
