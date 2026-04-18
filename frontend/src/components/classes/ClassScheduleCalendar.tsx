import { useState } from "react";
import { format, addDays, startOfWeek, isSameDay, isToday } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { ClassCard } from "./ClassCard";
import type { GymClass, Booking } from "@/lib/api/classService";

interface ClassScheduleCalendarProps {
    classes: GymClass[];
    userBookings: Booking[];
    selectedDate: Date;
    onDateChange: (date: Date) => void;
    onBookClass: (gymClass: GymClass) => void;
    loading?: boolean;
}

export function ClassScheduleCalendar({
    classes,
    userBookings,
    selectedDate,
    onDateChange,
    onBookClass,
    loading
}: ClassScheduleCalendarProps) {
    const [view, setView] = useState<'week' | 'day'>('week');

    // Get the start of the current week (assuming Monday start?)
    // date-fns startOfWeek defaults to Sunday unless specified. Let's use Monday.
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    const handlePrevWeek = () => onDateChange(addDays(selectedDate, -7));
    const handleNextWeek = () => onDateChange(addDays(selectedDate, 7));
    const handlePrevDay = () => onDateChange(addDays(selectedDate, -1));
    const handleNextDay = () => onDateChange(addDays(selectedDate, 1));

    const daysToShow = view === 'week' ? weekDays : [selectedDate];

    return (
        <div className="space-y-6">
            {/* Calendar Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-card p-4 rounded-lg border border-border">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={view === 'week' ? handlePrevWeek : handlePrevDay}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Button>

                    <div className="flex items-center gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-[240px] justify-start text-left font-normal bg-background border-border text-foreground hover:bg-card",
                                        !selectedDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {view === 'week' ? (
                                        <span>
                                            {format(weekStart, "MMM d")} - {format(addDays(weekStart, 6), "MMM d, yyyy")}
                                        </span>
                                    ) : (
                                        format(selectedDate, "PPP")
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-background border-border">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={(date) => date && onDateChange(date)}
                                    initialFocus
                                    className="bg-background text-foreground"
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={view === 'week' ? handleNextWeek : handleNextDay}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDateChange(new Date())}
                        className="ml-2 bg-background border-border text-foreground hover:bg-card"
                    >
                        Today
                    </Button>
                </div>

                <div className="flex items-center bg-background p-1 rounded-md border border-border">
                    <Button
                        variant={view === 'week' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setView('week')}
                        className={cn(
                            view === 'week' ? "bg-primary-600 text-white" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Week
                    </Button>
                    <Button
                        variant={view === 'day' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setView('day')}
                        className={cn(
                            view === 'day' ? "bg-primary-600 text-white" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Day
                    </Button>
                </div>
            </div>

            {/* Schedule Grid */}
            <div className={cn(
                "grid gap-4",
                view === 'week' ? "grid-cols-1 md:grid-cols-7" : "grid-cols-1"
            )}>
                {daysToShow.map((day) => {
                    const daysClasses = classes
                        .map(c => {
                            // If we have a recurring schedule, calculate the date for THIS specific day
                            if (c.schedule && c.schedule.dayOfWeek) {
                                const currentDayName = format(day, "EEEE");
                                if (c.schedule.dayOfWeek.trim().toLowerCase() === currentDayName.toLowerCase()) {
                                    // Set the time from schedule
                                    const timeStr = c.schedule.startTime || "09:00";
                                    let [hours, minutes] = [0, 0];
                                    
                                    if (timeStr.toLowerCase().includes('am') || timeStr.toLowerCase().includes('pm')) {
                                        // Handle 12h format
                                        const match = timeStr.match(/(\d+):(\d+)\s*(am|pm)/i);
                                        if (match) {
                                            hours = parseInt(match[1]);
                                            minutes = parseInt(match[2]);
                                            const ampm = match[3].toLowerCase();
                                            if (ampm === 'pm' && hours < 12) hours += 12;
                                            if (ampm === 'am' && hours === 12) hours = 0;
                                        }
                                    } else {
                                        // Handle 24h format
                                        [hours, minutes] = timeStr.split(':').map(Number);
                                    }
                                    
                                    const classDate = new Date(day);
                                    classDate.setHours(hours || 0, minutes || 0, 0, 0);
                                    return { ...c, startTime: classDate.toISOString() };
                                }
                                return null;
                            }
                            // Otherwise fallback to existing isSameDay check
                            // Only if it's not a recurring class that didn't match today
                            return (c.startTime && isSameDay(new Date(c.startTime), day)) ? c : null;
                        })
                        .filter((c): c is GymClass => c !== null)
                        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

                    const isTodayDate = isToday(day);

                    return (
                        <div key={day.toISOString()} className={cn(
                            "flex flex-col gap-3 min-h-[200px]",
                            view === 'week' ? "border-t md:border-t-0 md:border-r border-border last:border-0 md:pr-4" : ""
                        )}>
                            <div className={cn(
                                "flex flex-col items-center justify-center p-2 rounded-lg mb-2",
                                isTodayDate ? "bg-primary-900/40 border border-primary-600/30" : "bg-card/50"
                            )}>
                                <span className={cn(
                                    "text-xs font-semibold uppercase",
                                    isTodayDate ? "text-primary-800" : "text-muted-foreground"
                                )}>
                                    {format(day, "EEE")}
                                </span>
                                <span className={cn(
                                    "text-lg font-bold",
                                    isTodayDate ? "text-foreground" : "text-muted-foreground"
                                )}>
                                    {format(day, "d")}
                                </span>
                            </div>

                            <div className="flex flex-col gap-4 flex-1">
                                {loading ? (
                                    <div className="h-24 bg-card animate-pulse rounded-lg" />
                                ) : daysClasses.length > 0 ? (
                                    daysClasses.map(gymClass => {
                                        const startTime = new Date(gymClass.startTime).getTime();
                                        const endTime = startTime + gymClass.duration * 60 * 1000;
                                        const now = new Date().getTime();
                                        const isPast = endTime < now;
                                        const isLive = now >= startTime && now <= endTime;

                                        return (
                                            <ClassCard
                                                key={gymClass.id}
                                                gymClass={gymClass}
                                                onBook={onBookClass}
                                                userBooking={userBookings.find(b => b.classId === gymClass.id)}
                                                isPast={isPast}
                                                isLive={isLive}
                                            />
                                        );
                                    })
                                ) : (
                                    <div className="flex-1 flex items-center justify-center text-center p-4 border-2 border-dashed border-border rounded-lg">
                                        <p className="text-xs text-gray-600">No classes</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
