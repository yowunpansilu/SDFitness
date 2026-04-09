import { useEffect, useState } from 'react';
import { X, Play, Clock, Flame } from 'lucide-react';
import { TagChip } from '../ui/TagChip';

interface ActiveWorkoutProps {
  workout: {
    id: string | number;
    title: string;
    duration: number;
    intensity: string;
    difficulty: number;
    type: string;
    image: string;
  };
  onClose: () => void;
}

export function ActiveWorkout({ workout, onClose }: ActiveWorkoutProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Trigger open animation on mount
  useEffect(() => {
    requestAnimationFrame(() => setIsOpen(true));
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 400); // Wait for transition
  };

  if (!workout) return null;

  return (
    <div className={`active-workout-overlay ${isOpen ? 'active-workout-overlay--open' : ''}`}>
      <div className="active-workout-sheet">
        {/* Header Image */}
        <div 
          className="active-workout-header"
          style={{ backgroundImage: `url(${workout.image})` }}
        >
          <div className="active-workout-header__overlay" />
          <button className="active-workout-close" onClick={handleClose} aria-label="Close">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="active-workout-content">
          <div className="flex gap-2 mb-3">
            <TagChip label={workout.type} variant="brand" />
            <TagChip label={workout.intensity} variant="energy" />
          </div>
          
          <h2 className="text-3xl font-headline font-bold text-white mb-4 leading-tight">
            {workout.title}
          </h2>

          <div className="flex gap-6 mb-8 border-b border-white/10 pb-6">
            <div className="flex items-center gap-2 text-ink-muted">
              <Clock size={16} />
              <span className="font-medium text-white">{workout.duration} Min</span>
            </div>
            <div className="flex items-center gap-2 text-ink-muted">
              <Flame size={16} />
              <span className="font-medium text-white">450 kcal</span>
            </div>
            <div className="flex items-center gap-2 text-ink-muted">
              <span className="text-sm">Level</span>
              <span className="font-medium text-white">{workout.difficulty}/3</span>
            </div>
          </div>

          {/* Exercise List Mock */}
          <h3 className="section-title mb-4">Exercises</h3>
          <div className="flex flex-col gap-3 mb-24">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 bg-ink-faint rounded-2xl p-3">
                <div className="w-12 h-12 rounded-xl bg-ink-medium flex items-center justify-center shrink-0">
                  <Play size={20} className="text-white" fill="currentColor" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-white">Exercise Movement {i}</h4>
                  <p className="text-sm text-ink-muted">45s work • 15s rest</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fixed Bottom Action */}
        <div className="active-workout-action">
          <button className="button button--primary button--lg w-full shadow-lg shadow-brand/20">
            Start Workout
          </button>
        </div>
      </div>
    </div>
  );
}
