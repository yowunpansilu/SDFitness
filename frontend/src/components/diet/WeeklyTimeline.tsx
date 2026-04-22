import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DayData {
    dayName: string;
    date: number;
    progress: number; // 0 - 1
    isActive: boolean;
}

interface WeeklyTimelineProps {
    days: DayData[];
    onDaySelect: (index: number) => void;
    activeDay: number;
}

export function WeeklyTimeline({ days, onDaySelect, activeDay }: WeeklyTimelineProps) {
    return (
        <div className="relative group">
            <div className="flex gap-4 overflow-x-auto pb-6 pt-2 px-1 scrollbar-hide no-scrollbar snap-x snap-mandatory">
                {days.map((day, i) => (
                    <button
                        key={i}
                        onClick={() => onDaySelect(i)}
                        className={cn(
                            "snap-center flex flex-col items-center justify-between min-w-[100px] h-[140px] rounded-[1.5rem] border transition-all duration-300 transform hover:-translate-y-1",
                            activeDay === i
                                ? "bg-white border-primary-500 shadow-xl shadow-primary-900/10 text-primary-900 ring-4 ring-primary-50 ring-offset-0"
                                : "bg-white border-primary-50 text-muted-foreground hover:border-primary-200"
                        )}
                    >
                        <div className="pt-4 flex flex-col items-center">
                            <span className={cn(
                                "text-[10px] font-black uppercase tracking-widest mb-1",
                                activeDay === i ? "text-primary-600" : "text-muted-foreground"
                            )}>{day.dayName}</span>
                            <span className="text-2xl font-black">{day.date}</span>
                        </div>

                        {/* Circular Progress Arc */}
                        <div className="pb-4 relative">
                            <svg className="w-12 h-12 transform -rotate-90">
                                <circle
                                    cx="24"
                                    cy="24"
                                    r="18"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="transparent"
                                    className={cn(
                                        activeDay === i ? "text-primary-50" : "text-slate-50"
                                    )}
                                />
                                <circle
                                    cx="24"
                                    cy="24"
                                    r="18"
                                    stroke="#F59E0B"
                                    strokeWidth="4"
                                    fill="transparent"
                                    strokeDasharray={113}
                                    strokeDashoffset={113 - (113 * (day.progress || 0))}
                                    strokeLinecap="round"
                                />
                            </svg>
                            {/* Inner dot indicator */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className={cn(
                                    "w-1.5 h-1.5 rounded-full transition-all duration-500",
                                    activeDay === i ? "bg-primary-500 scale-125" : "bg-slate-200"
                                )} />
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Scroll indicator overlay */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white rounded-full shadow-lg p-2 border border-primary-50 cursor-pointer">
                    <ChevronRight className="w-5 h-5 text-primary-900" />
                </div>
            </div>
        </div>
    );
}
