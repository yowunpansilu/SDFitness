import { useEffect, useState } from 'react';
import { X, Play, Clock, Flame, CheckCircle2, ChevronRight, Timer as TimerIcon } from 'lucide-react';
import { TagChip } from '../ui/TagChip';
import { useLogWorkout, type WorkoutTemplate } from '../../hooks/queries/useWorkoutQueries';
import { useToast } from '../../hooks/use-toast';

interface ActiveWorkoutProps {
  workout: WorkoutTemplate;
  onClose: () => void;
}

export function ActiveWorkout({ workout, onClose }: ActiveWorkoutProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<number[]>([]);
  const { mutate: logWorkout, isPending } = useLogWorkout();
  const { toast } = useToast();

  // Trigger open animation on mount
  useEffect(() => {
    requestAnimationFrame(() => setIsOpen(true));
  }, []);

  const handleClose = () => {
    if (sessionStarted && completedExercises.length < workout.exercises.length) {
      if (!confirm('Abort workout session? Progress will not be saved.')) return;
    }
    setIsOpen(false);
    setTimeout(onClose, 400);
  };

  const handleStart = () => {
    setSessionStarted(true);
  };

  const handleNext = () => {
    if (!completedExercises.includes(currentIndex)) {
      setCompletedExercises([...completedExercises, currentIndex]);
    }
    if (currentIndex < workout.exercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleFinish = () => {
    logWorkout({
      name: workout.name,
      exercises: workout.exercises,
      duration: workout.duration,
      difficulty: workout.difficulty,
      category: workout.category,
      date: new Date().toISOString()
    }, {
      onSuccess: () => {
        toast({
          title: "Workout Completed! 🏆",
          description: `You've crushed ${workout.name}. Achievement updated.`,
        });
        setIsOpen(false);
        setTimeout(onClose, 400);
      },
      onError: (err: any) => {
        toast({
          title: "Logging Failed",
          description: err.message || "Failed to save workout data.",
          variant: "destructive"
        });
      }
    });
  };

  if (!workout) return null;

  return (
    <div className={`active-workout-overlay ${isOpen ? 'active-workout-overlay--open' : ''}`}>
      <div className="active-workout-sheet bg-zinc-950 overflow-y-auto">
        {/* Header Image */}
        <div 
          className="active-workout-header relative h-64 shrink-0"
          style={{ backgroundImage: `url(${workout.image || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop'})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
          <button className="absolute top-6 right-6 p-2 rounded-full bg-black/40 text-white backdrop-blur-md" onClick={handleClose}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="active-workout-content px-6 -mt-12 relative z-10">
          <div className="flex gap-2 mb-4">
            <TagChip label={workout.category} variant="brand" />
            <TagChip label={workout.difficulty.toUpperCase()} variant="energy" />
          </div>
          
          <h2 className="text-4xl font-headline font-black text-white mb-6 leading-tight uppercase tracking-tighter italic">
            {workout.name}
          </h2>

          <div className="flex gap-8 mb-8 border-b border-white/5 pb-8 overflow-x-auto no-scrollbar">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.2em] text-ink-muted mb-1 font-bold">Duration</span>
              <div className="flex items-center gap-2 text-white text-xl font-bold">
                <Clock size={18} className="text-brand" />
                {workout.duration}m
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.2em] text-ink-muted mb-1 font-bold">Est. Burn</span>
              <div className="flex items-center gap-2 text-white text-xl font-bold">
                <Flame size={18} className="text-energy" />
                {workout.duration * 10} kcal
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.2em] text-ink-muted mb-1 font-bold">Exercises</span>
              <div className="flex items-center gap-2 text-white text-xl font-bold">
                <TimerIcon size={18} className="text-cta" />
                {workout.exercises.length}
              </div>
            </div>
          </div>

          <h3 className="text-xs uppercase tracking-[0.3em] font-black text-ink-muted mb-6">Program Sequence</h3>
          
          <div className="flex flex-col gap-4 pb-32">
            {workout.exercises.map((ex, idx) => {
              const isActive = currentIndex === idx && sessionStarted;
              const isDone = completedExercises.includes(idx);
              
              return (
                <div 
                  key={idx} 
                  className={`relative flex items-center gap-4 p-4 rounded-3xl border transition-all duration-300 ${
                    isActive ? 'bg-brand/10 border-brand scale-[1.02] shadow-[0_0_30px_rgba(220,38,38,0.15)]' : 
                    isDone ? 'bg-zinc-900/40 border-green-500/30 grayscale-[0.8]' : 'bg-white/5 border-white/5'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                    isActive ? 'bg-brand text-white rotate-12 scale-110' : 
                    isDone ? 'bg-green-500/20 text-green-500' : 'bg-white/5 text-ink-muted'
                  }`}>
                    {isDone ? <CheckCircle2 size={24} /> : <Play size={20} fill={isActive ? "currentColor" : "none"} />}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className={`font-bold transition-colors ${isActive ? 'text-white text-lg' : 'text-zinc-300'}`}>
                      {ex.name}
                    </h4>
                    <div className="flex gap-3 text-xs font-bold uppercase tracking-widest text-ink-muted mt-1">
                      <span>{ex.sets} Sets</span>
                      <span>•</span>
                      <span>{ex.reps} Reps</span>
                    </div>
                  </div>

                  {isActive && (
                    <button 
                      onClick={handleNext}
                      className="w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center animate-pulse"
                    >
                      <ChevronRight size={20} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Floating Action */}
        <div className="fixed bottom-8 left-6 right-6 z-50">
          {!sessionStarted ? (
            <button 
              onClick={handleStart}
              className="w-full bg-brand hover:bg-red-700 text-white font-black py-5 rounded-[2rem] shadow-2xl shadow-brand/40 uppercase tracking-[0.2em] transform transition active:scale-95 flex items-center justify-center gap-3"
            >
              <Play size={24} fill="currentColor" />
              Begin Session
            </button>
          ) : (
            <button 
              onClick={handleFinish}
              disabled={isPending}
              className={`w-full font-black py-5 rounded-[2rem] shadow-2xl uppercase tracking-[0.2em] transform transition active:scale-95 flex items-center justify-center gap-3 ${
                completedExercises.length === workout.exercises.length 
                  ? 'bg-cta hover:bg-green-700 text-white shadow-cta/40' 
                  : 'bg-zinc-800 text-white/50 border border-white/10 opacity-50'
              }`}
            >
              {isPending ? 'Saving Data...' : 'Finish Workout'}
              <CheckCircle2 size={24} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
