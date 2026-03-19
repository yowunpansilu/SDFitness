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
import {
    AreaChart,
    Area,
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

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

// Colors for pie chart
const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'];

export function AnalyticsDashboard() {
    const [timeRange, setTimeRange] = useState('6months');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white dark:bg-gradient-to-r dark:from-white dark:to-gray-400 dark:bg-clip-text dark:text-transparent">
                        Analytics & Reports
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        Track performance metrics and insights
                    </p>
                </div>
                <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-[180px] bg-white dark:bg-dark-800/50 border-gray-200 dark:border-dark-700 text-gray-900 dark:text-white">
                        <Calendar className="h-4 w-4 mr-2" />
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-dark-900 border-gray-200 dark:border-dark-700 text-gray-900 dark:text-white">
                        <SelectItem value="1month">Last Month</SelectItem>
                        <SelectItem value="3months">Last 3 Months</SelectItem>
                        <SelectItem value="6months">Last 6 Months</SelectItem>
                        <SelectItem value="1year">Last Year</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card className="bg-white dark:bg-dark-900/50 border-gray-200 dark:border-dark-800 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">$28,330</div>
                        <div className="flex items-center gap-1 mt-1">
                            <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                            <span className="text-xs text-green-600 dark:text-green-400">+15.3%</span>
                            <span className="text-xs text-gray-400 dark:text-gray-500">vs last period</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-dark-900/50 border-gray-200 dark:border-dark-800 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Members</CardTitle>
                            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">324</div>
                        <div className="flex items-center gap-1 mt-1">
                            <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                            <span className="text-xs text-green-600 dark:text-green-400">+12.1%</span>
                            <span className="text-xs text-gray-400 dark:text-gray-500">vs last period</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-dark-900/50 border-gray-200 dark:border-dark-800 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Attendance</CardTitle>
                            <Activity className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">84.6%</div>
                        <div className="flex items-center gap-1 mt-1">
                            <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                            <span className="text-xs text-green-600 dark:text-green-400">+3.2%</span>
                            <span className="text-xs text-gray-400 dark:text-gray-500">vs last period</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-dark-900/50 border-gray-200 dark:border-dark-800 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Retention Rate</CardTitle>
                            <TrendingUp className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">92.3%</div>
                        <div className="flex items-center gap-1 mt-1">
                            <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                            <span className="text-xs text-green-600 dark:text-green-400">+1.8%</span>
                            <span className="text-xs text-gray-400 dark:text-gray-500">vs last period</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Member Growth */}
                <Card className="bg-white dark:bg-dark-900/50 border-gray-200 dark:border-dark-800 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-gray-900 dark:text-white">Member Growth</CardTitle>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Monthly active members trend</p>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={memberGrowthData}>
                                <defs>
                                    <linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
                                <XAxis dataKey="month" stroke="#64748b" />
                                <YAxis stroke="#64748b" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--tooltip-bg, #fff)',
                                        border: '1px solid var(--tooltip-border, #e2e8f0)',
                                        borderRadius: '8px',
                                        color: 'var(--tooltip-text, #1e293b)',
                                    }}
                                />
                                <Area type="monotone" dataKey="members" stroke="#3b82f6" strokeWidth={2} fill="url(#colorMembers)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Revenue Trend */}
                <Card className="bg-white dark:bg-dark-900/50 border-gray-200 dark:border-dark-800 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-gray-900 dark:text-white">Revenue Trend</CardTitle>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Monthly revenue performance</p>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
                                <XAxis dataKey="month" stroke="#64748b" />
                                <YAxis stroke="#64748b" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--tooltip-bg, #fff)',
                                        border: '1px solid var(--tooltip-border, #e2e8f0)',
                                        borderRadius: '8px',
                                        color: 'var(--tooltip-text, #1e293b)',
                                    }}
                                    formatter={(value) => value ? [`$${value.toLocaleString()}`, 'Revenue'] : ['$0', 'Revenue']}
                                />
                                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Additional Analytics */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Class Attendance */}
                <Card className="bg-white dark:bg-dark-900/50 border-gray-200 dark:border-dark-800 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-gray-900 dark:text-white">Class Attendance Rates</CardTitle>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Average attendance by class type</p>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={classAttendanceData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
                                <XAxis dataKey="class" stroke="#64748b" />
                                <YAxis stroke="#64748b" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--tooltip-bg, #fff)',
                                        border: '1px solid var(--tooltip-border, #e2e8f0)',
                                        borderRadius: '8px',
                                        color: 'var(--tooltip-text, #1e293b)',
                                    }}
                                    formatter={(value: any) => [`${value}%`, 'Attendance']}
                                />
                                <Bar dataKey="attendance" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Membership Breakdown */}
                <Card className="bg-white dark:bg-dark-900/50 border-gray-200 dark:border-dark-800 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-gray-900 dark:text-white">Membership Distribution</CardTitle>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Active members by plan type</p>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={membershipBreakdown}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={(props: any) => {
                                        const { plan, percentage } = props.payload || {};
                                        return plan && percentage ? `${plan}: ${percentage}%` : '';
                                    }}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="count"
                                >
                                    {membershipBreakdown.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        border: '1px solid #334155',
                                        borderRadius: '8px',
                                        color: '#fff',
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Top Performers */}
            <Card className="bg-white dark:bg-dark-900/50 border-gray-200 dark:border-dark-800 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Top Performing Trainers</CardTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Based on sessions and revenue this period</p>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {topTrainers.map((trainer, index) => (
                            <div
                                key={trainer.name}
                                className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-dark-800/50 border border-gray-200 dark:border-dark-700"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="text-gray-900 dark:text-white font-semibold">{trainer.name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge className="bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30">
                                                ⭐ {trainer.rating}
                                            </Badge>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">{trainer.sessions} sessions</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-gray-900 dark:text-white font-semibold">${trainer.revenue.toLocaleString()}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Revenue</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
