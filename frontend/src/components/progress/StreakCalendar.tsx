import { useWorkoutHistory } from '../../hooks/queries/useWorkoutQueries';
import { useAuthStore } from '@/lib/stores/authStore';

interface StreakProps {
  isLoading?: boolean;
}

export function StreakCalendar({ isLoading: isSyncing = false }: StreakProps) {
  const { data: history, isLoading: isHistoryLoading } = useWorkoutHistory();
  const isLoading = isSyncing || isHistoryLoading;

  // Generate real activity heatmap data
  const workoutDates = new Set(history?.map((w: any) => new Date(w.workoutDate).toDateString()));
  
  const cols = Array.from({ length: 14 }).map((_, x) => {
    return Array.from({ length: 7 }).map((_, y) => {
      const date = new Date();
      date.setDate(date.getDate() - (13 - x) * 7 - (6 - y));
      return workoutDates.has(date.toDateString()) ? 4 : 0; 
    });
  });

  return (
    <div className="streak-calendar">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title mb-0">Commitment</h3>
        <span className="text-xs font-bold text-brand uppercase tracking-wider">30 Days</span>
      </div>
      
      {isLoading ? (
        <div className="animate-pulse flex gap-1 overflow-hidden h-[96px] bg-ink-faint rounded-xl"></div>
      ) : (
        <div className="streak-calendar__grid">
          {cols.map((col, x) => (
            <div key={x} className="streak-calendar__col">
              {col.map((val, y) => (
                <div 
                  key={`${x}-${y}`} 
                  className={`streak-calendar__cell streak-calendar__cell--${val}`}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
