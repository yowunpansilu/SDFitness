import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, SkipForward, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
        <div className="fixed inset-0 z-50 bg-background text-foreground flex flex-col pt-safe animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between p-4 md:p-6 border-b border-border bg-card/50 gap-4">
                <div className="flex flex-col">
                    <h2 className="text-lg md:text-xl font-bold line-clamp-1">{template.name}</h2>
                    <p className="text-muted-foreground text-xs md:text-sm">Exercise {currentExerciseIdx + 1} of {template.exercises.length}</p>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 md:gap-6">
                    <div className="text-2xl md:text-3xl font-mono tracking-wider text-primary">
                        {formatTime(elapsedSeconds)}
                    </div>
                    <div className="flex items-center gap-2 md:gap-4">
                        <Button
                            variant="secondary"
                            size="icon"
                            className="rounded-full h-10 w-10 md:h-12 md:w-12"
                            onClick={() => setIsPaused(!isPaused)}
                        >
                            {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleEndWorkout}
                            className="rounded-full px-4 md:px-6 h-10 md:h-12 font-bold"
                        >
                            <Square className="w-4 h-4 mr-2" />
                            End
                        </Button>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <Progress
                value={(currentExerciseIdx / template.exercises.length) * 100}
                className="h-1 rounded-none bg-secondary"
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-background to-card">
                <AnimatePresence mode="wait">
                    {currentExercise && (
                        <motion.div
                            key={currentExercise.exerciseId}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="w-full max-w-2xl px-4 md:px-8 py-8 md:py-12"
                        >
                            <div className="text-center mb-6 md:mb-8">
                                <h1 className="text-2xl md:text-4xl font-black mb-3 md:mb-4 leading-tight">{currentExercise.name}</h1>
                                {(currentExercise.duration || 0) > 0 ? (
                                    <div className="text-2xl md:text-3xl text-primary font-mono tracking-tighter">
                                        Target: {currentExercise.duration}s
                                    </div>
                                ) : (
                                    <div className="flex justify-center gap-8 md:gap-12">
                                        <div className="text-center">
                                            <span className="text-muted-foreground block text-[10px] uppercase font-black tracking-[0.2em] mb-1">Sets</span>
                                            <span className="text-2xl md:text-3xl font-black">{currentExercise.sets}</span>
                                        </div>
                                        {(currentExercise.reps || 0) > 0 && (
                                            <div className="text-center">
                                                <span className="text-muted-foreground block text-[10px] uppercase font-black tracking-[0.2em] mb-1">Reps</span>
                                                <span className="text-2xl md:text-3xl font-black">{currentExercise.reps}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {currentExercise.notes && (
                                <div className="text-center mb-8 md:mb-12 max-w-lg mx-auto">
                                    <p className="text-primary/80 font-medium italic leading-relaxed text-base md:text-lg">"{currentExercise.notes}"</p>
                                </div>
                            )}

                            <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3 md:gap-4">
                                <Button
                                    variant="outline"
                                    className="h-14 md:h-16 text-base md:text-lg border-border hover:bg-secondary text-foreground order-2 sm:order-1"
                                    onClick={() => handleNextExercise(true)}
                                >
                                    <SkipForward className="w-5 h-5 mr-2 md:mr-3 text-muted-foreground" />
                                    Skip Exercise
                                </Button>
                                <Button
                                    className="h-14 md:h-16 text-base md:text-lg order-1 sm:order-2"
                                    onClick={() => handleNextExercise(false)}
                                >
                                    <Check className="w-5 h-5 mr-2 md:mr-3" />
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
