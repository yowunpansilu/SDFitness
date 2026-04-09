import { useRef } from 'react';
import { WorkoutCard } from './WorkoutCard';

export interface WorkoutItem {
  id: string | number;
  title: string;
  duration: number;
  intensity: string;
  difficulty: number;
  type: string;
  image: string;
}

interface WorkoutTrackProps {
  title: string;
  workouts: WorkoutItem[];
  isLoading?: boolean;
  onWorkoutClick?: (workout: WorkoutItem) => void;
}

export function WorkoutTrack({ title, workouts, isLoading = false, onWorkoutClick }: WorkoutTrackProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  // Fallback items exactly match the design
  const items = isLoading ? [1, 2, 3] : workouts;

  return (
    <section className="workout-track-section">
      <div className="workout-track-header">
        <h2 className="workout-track-title">{title}</h2>
        <button className="workout-track-more">See All</button>
      </div>

      <div className="workout-track-scroller hide-scrollbar" ref={trackRef}>
        <div className="workout-track" role="list">
          {items.map((item, index) => {
            const isPlaceholder = typeof item === 'number';
            const workout = isPlaceholder ? null : (item as WorkoutItem);

            return (
              <div 
                key={isPlaceholder ? index : workout?.id} 
                className="workout-track-item" 
                role="listitem"
                onClick={() => !isPlaceholder && onWorkoutClick?.(workout as WorkoutItem)}
              >
                <WorkoutCard 
                  title={isPlaceholder ? "" : workout?.title || ""}
                  duration={isPlaceholder ? 0 : workout?.duration || 0}
                  intensity={(isPlaceholder ? 'Medium' : workout?.intensity || 'Medium') as 'Low' | 'Medium' | 'High'}
                  difficulty={(isPlaceholder ? 1 : workout?.difficulty || 1) as 1 | 2 | 3}
                  type={isPlaceholder ? '' : workout?.type || ''}
                  image={isPlaceholder ? undefined : workout?.image}
                  isLoading={isPlaceholder}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
