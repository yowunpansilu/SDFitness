interface StreakProps {
  isLoading?: boolean;
}

export function StreakCalendar({ isLoading = false }: StreakProps) {
  // Generate mock heatmap data
  const cols = Array.from({ length: 14 }).map(() => {
    return Array.from({ length: 7 }).map(() => {
      // Randomly assign weights (0-4) for github style contribution
      return Math.floor(Math.random() * 5); 
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
