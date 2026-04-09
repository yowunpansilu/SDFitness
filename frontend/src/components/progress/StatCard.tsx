import { AppSkeleton } from '../ui/AppSkeleton';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  isLoading?: boolean;
}

export function StatCard({ label, value, unit, trend, trendValue, isLoading = false }: StatCardProps) {
  return (
    <AppSkeleton name={`stat-${label.toLowerCase().replace(' ', '-')}`} loading={isLoading}>
      <div className="stat-card">
        <p className="stat-card__label">{label}</p>
        
        <div className="flex items-end gap-1 mt-1 mb-3">
          <span className="stat-card__value">{value}</span>
          {unit && <span className="stat-card__unit mb-1">{unit}</span>}
        </div>

        {trend && (
          <div className={`stat-card__trend stat-card__trend--${trend}`}>
            <div className="stat-card__trend-icon">
              {trend === 'up' && <TrendingUp size={12} strokeWidth={3} />}
              {trend === 'down' && <TrendingDown size={12} strokeWidth={3} />}
              {trend === 'neutral' && <Minus size={12} strokeWidth={3} />}
            </div>
            <span>{trendValue}</span>
          </div>
        )}
      </div>
    </AppSkeleton>
  );
}
