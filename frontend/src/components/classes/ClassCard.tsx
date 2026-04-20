
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
    isLive?: boolean;
}

export function ClassCard({ gymClass, onBook, userBooking, isPast, isLive }: ClassCardProps) {
    const isFull = gymClass.bookedCount >= gymClass.capacity;
    const isBooked = !!userBooking;
    const isFree = !gymClass.priceLKR || gymClass.priceLKR === 0;

    return (
        <Card className={cn(
            "bg-card border-border overflow-hidden hover:border-primary-600/50 transition-colors h-full flex flex-col",
            isPast && !isLive && "opacity-60"
        )}>
            <div className={cn("h-2 w-full", isLive ? "bg-emerald-500 animate-pulse" : "bg-primary-600")} />
            <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start gap-2">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="border-primary-600/50 text-primary-800 text-[10px] uppercase tracking-wider">
                                {gymClass.type}
                            </Badge>
                            {isLive && (
                                <Badge className="bg-emerald-500 text-white text-[10px] uppercase animate-pulse border-none">
                                    LIVE
                                </Badge>
                            )}
                        </div>
                        <h3 className="font-bold text-lg text-foreground leading-tight">{gymClass.name}</h3>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-2 flex-1 space-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-2 text-primary-500" />
                    {format(new Date(gymClass.startTime), "h:mm a")} • {gymClass.duration} min
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                    <User className="w-4 h-4 mr-2 text-primary-500" />
                    {gymClass.trainerName}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2 text-primary-500" />
                    {gymClass.location}
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Capacity</span>
                        <span className={isFull ? "text-red-400" : "text-green-400"}>
                            {gymClass.bookedCount} / {gymClass.capacity}
                        </span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
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
                    <Button variant="outline" className="w-full border-border text-muted-foreground" disabled>
                        Class Full
                    </Button>
                ) : (
                    <Button
                        variant="gym"
                        className="w-full"
                        onClick={() => onBook(gymClass)}
                        disabled={isPast}
                    >
                        {isFree ? 'Book Free' : `Pay LKR ${gymClass.priceLKR}`}
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
