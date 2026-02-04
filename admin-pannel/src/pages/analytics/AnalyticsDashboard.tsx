import { TrendingUp, Users, DollarSign, Activity, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';

// Mock data for charts (ready for chart integration)
const memberGrowthData = [
    { month: 'Jan', members: 145 },
    { month: 'Feb', members: 178 },
    { month: 'Mar', members: 212 },
    { month: 'Apr', members: 251 },
    { month: 'May', members: 289 },
    { month: 'Jun', members: 324 },
];

const revenueData = [
    { month: 'Jan', revenue: 12450 },
    { month: 'Feb', revenue: 15230 },
    { month: 'Mar', revenue: 18640 },
    { month: 'Apr', revenue: 21890 },
    { month: 'May', revenue: 24560 },
    { month: 'Jun', revenue: 28330 },
];

const classAttendanceData = [
    { class: 'Yoga', attendance: 87 },
    { class: 'HIIT', attendance: 92 },
    { class: 'Spin', attendance: 78 },
    { class: 'Strength', attendance: 85 },
    { class: 'Cardio', attendance: 81 },
];

const topTrainers = [
    { name: 'Sarah Johnson', rating: 4.9, sessions: 156, revenue: 12450 },
    { name: 'Mike Ross', rating: 4.8, sessions: 142, revenue: 11360 },
    { name: 'Emma Wilson', rating: 4.7, sessions: 138, revenue: 11040 },
    { name: 'David Chen', rating: 4.8, sessions: 135, revenue: 10800 },
];

const membershipBreakdown = [
    { plan: 'VIP', count: 142, percentage: 28, color: 'from-purple-500 to-pink-600' },
    { plan: 'Premium', count: 256, percentage: 51, color: 'from-blue-500 to-cyan-600' },
    { plan: 'Basic', count: 89, percentage: 18, color: 'from-green-500 to-emerald-600' },
    { plan: 'Student', count: 15, percentage: 3, color: 'from-orange-500 to-amber-600' },
];

export function AnalyticsDashboard() {
    const [timeRange, setTimeRange] = useState('6months');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Analytics & Reports
                    </h1>
                    <p className="text-gray-400 mt-2">
                        Track performance metrics and insights
                    </p>
                </div>
                <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-[180px] bg-dark-800/50 border-dark-700 text-white">
                        <Calendar className="h-4 w-4 mr-2" />
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-dark-900 border-dark-700">
                        <SelectItem value="1month">Last Month</SelectItem>
                        <SelectItem value="3months">Last 3 Months</SelectItem>
                        <SelectItem value="6months">Last 6 Months</SelectItem>
                        <SelectItem value="1year">Last Year</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-gray-400">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-green-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">$28,330</div>
                        <div className="flex items-center gap-1 mt-1">
                            <TrendingUp className="h-3 w-3 text-green-400" />
                            <span className="text-xs text-green-400">+15.3%</span>
                            <span className="text-xs text-gray-500">vs last period</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-gray-400">Active Members</CardTitle>
                            <Users className="h-4 w-4 text-blue-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">324</div>
                        <div className="flex items-center gap-1 mt-1">
                            <TrendingUp className="h-3 w-3 text-green-400" />
                            <span className="text-xs text-green-400">+12.1%</span>
                            <span className="text-xs text-gray-500">vs last period</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-gray-400">Avg Attendance</CardTitle>
                            <Activity className="h-4 w-4 text-purple-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">84.6%</div>
                        <div className="flex items-center gap-1 mt-1">
                            <TrendingUp className="h-3 w-3 text-green-400" />
                            <span className="text-xs text-green-400">+3.2%</span>
                            <span className="text-xs text-gray-500">vs last period</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-gray-400">Retention Rate</CardTitle>
                            <TrendingUp className="h-4 w-4 text-amber-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">92.3%</div>
                        <div className="flex items-center gap-1 mt-1">
                            <TrendingUp className="h-3 w-3 text-green-400" />
                            <span className="text-xs text-green-400">+1.8%</span>
                            <span className="text-xs text-gray-500">vs last period</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Member Growth */}
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-white">Member Growth</CardTitle>
                        <p className="text-sm text-gray-400">Monthly active members trend</p>
                    </CardHeader>
                    <CardContent>
                        {/* Placeholder for chart - ready for Recharts integration */}
                        <div className="space-y-3">
                            {memberGrowthData.map((data, index) => (
                                <div key={data.month} className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-400">{data.month}</span>
                                        <span className="text-white font-semibold">{data.members}</span>
                                    </div>
                                    <div className="w-full bg-dark-800 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-blue-500 to-cyan-600 h-2 rounded-full transition-all"
                                            style={{ width: `${(data.members / 350) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Revenue Trend */}
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-white">Revenue Trend</CardTitle>
                        <p className="text-sm text-gray-400">Monthly revenue performance</p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {revenueData.map((data) => (
                                <div key={data.month} className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-400">{data.month}</span>
                                        <span className="text-white font-semibold">${data.revenue.toLocaleString()}</span>
                                    </div>
                                    <div className="w-full bg-dark-800 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all"
                                            style={{ width: `${(data.revenue / 30000) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Additional Analytics */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Class Attendance */}
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-white">Class Attendance Rates</CardTitle>
                        <p className="text-sm text-gray-400">Average attendance by class type</p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {classAttendanceData.map((data) => (
                                <div key={data.class}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-white font-medium">{data.class}</span>
                                        <span className="text-gray-400">{data.attendance}%</span>
                                    </div>
                                    <div className="w-full bg-dark-800 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full transition-all"
                                            style={{ width: `${data.attendance}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Membership Breakdown */}
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-white">Membership Distribution</CardTitle>
                        <p className="text-sm text-gray-400">Active members by plan type</p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {membershipBreakdown.map((data) => (
                                <div key={data.plan}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Badge className={`bg-gradient-to-r ${data.color} text-white`}>
                                                {data.plan}
                                            </Badge>
                                            <span className="text-gray-400 text-sm">{data.count} members</span>
                                        </div>
                                        <span className="text-white font-semibold">{data.percentage}%</span>
                                    </div>
                                    <div className="w-full bg-dark-800 rounded-full h-2">
                                        <div
                                            className={`bg-gradient-to-r ${data.color} h-2 rounded-full transition-all`}
                                            style={{ width: `${data.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Top Performers */}
            <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-white">Top Performing Trainers</CardTitle>
                    <p className="text-sm text-gray-400">Based on sessions and revenue this period</p>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {topTrainers.map((trainer, index) => (
                            <div
                                key={trainer.name}
                                className="flex items-center justify-between p-4 rounded-lg bg-dark-800/50 border border-dark-700"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold">{trainer.name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                                                ⭐ {trainer.rating}
                                            </Badge>
                                            <span className="text-sm text-gray-400">{trainer.sessions} sessions</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-white font-semibold">${trainer.revenue.toLocaleString()}</p>
                                    <p className="text-sm text-gray-400">Revenue</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
