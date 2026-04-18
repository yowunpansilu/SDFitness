import { type AttendanceRecord } from "@/lib/api/attendanceService";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { parseISO } from "date-fns";

interface Props {
    history: AttendanceRecord[];
}

export function AttendanceCalendar({ history }: Props) {
    // Extract dates from history for highlighting
    const attendedDates = history.map(record => parseISO(record.checkInTime));

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Attendance History</CardTitle>
                <CardDescription>Your check-in history for this month.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
                <Calendar
                    mode="multiple"
                    selected={attendedDates}
                    className="rounded-md border shadow-sm"
                    components={{
                        // Optional: Custom Day rendering if needed, but 'selected' prop handles basic highlighting
                    }}
                    modifiersStyles={{
                        selected: {
                            backgroundColor: "hsl(var(--primary))",
                            color: "hsl(var(--primary-foreground))",
                            fontWeight: "bold"
                        }
                    }}
                />
            </CardContent>
        </Card>
    );
}
