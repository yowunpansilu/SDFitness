import { type AttendanceStats as IAttendanceStats } from "@/lib/api/attendanceService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CalendarDays, Flame, Trophy } from "lucide-react";

interface Props {
    stats: IAttendanceStats;
}

export function AttendanceStats({ stats }: Props) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalVisits}</div>
                    <p className="text-xs text-muted-foreground">
                        Lifetime check-ins
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                    <Flame className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.currentStreak} Days</div>
                    <p className="text-xs text-muted-foreground">
                        Keep it up!
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Duration</CardTitle>
                    <Activity className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.avgDurationMinutes} min</div>
                    <p className="text-xs text-muted-foreground">
                        Per session
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Last Visit</CardTitle>
                    <Trophy className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {stats.lastVisitDate ? new Date(stats.lastVisitDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'N/A'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Come back soon!
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
