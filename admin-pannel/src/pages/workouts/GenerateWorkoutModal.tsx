import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { generateWorkout } from '@/services/workoutService';
import { memberService } from '@/services/memberService'; // assume exists
import { Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export function GenerateWorkoutModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [members, setMembers] = useState<{ id: string; firstName: string; lastName: string; membershipType: string }[]>([]);
    const [selectedMember, setSelectedMember] = useState('');
    const [difficulty, setDifficulty] = useState('beginner');
    const [category, setCategory] = useState('cardio');
    const [duration, setDuration] = useState('30');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (isOpen) {
            memberService.getMembers().then((res: { data?: { id: string; firstName: string; lastName: string; membershipType: string }[] }) => {
                if (res.data) setMembers(res.data);
            }).catch(console.error);
        }
    }, [isOpen]);

    const handleGenerate = async () => {
        if (!selectedMember) {
            toast({ title: 'Validation', description: 'Please select a member', variant: 'destructive' });
            return;
        }

        setLoading(true);
        try {
            await generateWorkout(selectedMember, { targetDuration: parseInt(duration), difficulty, category, notes });
            toast({ title: 'Success', description: 'AI successfully generated the workout plan!' });
            onSuccess();
            onClose();
        } catch (err: unknown) {
            const error = err as { message?: string };
            toast({ title: 'Error', description: error.message || 'Failed to generate workout', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[450px] max-h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle>Generate AI Workout Plan</DialogTitle>
                    <DialogDescription>
                        Tailored workout for a specific member using AI.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 px-6 py-4">
                    <div className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="member">Select Member</Label>
                            <Select value={selectedMember} onValueChange={setSelectedMember}>
                                <SelectTrigger id="member" className="h-11">
                                    <SelectValue placeholder="Select member" />
                                </SelectTrigger>
                                <SelectContent>
                                    {members.map(m => (
                                        <SelectItem key={m.id} value={m.id}>
                                            {m.firstName} {m.lastName} ({m.membershipType || 'Basic'})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="difficulty">Difficulty</Label>
                                <Select value={difficulty} onValueChange={setDifficulty}>
                                    <SelectTrigger id="difficulty" className="h-11">
                                        <SelectValue placeholder="Beginner" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="beginner">Beginner</SelectItem>
                                        <SelectItem value="intermediate">Intermediate</SelectItem>
                                        <SelectItem value="advanced">Advanced</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="category">Category</Label>
                                <Select value={category} onValueChange={setCategory}>
                                    <SelectTrigger id="category" className="h-11">
                                        <SelectValue placeholder="Cardio" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cardio">Cardio</SelectItem>
                                        <SelectItem value="strength">Strength</SelectItem>
                                        <SelectItem value="full_body">Full Body</SelectItem>
                                        <SelectItem value="hiit">HIIT</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="duration">Target Duration (Mins)</Label>
                            <Input
                                id="duration"
                                type="number"
                                min="10"
                                max="120"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                className="h-11"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="notes">Additional AI Prompts (Optional)</Label>
                            <Textarea
                                id="notes"
                                placeholder="e.g. Include a heavy walking incline option."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="min-h-[100px] resize-none"
                            />
                        </div>
                    </div>
                </ScrollArea>

                <DialogFooter className="p-6 pt-2 border-t">
                    <Button variant="outline" onClick={onClose} disabled={loading} className="h-11">Cancel</Button>
                    <Button onClick={handleGenerate} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 h-11 w-[140px]">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate with AI"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

