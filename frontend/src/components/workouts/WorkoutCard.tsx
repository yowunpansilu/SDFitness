import { AppSkeleton } from '../ui/AppSkeleton';
import { TagChip } from '../ui/TagChip';

interface WorkoutCardProps {
  title: string;
  duration: number;
  intensity: 'Low' | 'Medium' | 'High';
  difficulty: 1 | 2 | 3;
  type: string;
  image?: string;
  isLoading?: boolean;
}

export function WorkoutCard({ 
  title, 
  duration, 
  intensity, 
  difficulty, 
  type, 
  image, 
  isLoading = false 
}: WorkoutCardProps) {
  return (
    <AppSkeleton name={`workout-card-${title}`} loading={isLoading}>
      <div 
        className="workout-card" 
        role="button" 
        tabIndex={0}
        aria-label={`Workout: ${title}, ${duration} minutes`}
      >
        <div className="workout-card__fav">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>

        {/* Image placeholder with gradient */}
        <div 
          className="workout-card__image" 
          style={image ? { backgroundImage: `url(${image})` } : undefined}
        />

        <div className="workout-card__body">
          <div className="workout-card__tags">
            <TagChip label={type} variant="brand" />
            <TagChip label={intensity} variant="energy" />
          </div>

          <h3 className="workout-card__name">{title}</h3>
          
          <div className="workout-card__meta mt-auto pt-2">
            <div className="workout-card__meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>{duration} Min</span>
            </div>
            
            <div className="flex-1" /> {/* Spacer */}
            
            {/* Difficulty Bar */}
            <div className="workout-card__meta-item">
              <span>Level</span>
              <div className="difficulty-bar w-10 ml-1">
                <div className={`difficulty-bar__segment difficulty-bar__segment--active`} />
                <div className={`difficulty-bar__segment ${difficulty >= 2 ? 'difficulty-bar__segment--active' : ''}`} />
                <div className={`difficulty-bar__segment ${difficulty >= 3 ? 'difficulty-bar__segment--active hard' : ''}`} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppSkeleton>
  );
}
