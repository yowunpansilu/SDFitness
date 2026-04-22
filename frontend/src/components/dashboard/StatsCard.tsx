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
    trendColor?: 'green' | 'red' | 'neutral';
    className?: string;
}

export function StatsCard({
    title,
    value,
    icon: Icon,
    trend,
    trendValue,
    trendColor = 'green',
    className,
}: StatsCardProps) {
    return (
        <Card className={cn('glass-card border-border hover:border-primary-500/50 transition-all', className)}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <p className="text-3xl font-bold text-foreground mt-2">{value}</p>

                        {trend && trendValue && (
                            <div className="flex items-center gap-1 mt-2">
                                {trend === 'up' ? (
                                    <TrendingUp className={cn("w-4 h-4", trendColor === 'red' ? 'text-red-500' : 'text-green-500')} />
                                ) : (
                                    <TrendingDown className={cn("w-4 h-4", trendColor === 'red' ? 'text-red-500' : 'text-green-500')} />
                                )}
                                <span
                                    className={cn(
                                        'text-sm font-medium',
                                        trendColor === 'red' ? 'text-red-500' : 'text-green-500'
                                    )}
                                >
                                    {trendValue}
                                </span>
                                <span className="text-sm text-muted-foreground">vs last week</span>
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
