import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getAdminWorkouts } from '@/services/workoutService';
import { Skeleton } from '@/components/ui/skeleton';
import { Dumbbell, Activity, Plus } from 'lucide-react';
import { GenerateWorkoutModal } from './GenerateWorkoutModal';
import { WorkoutReviewModal } from './WorkoutReviewModal';

interface Workout {
    _id: string;
    status: string;
    name?: string;
    description?: string;
    memberId?: { userId?: string };
    duration?: number;
    estimatedCaloriesBurned?: number;
    exercises?: { name: string; duration: number; restPeriod: number; sets: number; notes?: string }[];
    adminNotes?: string;
}

export function WorkoutsPage() {
    const { toast } = useToast();
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [loading, setLoading] = useState(true);
    const [isGenerateOpen, setIsGenerateOpen] = useState(false);
    const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

    const fetchWorkouts = async () => {
        setLoading(true);
        try {
            const res = await getAdminWorkouts();
            if (res.success) {
                setWorkouts(res.data);
            }
        } catch {
            toast({ title: 'Error', description: 'Failed to load workouts', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkouts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const pendingWorkouts = workouts.filter(w => w.status === 'pending_review');
    const completedWorkouts = workouts.filter(w => w.status === 'approved' || w.status === 'rejected');

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Activity className="w-8 h-8 text-indigo-500" />
                        AI Workouts
                    </h1>
                    <p className="text-muted-foreground mt-1">Review and manage AI-generated cardio workouts for members.</p>
                </div>
                <Button onClick={() => setIsGenerateOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg gap-2">
                    <Plus className="w-4 h-4" />
                    Generate Workout
                </Button>
            </div>

            <Tabs defaultValue="pending" className="w-full pb-10">
                <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
                    <TabsTrigger value="pending">Pending Review ({pendingWorkouts.length})</TabsTrigger>
                    <TabsTrigger value="completed">Completed History</TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="mt-6 space-y-4">
                    {loading ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <Skeleton className="h-[200px] rounded-xl" />
                            <Skeleton className="h-[200px] rounded-xl" />
                        </div>
                    ) : pendingWorkouts.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {pendingWorkouts.map(workout => (
                                <div key={workout._id} className="bg-white p-6 rounded-xl border shadow-sm flex flex-col justify-between hover:border-indigo-200 transition-colors">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-semibold text-lg">{workout.name}</h3>
                                            <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full font-medium">Pending</span>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{workout.description}</p>
                                        <div className="text-sm space-y-1 mb-4">
                                            <p><span className="font-medium text-gray-700">Member:</span> {workout.memberId?.userId || 'N/A'}</p>
                                            <p><span className="font-medium text-gray-700">Duration:</span> {workout.duration} mins</p>
                                            <p><span className="font-medium text-gray-700">Exercises:</span> {workout.exercises?.length || 0}</p>
                                        </div>
                                    </div>
                                    <Button onClick={() => setSelectedWorkout(workout)} variant="outline" className="w-full gap-2 border-indigo-100 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                                        <Dumbbell className="w-4 h-4" />
                                        Review Details
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-xl border">
                            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-gray-900">No pending workouts</h3>
                            <p className="text-gray-500">All AI-generated workouts have been reviewed.</p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="completed" className="mt-6">
                    {loading ? (
                        <Skeleton className="h-[400px] w-full rounded-xl" />
                    ) : (
                        <div className="bg-white rounded-xl border overflow-x-auto scrollbar-thin">
                            <table className="w-full text-sm text-left relative min-w-[800px]">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-4 font-medium text-gray-900">Name</th>
                                        <th className="px-6 py-4 font-medium text-gray-900">Member</th>
                                        <th className="px-6 py-4 font-medium text-gray-900">Duration</th>
                                        <th className="px-6 py-4 font-medium text-gray-900">Status</th>
                                        <th className="px-6 py-4 font-medium text-gray-900">Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {completedWorkouts.map(workout => (
                                        <tr key={workout._id} className="border-b last:border-0 hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium">{workout.name}</td>
                                            <td className="px-6 py-4">{workout.memberId?.userId || 'N/A'}</td>
                                            <td className="px-6 py-4">{workout.duration} mins</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${workout.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {workout.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 truncate max-w-[200px]">{workout.adminNotes || '-'}</td>
                                        </tr>
                                    ))}
                                    {completedWorkouts.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                                No completed workout reviews yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            <GenerateWorkoutModal
                isOpen={isGenerateOpen}
                onClose={() => setIsGenerateOpen(false)}
                onSuccess={fetchWorkouts}
            />

            {selectedWorkout && (
                <WorkoutReviewModal
                    workout={selectedWorkout}
                    isOpen={!!selectedWorkout}
                    onClose={() => setSelectedWorkout(null)}
                    onSuccess={() => {
                        setSelectedWorkout(null);
                        fetchWorkouts();
                    }}
                />
            )}
        </div>
    );
}
