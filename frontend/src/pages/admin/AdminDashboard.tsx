import { Users, DollarSign, CreditCard, UserCheck, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Stat Card Component
interface StatCardProps {
    title: string;
    value: string | number;
    change?: number;
    icon: React.ElementType;
    trend?: 'up' | 'down';
    iconColor: string;
}

function StatCard({ title, value, change, icon: Icon, trend, iconColor }: StatCardProps) {
    return (
        <Card className="bg-background/50 border-border backdrop-blur-sm hover:bg-background/70 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1 group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-muted-foreground transition-colors">
                    {title}
                </CardTitle>
                <div className={cn(
                    "p-2 rounded-lg transition-all duration-300 group-hover:scale-110",
                    iconColor
                )}>
                    <Icon className="h-4 w-4 text-foreground" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-baseline justify-between">
                    <div className="text-3xl font-bold text-foreground">{value}</div>
                    {change !== undefined && (
                        <div className={cn(
                            "flex items-center gap-1 text-sm font-medium",
                            trend === 'up' ? 'text-green-400' : 'text-red-400'
                        )}>
                            {trend === 'up' ? (
                                <TrendingUp className="h-4 w-4" />
                            ) : (
                                <TrendingDown className="h-4 w-4" />
                            )}
                            <span>{Math.abs(change)}%</span>
                        </div>
                    )}
                </div>
                {change !== undefined && (
                    <p className="text-xs text-muted-foreground mt-1">
                        {trend === 'up' ? '↑' : '↓'} from last month
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

export function AdminDashboard() {
    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    Dashboard Overview
                </h1>
                <p className="text-muted-foreground mt-2">
                    Welcome back! Here's what's happening with your gym today.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Members"
                    value={1234}
                    change={12}
                    trend="up"
                    icon={Users}
                    iconColor="bg-gradient-to-br from-blue-500 to-blue-600"
                />
                <StatCard
                    title="Active Memberships"
                    value={892}
                    change={8}
                    trend="up"
                    icon={CreditCard}
                    iconColor="bg-gradient-to-br from-purple-500 to-pink-600"
                />
                <StatCard
                    title="Monthly Revenue"
                    value="$45,231"
                    change={23}
                    trend="up"
                    icon={DollarSign}
                    iconColor="bg-gradient-to-br from-green-500 to-emerald-600"
                />
                <StatCard
                    title="Today's Attendance"
                    value={156}
                    change={-5}
                    trend="down"
                    icon={UserCheck}
                    iconColor="bg-gradient-to-br from-orange-500 to-red-600"
                />
            </div>

            {/* Charts and Tables Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Revenue Chart Placeholder */}
                <Card className="bg-background/50 border-border backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-foreground">Revenue Overview</CardTitle>
                        <p className="text-sm text-muted-foreground">Monthly revenue for the past 6 months</p>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80 flex items-center justify-center bg-dark-950/50 rounded-lg border border-border">
                            <p className="text-muted-foreground">Chart will be implemented with Recharts</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Registrations */}
                <Card className="bg-background/50 border-border backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-foreground">Recent Registrations</CardTitle>
                        <p className="text-sm text-muted-foreground">New members this week</p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-4 p-3 rounded-lg bg-dark-950/50 hover:bg-card/50 transition-colors"
                                >
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-foreground font-semibold">
                                        JD
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-foreground">John Doe</p>
                                        <p className="text-xs text-muted-foreground">Premium Plan</p>
                                    </div>
                                    <div className="text-xs text-muted-foreground">2 hours ago</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Upcoming Classes */}
            <Card className="bg-background/50 border-border backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-foreground">Upcoming Classes Today</CardTitle>
                    <p className="text-sm text-muted-foreground">Schedule for {new Date().toLocaleDateString()}</p>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {[
                            { name: 'Yoga Flow', time: '10:00 AM', trainer: 'Sarah Johnson', spots: '8/15' },
                            { name: 'HIIT Training', time: '2:00 PM', trainer: 'Mike Ross', spots: '12/12' },
                            { name: 'Spin Class', time: '6:00 PM', trainer: 'Emma Wilson', spots: '5/20' },
                        ].map((classItem, i) => (
                            <div
                                key={i}
                                className="p-4 rounded-lg bg-gradient-to-br from-dark-950/80 to-dark-900/50 border border-border hover:border-purple-500/30 transition-all duration-300 group"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold text-foreground group-hover:text-purple-400 transition-colors">
                                        {classItem.name}
                                    </h3>
                                    <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                        {classItem.time}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground mb-1">{classItem.trainer}</p>
                                <div className="flex items-center justify-between mt-3">
                                    <span className="text-xs text-muted-foreground">Spots Available</span>
                                    <span className="text-sm font-medium text-foreground">{classItem.spots}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
