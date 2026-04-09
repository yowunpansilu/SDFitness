import { AppSkeleton } from '../ui/AppSkeleton';

interface ActivityChartProps {
  data: { label: string; value: number }[];
  isLoading?: boolean;
}

export function ActivityChart({ data, isLoading = false }: ActivityChartProps) {
  const maxVal = Math.max(...data.map(d => d.value), 10); // Prevent division by zero

  const MOCK_BARS = isLoading ? [1,2,3,4,5,6,7] : data;

  return (
    <AppSkeleton name="activity-chart" loading={isLoading}>
      <div className="activity-chart" aria-label="Activity Chart for the week">
        <div className="activity-chart__header">
          <h3 className="activity-chart__title">Activity View</h3>
          <select className="activity-chart__select" aria-label="Timeframe">
            <option>This Week</option>
            <option>Last Week</option>
            <option>This Month</option>
          </select>
        </div>

        <div className="activity-chart__plot">
          {/* Y Axis Guide Lines */}
          <div className="activity-chart__guides">
            <div className="activity-chart__guide" />
            <div className="activity-chart__guide" />
            <div className="activity-chart__guide" />
          </div>

          {/* Bars */}
          <div className="activity-chart__bars flex items-end justify-between px-2 pt-8 h-full pb-6 z-10 relative">
            {MOCK_BARS.map((col: any, i) => {
              const height = isLoading ? '20%' : `${(col.value / maxVal) * 100}%`;
              const isToday = !isLoading && col.label === 'W'; // Mock Wednesday as today

              return (
                <div key={i} className="flex flex-col items-center gap-3 w-8">
                  {/* Bar */}
                  <div className="w-6 h-32 flex items-end justify-center rounded-lg bg-white/5 relative group">
                    <div 
                      className={`w-full rounded-lg transition-all duration-1000 ${isToday ? 'bg-brand shadow-[0_0_15px_rgba(109,40,217,0.4)]' : 'bg-ink-medium'}`}
                      style={{ height }}
                    />
                    
                    {/* Tooltip on active */}
                    {!isLoading && isToday && (
                      <div className="absolute -top-8 bg-white text-ink-strong text-xs font-bold px-2 py-1 rounded shadow-lg opacity-0 lg:group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {col.value} min
                      </div>
                    )}
                  </div>
                  {/* Label */}
                  <span className={`text-xs font-medium ${isToday ? 'text-white' : 'text-ink-muted'}`}>
                    {isLoading ? '-' : col.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppSkeleton>
  );
}
