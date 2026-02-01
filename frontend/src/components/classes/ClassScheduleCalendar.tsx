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
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-dark-800 p-4 rounded-lg border border-dark-700">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={view === 'week' ? handlePrevWeek : handlePrevDay}
                        className="text-gray-400 hover:text-white"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Button>

                    <div className="flex items-center gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-[240px] justify-start text-left font-normal bg-dark-900 border-dark-600 text-white hover:bg-dark-800",
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
                            <PopoverContent className="w-auto p-0 bg-dark-900 border-dark-700">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={(date) => date && onDateChange(date)}
                                    initialFocus
                                    className="bg-dark-900 text-white"
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={view === 'week' ? handleNextWeek : handleNextDay}
                        className="text-gray-400 hover:text-white"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                </div>

                <div className="flex items-center bg-dark-900 p-1 rounded-md border border-dark-600">
                    <Button
                        variant={view === 'week' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setView('week')}
                        className={cn(
                            view === 'week' ? "bg-primary-600 text-white" : "text-gray-400 hover:text-white"
                        )}
                    >
                        Week
                    </Button>
                    <Button
                        variant={view === 'day' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setView('day')}
                        className={cn(
                            view === 'day' ? "bg-primary-600 text-white" : "text-gray-400 hover:text-white"
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
                        .filter(c => isSameDay(new Date(c.startTime), day))
                        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

                    const isTodayDate = isToday(day);

                    return (
                        <div key={day.toISOString()} className={cn(
                            "flex flex-col gap-3 min-h-[200px]",
                            view === 'week' ? "border-t md:border-t-0 md:border-r border-dark-700 last:border-0 md:pr-4" : ""
                        )}>
                            <div className={cn(
                                "flex flex-col items-center justify-center p-2 rounded-lg mb-2",
                                isTodayDate ? "bg-primary-900/40 border border-primary-600/30" : "bg-dark-800/50"
                            )}>
                                <span className={cn(
                                    "text-xs font-semibold uppercase",
                                    isTodayDate ? "text-primary-400" : "text-gray-500"
                                )}>
                                    {format(day, "EEE")}
                                </span>
                                <span className={cn(
                                    "text-lg font-bold",
                                    isTodayDate ? "text-white" : "text-gray-300"
                                )}>
                                    {format(day, "d")}
                                </span>
                            </div>

                            <div className="flex flex-col gap-4 flex-1">
                                {loading ? (
                                    <div className="h-24 bg-dark-800 animate-pulse rounded-lg" />
                                ) : daysClasses.length > 0 ? (
                                    daysClasses.map(gymClass => (
                                        <ClassCard
                                            key={gymClass.id}
                                            gymClass={gymClass}
                                            onBook={onBookClass}
                                            userBooking={userBookings.find(b => b.classId === gymClass.id)}
                                            isPast={new Date(gymClass.startTime) < new Date()}
                                        />
                                    ))
                                ) : (
                                    <div className="flex-1 flex items-center justify-center text-center p-4 border-2 border-dashed border-dark-700 rounded-lg">
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
