import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { approveWorkout, rejectWorkout } from '@/services/workoutService';
import { Loader2, Check, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export function WorkoutReviewModal({ workout, isOpen, onClose, onSuccess }: { workout: any, isOpen: boolean, onClose: () => void, onSuccess: () => void }) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [adminNotes, setAdminNotes] = useState('');

    const handleAction = async (action: 'approve' | 'reject') => {
        setLoading(true);
        try {
            if (action === 'approve') {
                await approveWorkout(workout._id, adminNotes);
                toast({ title: 'Workout Approved', description: 'Template has been approved and published to member.' });
            } else {
                await rejectWorkout(workout._id, adminNotes);
                toast({ title: 'Workout Rejected', description: 'Template has been flagged as rejected.' });
            }
            onSuccess();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message || `Failed to ${action}`, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    if (!workout) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Review Generated Cardio Workout</DialogTitle>
                    <DialogDescription>
                        Review the AI-generated workout before publishing to member: {workout.memberId?.userId}
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 py-4 pr-4 -mr-4">
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border">
                            <div>
                                <h4 className="text-sm font-semibold text-gray-500 uppercase">Plan Name</h4>
                                <p className="font-medium">{workout.name}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-gray-500 uppercase">Estimated Output</h4>
                                <p className="font-medium">{workout.duration} mins • {workout.estimatedCaloriesBurned} kcal</p>
                            </div>
                            <div className="col-span-2">
                                <h4 className="text-sm font-semibold text-gray-500 uppercase">Description</h4>
                                <p className="text-sm">{workout.description}</p>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Exercises</h3>
                            <div className="space-y-3">
                                {workout.exercises?.map((ex: any, idx: number) => (
                                    <div key={idx} className="bg-white border rounded-lg p-4 shadow-sm flex gap-4 items-start">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 font-bold">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-lg">{ex.name}</h4>
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mt-1 mb-2">
                                                <span>Duration: {ex.duration}s</span>
                                                <span>Rest: {ex.restPeriod}s</span>
                                                <span>Sets: {ex.sets}</span>
                                            </div>
                                            {ex.notes && (
                                                <div className="bg-indigo-50 text-indigo-900 text-xs p-2 rounded">
                                                    <strong>Pro Tip:</strong> {ex.notes}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="adminNotes">Review Notes (Optional)</Label>
                            <Textarea
                                id="adminNotes"
                                placeholder="Add notes or feedback here..."
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                            />
                        </div>
                    </div>
                </ScrollArea>

                <DialogFooter className="mt-4 pt-4 border-t gap-2 sm:gap-0">
                    <Button variant="outline" onClick={onClose} disabled={loading}>Close</Button>
                    <div className="flex gap-2">
                        <Button
                            variant="destructive"
                            onClick={() => handleAction('reject')}
                            disabled={loading}
                            className="w-32"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><X className="w-4 h-4 mr-2" /> Reject</>}
                        </Button>
                        <Button
                            className="bg-green-600 hover:bg-green-700 text-white w-32"
                            onClick={() => handleAction('approve')}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 mr-2" /> Approve</>}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
