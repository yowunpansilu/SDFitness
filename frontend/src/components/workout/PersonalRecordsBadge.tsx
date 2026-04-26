import { Trophy, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { PersonalRecord } from '@/lib/api/workoutApi';
import { format } from 'date-fns';

interface PersonalRecordsBadgeProps {
    record: PersonalRecord;
    showDate?: boolean;
    animated?: boolean;
}

export function PersonalRecordsBadge({ record, showDate = false, animated = true }: PersonalRecordsBadgeProps) {
    const getRecordTypeLabel = (type: string) => {
        switch (type) {
            case 'max_weight':
                return 'Max Weight';
            case 'max_reps':
                return 'Max Reps';
            case 'longest_duration':
                return 'Longest Duration';
            default:
                return type;
        }
    };

    const getRecordValue = (record: PersonalRecord) => {
        switch (record.recordType) {
            case 'max_weight':
                return `${record.value} kg`;
            case 'max_reps':
                return `${record.value} reps`;
            case 'longest_duration':
                return `${record.value}s`;
            default:
                return record.value.toString();
        }
    };

    return (
        <div className={`relative ${animated ? 'animate-pulse-slow' : ''}`}>
            <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 dark:text-yellow-400 px-3 py-1.5">
                <Trophy className="w-3.5 h-3.5 mr-1.5 fill-current" />
                <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold">
                        {record.exerciseName || 'Exercise'} - {getRecordTypeLabel(record.recordType)}
                    </span>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{getRecordValue(record)}</span>
                        <TrendingUp className="w-3 h-3" />
                    </div>
                    {showDate && (
                        <span className="text-xs text-yellow-600/70 dark:text-yellow-500/70">
                            {format(new Date(record.achievedAt), 'MMM dd, yyyy')}
                        </span>
                    )}
                </div>
            </Badge>

            {animated && (
                <div className="absolute inset-0 bg-yellow-500/10 rounded-full blur-xl -z-10 animate-pulse" />
            )}
        </div>
    );
}
