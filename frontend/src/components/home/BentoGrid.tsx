import { AppSkeleton } from '../ui/AppSkeleton';
import { Flame, CalendarClock, Trophy } from 'lucide-react';

interface BentoGridProps {
  isLoading?: boolean;
  stats?: {
    burnedCalories?: number;
    streakDays?: number;
    nextClass?: {
      name: string;
      time: string;
    };
  };
}

export function BentoGrid({ isLoading = false, stats }: BentoGridProps) {
  const burned = stats?.burnedCalories || 0;
  const streak = stats?.streakDays || 0;
  const nextClass = stats?.nextClass || { name: 'Rest Day', time: 'No classes today' };

  return (
    <section className="bento-grid" aria-label="Dashboard Metrics">
      {/* Calories Block */}
      <AppSkeleton name="bento-calories" loading={isLoading}>
        <div className="bento-cell" aria-label={`Calories burned: ${burned} kcal`}>
          <div className="bento-cell__icon bg-brand-light text-brand">
            <Flame size={20} strokeWidth={2.5} />
          </div>
          <p className="bento-cell__label">Burned</p>
          <div className="mt-1 flex items-baseline">
            <span className="bento-cell__value">{burned.toLocaleString()}</span>
            <span className="bento-cell__unit">kcal</span>
          </div>
          <div className="bento-cell__progress">
            <div className="bento-cell__progress-fill" style={{ width: `${Math.min(100, (burned / 2000) * 100)}%` }} />
          </div>
        </div>
      </AppSkeleton>

      {/* Class Schedule Block */}
      <AppSkeleton name="bento-class" loading={isLoading}>
        <div className="bento-cell bg-ink-faint">
          <div className="bento-cell__icon bg-white text-ink-medium shadow-sm">
            <CalendarClock size={20} strokeWidth={2.5} />
          </div>
          <p className="bento-cell__label">Next Class</p>
          <div className="mt-1">
            <p className="font-headline font-bold text-lg text-ink-strong leading-tight">{nextClass.name}</p>
            <p className="text-sm font-sans text-brand font-semibold mt-0.5">{nextClass.time}</p>
          </div>
        </div>
      </AppSkeleton>

      {/* Streak Block (Wide) */}
      <AppSkeleton name="bento-streak" loading={isLoading}>
        <div className="bento-cell bento-cell--wide flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-energy-light text-energy-dark flex items-center justify-center">
              <Trophy size={24} strokeWidth={2.5} />
            </div>
            <div>
              <p className="bento-cell__label mt-0">Current Streak</p>
              <div className="flex items-baseline">
                <span className="bento-cell__value">{streak}</span>
                <span className="bento-cell__unit">Days Strong</span>
              </div>
            </div>
          </div>
          <div className="pulse-indicator w-8 h-8 mr-2">
            <div className="pulse-indicator__core" />
          </div>
        </div>
      </AppSkeleton>
    </section>
  );
}
