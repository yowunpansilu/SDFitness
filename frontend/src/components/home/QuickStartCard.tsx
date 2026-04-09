import { Play } from 'lucide-react';
import { AppSkeleton } from '../ui/AppSkeleton';

interface QuickStartCardProps {
  isLoading?: boolean;
}

export function QuickStartCard({ isLoading = false }: QuickStartCardProps) {
  return (
    <AppSkeleton name="home-quickstart" loading={isLoading}>
      <div 
        className="quick-start" 
        role="button" 
        tabIndex={0} 
        aria-label="Start today's recommended workout: Full Body Power"
      >
        <div className="quick-start__inner">
          <div className="quick-start__text">
            <span className="quick-start__label">Daily Program</span>
            <h2 className="quick-start__title">Full Body<br/>Power</h2>
            <p className="quick-start__meta">45 Min • High Intensity</p>
          </div>
          
          <button 
            type="button" 
            className="quick-start__btn"
            aria-hidden="true" // Screen readers already hear the parent role="button"
            tabIndex={-1}
          >
            <Play size={24} fill="currentColor" className="ml-1" />
          </button>
        </div>
      </div>
    </AppSkeleton>
  );
}
