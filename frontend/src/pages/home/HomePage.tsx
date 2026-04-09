import { useMemberStats } from '../../hooks/queries/useMemberQueries';
import { GreetingHero } from '../../components/home/GreetingHero';
import { BentoGrid } from '../../components/home/BentoGrid';
import { QuickStartCard } from '../../components/home/QuickStartCard';
import { ChevronRight, Check } from 'lucide-react';

export function HomePage() {
  const { data: stats, isLoading, error } = useMemberStats();

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen px-6 text-center">
        <p className="text-red-400 mb-4">Something went wrong. Please try again.</p>
        <button onClick={() => window.location.reload()} className="btn-brand">Retry</button>
      </div>
    );
  }

  return (
    <div className="pb-32 page-animate-in">
      <GreetingHero />
      <BentoGrid isLoading={isLoading} stats={stats} />
      <QuickStartCard isLoading={isLoading} />

      {/* Recent Activity Section */}
      <section className="home-section">
        <div className="home-section__header flex justify-between items-center mb-4">
          <h2 className="section-title mb-0">Weekly Activity</h2>
          <button className="home-section__see-all text-brand font-semibold text-sm">History</button>
        </div>

        <div className="streak-row card p-4 flex justify-between gap-2 overflow-x-auto scrollbar-hide">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
            const today = new Date().getDay();
            const dayIndex = i === 6 ? 0 : i + 1; // Adjust for Sunday=0
            const isToday = today === dayIndex;
            const isDone = dayIndex < today && dayIndex !== 0; // Simple mock for "done"

            return (
              <div key={i} className={`streak-day ${isDone ? 'streak-day--done' : isToday ? 'streak-day--today' : 'streak-day--rest'}`}>
                <div className="streak-day__circle transition-all duration-300">
                  {isDone ? <Check size={16} strokeWidth={3} /> : day}
                </div>
                <span className={`streak-day__label ${isToday ? 'font-bold text-ink-strong' : ''}`}>{day}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Discover Quick Link */}
      <section className="home-section">
        <div className="card-interactive flex items-center justify-between p-4 bg-brand-light/20 border-white/5 border backdrop-blur-xl">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 rounded-xl bg-white/10 text-brand flex items-center justify-center shadow-lg text-xl backdrop-blur-md">
              🎯
            </div>
            <div>
              <h3 className="font-headline font-bold text-ink-strong text-lg">New Programs</h3>
              <p className="text-sm text-ink-muted">Explore fresh workouts</p>
            </div>
          </div>
          <ChevronRight className="text-brand mr-2" />
        </div>
      </section>
    </div>
  );
}
