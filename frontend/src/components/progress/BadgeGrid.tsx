interface Badge {
  id: string | number;
  name: string;
  icon: string;
  earned: boolean;
}

interface BadgeGridProps {
  badges?: Badge[];
  isLoading?: boolean;
}

const DEFAULT_BADGES: Badge[] = [
  { id: 1, name: 'First Workout', icon: '🎉', earned: true },
  { id: 2, name: '3 Day Streak', icon: '🔥', earned: false },
  { id: 3, name: '100 Kg Club', icon: '🏋️', earned: false },
  { id: 4, name: 'Early Bird', icon: '🌅', earned: false },
  { id: 5, name: 'Marathon', icon: '🏃', earned: false },
  { id: 6, name: 'Iron Will', icon: '🛡️', earned: false },
];

export function BadgeGrid({ badges = DEFAULT_BADGES, isLoading = false }: BadgeGridProps) {
  return (
    <div className="badge-grid">
      {badges.map((badge) => (
        <div 
          key={badge.id} 
          className={`badge ${badge.earned ? 'badge--earned' : 'badge--locked'}`}
        >
          {isLoading ? (
            <>
              <div className="badge__icon-wrap bg-ink-faint animate-pulse" />
              <div className="h-2 bg-ink-faint rounded w-3/4 animate-pulse mt-2" />
            </>
          ) : (
            <>
              <div className="badge__icon-wrap">
                <span className="badge__icon">{badge.icon}</span>
              </div>
              <span className="badge__name">{badge.name}</span>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
