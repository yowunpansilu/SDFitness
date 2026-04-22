import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, SkipForward, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { WorkoutTemplate } from '@/lib/api/workoutApi';
import { useWorkoutStore } from '@/lib/stores/workoutStore';
import { WorkoutLogModal } from './WorkoutLogModal';

interface WorkoutSessionPlayerProps {
    template: WorkoutTemplate;
    onClose: () => void;
}

export function WorkoutSessionPlayer({ template, onClose }: WorkoutSessionPlayerProps) {
    const { startWorkout, completeWorkout, isWorkoutInProgress } = useWorkoutStore();
    const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [completedExercises, setCompletedExercises] = useState<any[]>([]);
    const [showLogModal, setShowLogModal] = useState(false);

    useEffect(() => {
        if (!isWorkoutInProgress) {
            startWorkout(template);
        }
    }, []);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (!isPaused && !showLogModal) {
            interval = setInterval(() => {
                setElapsedSeconds(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPaused, showLogModal]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const currentExercise = template.exercises[currentExerciseIdx];
    const isLastExercise = currentExerciseIdx === template.exercises.length - 1;

    const handleNextExercise = (skipped = false) => {
        const loggedExercise = {
            exerciseId: currentExercise.exerciseId,
            name: currentExercise.name,
            sets: Array.from({ length: currentExercise.sets }, (_, i) => ({
                setNumber: i + 1,
                completed: !skipped,
            }))
        };

        setCompletedExercises(prev => [...prev, loggedExercise]);

        if (isLastExercise) {
            setShowLogModal(true);
        } else {
            setCurrentExerciseIdx(prev => prev + 1);
        }
    };

    const handleEndWorkout = () => {
        setShowLogModal(true);
        setIsPaused(true);
    };

    const handleLogSave = () => {
        completeWorkout();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900 text-white flex flex-col pt-safe animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-black/20">
                <div>
                    <h2 className="text-xl font-bold">{template.name}</h2>
                    <p className="text-slate-400 text-sm">Exercise {currentExerciseIdx + 1} of {template.exercises.length}</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-3xl font-mono tracking-wider text-indigo-400">
                        {formatTime(elapsedSeconds)}
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full bg-white/10 hover:bg-white/20"
                        onClick={() => setIsPaused(!isPaused)}
                    >
                        {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleEndWorkout}
                        className="rounded-full px-6"
                    >
                        <Square className="w-4 h-4 mr-2" />
                        End
                    </Button>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-white/10 h-1">
                <div
                    className="h-full bg-indigo-500 transition-all duration-300"
                    style={{ width: `${((currentExerciseIdx) / template.exercises.length) * 100}%` }}
                />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-900 to-black">
                <AnimatePresence mode="wait">
                    {currentExercise && (
                        <motion.div
                            key={currentExercise.exerciseId}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="w-full max-w-2xl bg-white/5 border border-white/10 rounded-3xl p-8"
                        >
                            <div className="text-center mb-8">
                                <h1 className="text-4xl font-black mb-4">{currentExercise.name}</h1>
                                {(currentExercise.duration || 0) > 0 ? (
                                    <div className="text-2xl text-indigo-400 font-mono bg-indigo-500/10 inline-block px-6 py-3 rounded-2xl">
                                        Target: {currentExercise.duration} secs
                                    </div>
                                ) : (
                                    <div className="flex justify-center gap-8 text-xl">
                                        <div className="bg-white/5 px-6 py-3 rounded-2xl">
                                            <span className="text-slate-400 block text-sm uppercase font-bold tracking-widest mb-1">Sets</span>
                                            <span className="font-bold">{currentExercise.sets}</span>
                                        </div>
                                        {(currentExercise.reps || 0) > 0 && (
                                            <div className="bg-white/5 px-6 py-3 rounded-2xl">
                                                <span className="text-slate-400 block text-sm uppercase font-bold tracking-widest mb-1">Reps</span>
                                                <span className="font-bold">{currentExercise.reps}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {currentExercise.notes && (
                                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 text-center mb-8">
                                    <p className="text-indigo-200">{currentExercise.notes}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <Button
                                    variant="outline"
                                    className="h-16 text-lg border-white/20 hover:bg-white/10 text-white"
                                    onClick={() => handleNextExercise(true)}
                                >
                                    <SkipForward className="w-5 h-5 mr-3 text-slate-400" />
                                    Skip Exercise
                                </Button>
                                <Button
                                    className="h-16 text-lg bg-indigo-600 hover:bg-indigo-500 text-white"
                                    onClick={() => handleNextExercise(false)}
                                >
                                    <Check className="w-5 h-5 mr-3" />
                                    Complete Exercise
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {showLogModal && (
                <WorkoutLogModal
                    template={template}
                    durationMinutes={Math.floor(elapsedSeconds / 60)}
                    loggedExercises={completedExercises}
                    onClose={() => {
                        handleLogSave();
                        onClose();
                    }}
                />
            )}
        </div>
    );
}
