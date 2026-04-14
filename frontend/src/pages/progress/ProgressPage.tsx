import { useMemberStats, useMemberProfile } from '../../hooks/queries/useMemberQueries';
import { useMemberBadges } from '../../hooks/queries/useBadgeQueries';
import { useAuthStore } from '@/lib/stores/authStore';
import { StatCard } from '../../components/progress/StatCard';
import { ActivityChart } from '../../components/progress/ActivityChart';
import { BadgeGrid } from '../../components/progress/BadgeGrid';
import { StreakCalendar } from '../../components/progress/StreakCalendar';

export function ProgressPage() {
  const { data: stats, isLoading: isStatsLoading, error } = useMemberStats();
  const { data: badges, isLoading: isBadgesLoading } = useMemberBadges();
  const { member } = useAuthStore();
  
  const isLoading = isStatsLoading || isBadgesLoading;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen px-6 text-center">
        <p className="text-red-400 mb-4">Critical failure in syncing progress data.</p>
        <button onClick={() => window.location.reload()} className="btn-brand">Retry</button>
      </div>
    );
  }

  const currentWeight = member?.currentWeight?.value || 0;
  const unit = member?.currentWeight?.unit || 'kg';
  
  // Mapping API stats to UI
  const displayStats = {
    weight: { value: currentWeight.toString(), unit, trend: 'neutral', trendValue: '--' },
    hours: { value: (stats?.totalHours || 0).toFixed(1), unit: 'hrs', trend: 'up', trendValue: '+5%' },
    count: { value: (stats?.totalWorkouts || 0).toString(), unit: 'workouts', trend: 'up', trendValue: '+1' },
    streak: { value: (stats?.streakDays || 0).toString(), unit: 'days', trend: 'neutral', trendValue: '--' }
  };

  const activityData = stats?.weeklyActivity || [
    { label: 'M', value: 0 },
    { label: 'T', value: 0 },
    { label: 'W', value: 0 },
    { label: 'T', value: 0 },
    { label: 'F', value: 0 },
    { label: 'S', value: 0 },
    { label: 'S', value: 0 },
  ];

  const displayBadges = badges?.map(b => ({
    id: b._id,
    name: b.name,
    icon: b.icon === 'Dumbbell' ? '🏋️' : b.icon === 'Flame' ? '🔥' : b.icon === 'Award' ? '🏆' : b.icon === 'Apple' ? '🍎' : '🎉',
    earned: true
  })) || [];

  return (
    <div className="pb-32 page-animate-in">
      <header className="px-6 py-6 pt-10">
        <h1 className="font-headline text-3xl font-bold text-white">Your Progress</h1>
        <p className="text-ink-muted mt-1">Consistency is key.</p>
      </header>

      {/* Stats Grid */}
      <section className="px-6 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <StatCard 
            label="Weight" 
            value={displayStats.weight.value} 
            unit={displayStats.weight.unit} 
            trend={displayStats.weight.trend as 'up' | 'down' | 'neutral'} 
            trendValue={displayStats.weight.trendValue} 
            isLoading={isLoading} 
          />
          <StatCard 
            label="Workout Time" 
            value={displayStats.hours.value} 
            unit={displayStats.hours.unit} 
            trend={displayStats.hours.trend as 'up' | 'down' | 'neutral'} 
            trendValue={displayStats.hours.trendValue} 
            isLoading={isLoading} 
          />
          <StatCard 
            label="Workouts" 
            value={displayStats.count.value} 
            unit={displayStats.count.unit}
            trend={displayStats.count.trend as 'up' | 'down' | 'neutral'} 
            trendValue={displayStats.count.trendValue} 
            isLoading={isLoading} 
          />
          <StatCard 
            label="Current Streak" 
            value={displayStats.streak.value} 
            unit={displayStats.streak.unit} 
            trend={displayStats.streak.trend as 'up' | 'down' | 'neutral'} 
            trendValue={displayStats.streak.trendValue} 
            isLoading={isLoading} 
          />
        </div>
      </section>

      {/* Activity Chart */}
      <section className="px-6 mb-8">
        <ActivityChart data={activityData} isLoading={isLoading} />
      </section>

      {/* Streak Calendar */}
      <section className="mb-6 px-6">
        <StreakCalendar isLoading={isLoading} />
      </section>

      {/* Milestones / Badges (Externalized Component) */}
      <section className="mb-8">
        <h2 className="px-6 section-title">Recent Badges</h2>
        <BadgeGrid badges={displayBadges} isLoading={isLoading} />
      </section>
    </div>
  );
}
