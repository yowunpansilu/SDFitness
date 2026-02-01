import { useEffect } from "react";
import { useAttendanceStore } from "@/lib/stores/attendanceStore";
import { AttendanceStats } from "@/components/attendance/AttendanceStats";
import { CheckInControl } from "@/components/attendance/CheckInControl";
import { QRCodeCard } from "@/components/attendance/QRCodeCard";
import { AttendanceCalendar } from "@/components/attendance/AttendanceCalendar";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function AttendancePage() {
    const { fetchHistory, history, stats, isLoading, error } = useAttendanceStore();

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    if (isLoading && !stats) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Attendance & Check-in</h1>
                <p className="text-muted-foreground mt-1">
                    Manage your gym visits, track your stats, and check in.
                </p>
            </div>

            {stats && <AttendanceStats stats={stats} />}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="md:col-span-1 lg:col-span-1">
                    <CheckInControl />
                </div>
                <div className="md:col-span-1 lg:col-span-1">
                    <QRCodeCard />
                </div>
                <div className="md:col-span-2 lg:col-span-1 h-[400px]">
                    <AttendanceCalendar history={history} />
                </div>
            </div>
        </div>
    );
}
