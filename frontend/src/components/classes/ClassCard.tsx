
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import type { GymClass, Booking } from "@/lib/api/classService";
import { Clock, MapPin, User } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ClassCardProps {
    gymClass: GymClass;
    onBook: (gymClass: GymClass) => void;
    userBooking?: Booking;
    isPast?: boolean;
}

export function ClassCard({ gymClass, onBook, userBooking, isPast }: ClassCardProps) {
    const isFull = gymClass.bookedCount >= gymClass.capacity;
    const isBooked = !!userBooking;

    return (
        <Card className={cn(
            "bg-dark-800 border-dark-700 overflow-hidden hover:border-primary-600/50 transition-colors h-full flex flex-col",
            isPast && "opacity-60"
        )}>
            <div className="h-2 bg-primary-600 w-full" />
            <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start gap-2">
                    <div className="space-y-1">
                        <Badge variant="outline" className="border-primary-600/50 text-primary-400 text-[10px] uppercase tracking-wider">
                            {gymClass.type}
                        </Badge>
                        <h3 className="font-bold text-lg text-white leading-tight">{gymClass.name}</h3>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-2 flex-1 space-y-3">
                <div className="flex items-center text-sm text-gray-400">
                    <Clock className="w-4 h-4 mr-2 text-primary-500" />
                    {format(new Date(gymClass.startTime), "h:mm a")} • {gymClass.duration} min
                </div>
                <div className="flex items-center text-sm text-gray-400">
                    <User className="w-4 h-4 mr-2 text-primary-500" />
                    {gymClass.trainerName}
                </div>
                <div className="flex items-center text-sm text-gray-400">
                    <MapPin className="w-4 h-4 mr-2 text-primary-500" />
                    {gymClass.location}
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-400">
                        <span>Capacity</span>
                        <span className={isFull ? "text-red-400" : "text-green-400"}>
                            {gymClass.bookedCount} / {gymClass.capacity}
                        </span>
                    </div>
                    <div className="h-1.5 w-full bg-dark-700 rounded-full overflow-hidden">
                        <div
                            className={cn("h-full rounded-full", isFull ? "bg-red-500" : "bg-primary-500")}
                            style={{ width: `${Math.min((gymClass.bookedCount / gymClass.capacity) * 100, 100)}% ` }}
                        />
                    </div>
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                {isBooked ? (
                    <Button variant="outline" className="w-full border-green-600 text-green-500 hover:text-green-400 bg-green-500/10 hover:bg-green-500/20" disabled>
                        Booked
                    </Button>
                ) : isFull ? (
                    <Button variant="outline" className="w-full border-dark-600 text-gray-500" disabled>
                        Class Full
                    </Button>
                ) : (
                    <Button
                        variant="gym"
                        className="w-full"
                        onClick={() => onBook(gymClass)}
                        disabled={isPast}
                    >
                        Book Now
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
