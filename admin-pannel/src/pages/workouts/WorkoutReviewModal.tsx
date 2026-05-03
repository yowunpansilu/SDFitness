import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { approveWorkout, rejectWorkout } from '@/services/workoutService';
import { Loader2, Check, X, Dumbbell, Activity, RefreshCw } from 'lucide-react';

interface WorkoutData {
    _id: string;
    name?: string;
    duration?: number;
    estimatedCaloriesBurned?: number;
    description?: string;
    exercises?: { name: string; duration: number; restPeriod: number; sets: number; notes?: string }[];
    memberId?: { userId?: string };
}

export function WorkoutReviewModal({ workout, isOpen, onClose, onSuccess }: { workout: WorkoutData | null, isOpen: boolean, onClose: () => void, onSuccess: () => void }) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [adminNotes, setAdminNotes] = useState('');

    const handleAction = async (action: 'approve' | 'reject') => {
        if (!workout) return;
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
        } catch (err: unknown) {
            const error = err as { message?: string };
            toast({ title: 'Error', description: error.message || `Failed to ${action}`, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    if (!workout) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-white">
                <DialogHeader className="p-6 pb-2 border-b">
                    <DialogTitle className="text-2xl font-bold">Review Generated Cardio Workout</DialogTitle>
                    <DialogDescription className="text-slate-500">
                        Review the AI-generated workout before publishing to member: {workout.memberId?.userId}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Plan Name</h4>
                                <p className="font-bold text-slate-700">{workout.name}</p>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estimated Output</h4>
                                <p className="font-bold text-slate-700">{workout.duration} mins • {workout.estimatedCaloriesBurned} kcal</p>
                            </div>
                            <div className="col-span-2 pt-2 border-t border-slate-100 mt-2">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Description</h4>
                                <p className="text-sm text-slate-600 leading-relaxed">{workout.description}</p>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                                <Dumbbell className="w-5 h-5 text-indigo-500" />
                                Exercises
                            </h3>
                            <div className="space-y-4">
                                {workout.exercises?.map((ex: { name: string; duration: number; restPeriod: number; sets: number; notes?: string }, idx: number) => (
                                    <div key={idx} className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/20 group-hover:bg-indigo-500 transition-colors" />
                                        <div className="flex gap-4 items-start">
                                            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 font-black text-sm">
                                                {idx + 1}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-slate-800 text-lg">{ex.name}</h4>
                                                <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs font-bold text-slate-500 mt-1 mb-3 uppercase tracking-wide">
                                                    <span className="flex items-center gap-1.5"><Activity className="w-3 h-3" /> {ex.duration}s</span>
                                                    <span className="flex items-center gap-1.5"><RefreshCw className="w-3 h-3" /> {ex.restPeriod}s Rest</span>
                                                    <span className="flex items-center gap-1.5"><Dumbbell className="w-3 h-3" /> {ex.sets} Sets</span>
                                                </div>
                                                {ex.notes && (
                                                    <div className="bg-slate-50 text-slate-600 text-xs p-3 rounded-lg border border-slate-100 leading-relaxed font-medium">
                                                        <span className="text-indigo-600 font-bold uppercase text-[9px] tracking-widest block mb-1">Pro Tip:</span>
                                                        {ex.notes}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid gap-2 mb-2">
                            <Label htmlFor="adminNotes" className="text-xs font-bold text-slate-500 uppercase tracking-widest">Review Notes (Optional)</Label>
                            <Textarea
                                id="adminNotes"
                                placeholder="Add notes or feedback here..."
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                className="min-h-[120px] resize-none border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10 rounded-xl"
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-6 bg-slate-50/50 border-t gap-3 sm:gap-0">
                    <Button variant="outline" onClick={onClose} disabled={loading} className="px-8 h-11 font-bold text-slate-600 rounded-xl hover:bg-slate-100 transition-colors">
                        Close
                    </Button>
                    <div className="flex gap-3">
                        <Button
                            variant="destructive"
                            onClick={() => handleAction('reject')}
                            disabled={loading}
                            className="w-36 h-11 font-bold rounded-xl shadow-lg shadow-rose-200"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><X className="w-4 h-4 mr-2" /> Reject Plan</>}
                        </Button>
                        <Button
                            className="bg-emerald-600 hover:bg-emerald-700 text-white w-36 h-11 font-bold rounded-xl shadow-lg shadow-emerald-200"
                            onClick={() => handleAction('approve')}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 mr-2" /> Approve & Send</>}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
