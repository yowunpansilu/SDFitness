import { type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: 'up' | 'down';
    trendValue?: string;
    className?: string;
}

export function StatsCard({
    title,
    value,
    icon: Icon,
    trend,
    trendValue,
    className,
}: StatsCardProps) {
    return (
        <Card className={cn('glass-card border-dark-700 hover:border-primary-500/50 transition-all', className)}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-400">{title}</p>
                        <p className="text-3xl font-bold text-white mt-2">{value}</p>

                        {trend && trendValue && (
                            <div className="flex items-center gap-1 mt-2">
                                {trend === 'up' ? (
                                    <TrendingUp className="w-4 h-4 text-green-500" />
                                ) : (
                                    <TrendingDown className="w-4 h-4 text-red-500" />
                                )}
                                <span
                                    className={cn(
                                        'text-sm font-medium',
                                        trend === 'up' ? 'text-green-500' : 'text-red-500'
                                    )}
                                >
                                    {trendValue}
                                </span>
                                <span className="text-sm text-gray-500">vs last week</span>
                            </div>
                        )}
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-500/10">
                        <Icon className="h-6 w-6 text-primary-500" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
