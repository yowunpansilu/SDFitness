import { useAttendanceStore } from "@/lib/stores/attendanceStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, LogIn, LogOut, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { differenceInMinutes, parseISO } from "date-fns";

export function CheckInControl() {
    const { currentSession, checkIn, checkOut, isLoading } = useAttendanceStore();
    const [duration, setDuration] = useState(0);

    // Timer for current session
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;

        if (currentSession) {
            // Initial calc
            const start = parseISO(currentSession.checkInTime);
            setDuration(differenceInMinutes(new Date(), start));

            // Update every minute
            interval = setInterval(() => {
                setDuration(differenceInMinutes(new Date(), start));
            }, 60000);
        } else {
            setDuration(0);
        }

        return () => clearInterval(interval);
    }, [currentSession]);

    const formatDuration = (mins: number) => {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return `${h}h ${m}m`;
    };

    return (
        <Card className="h-full flex flex-col justify-between border-primary/20 bg-primary/5">
            <CardHeader>
                <CardTitle>Manual Check-In</CardTitle>
                <CardDescription>
                    {currentSession ? "You are currently checked in." : "Start your workout session manually."}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center flex-1 gap-6 pb-8">
                {currentSession ? (
                    <>
                        <div className="text-center animate-pulse">
                            <Clock className="w-12 h-12 mx-auto text-primary mb-2" />
                            <div className="text-4xl font-mono font-bold text-primary">
                                {formatDuration(duration)}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">Current Session</p>
                        </div>
                        <Button
                            size="lg"
                            variant="destructive"
                            className="w-full max-w-xs"
                            onClick={() => checkOut()}
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
                            Check Out
                        </Button>
                    </>
                ) : (
                    <>
                        <div className="text-center text-muted-foreground">
                            <p>Ready to workout?</p>
                        </div>
                        <Button
                            size="lg"
                            className="w-full max-w-xs"
                            onClick={() => checkIn('manual')}
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                            Check In Now
                        </Button>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
