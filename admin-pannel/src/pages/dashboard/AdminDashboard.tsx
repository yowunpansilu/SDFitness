import { Users, DollarSign, CreditCard, UserCheck, TrendingUp, TrendingDown, Calendar, Wrench, FileText, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

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
        <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm hover:bg-dark-900/70 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1 group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors">
                    {title}
                </CardTitle>
                <div className={cn(
                    "p-2 rounded-lg transition-all duration-300 group-hover:scale-110",
                    iconColor
                )}>
                    <Icon className="h-4 w-4 text-white" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-baseline justify-between">
                    <div className="text-3xl font-bold text-white">{value}</div>
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
                    <p className="text-xs text-gray-500 mt-1">
                        {trend === 'up' ? '↑' : '↓'} from last month
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

// Mock revenue data
const monthlyRevenueData = [
    { month: 'Jan', revenue: 42000, target: 40000 },
    { month: 'Feb', revenue: 38000, target: 42000 },
    { month: 'Mar', revenue: 45000, target: 43000 },
    { month: 'Apr', revenue: 48000, target: 45000 },
    { month: 'May', revenue: 52000, target: 48000 },
    { month: 'Jun', revenue: 45231, target: 50000 },
];

const yearlyRevenueData = [
    { month: '2023', revenue: 380000, target: 400000 },
    { month: '2024', revenue: 485000, target: 480000 },
    { month: '2025', revenue: 542000, target: 520000 },
];

// Mock equipment maintenance data
const equipmentMaintenanceAlerts = [
    { id: 1, name: 'Treadmill #3', status: 'overdue', daysUntil: -2, location: 'Cardio Zone' },
    { id: 2, name: 'Rowing Machine #1', status: 'this-week', daysUntil: 3, location: 'Main Floor' },
    { id: 3, name: 'Leg Press', status: 'upcoming', daysUntil: 12, location: 'Weight Room' },
];

export function AdminDashboard() {
    const navigate = useNavigate();
    const [revenueTimeRange, setRevenueTimeRange] = useState<'monthly' | 'yearly'>('monthly');
    const revenueData = revenueTimeRange === 'monthly' ? monthlyRevenueData : yearlyRevenueData;
    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    Dashboard Overview
                </h1>
                <p className="text-gray-400 mt-2">
                    Welcome back! Here's what's happening with your gym today.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Members"
                    value="1,234"
                    change={12}
                    trend="up"
                    icon={Users}
                    iconColor="bg-gradient-to-br from-blue-500 to-blue-600"
                />
                <StatCard
                    title="Active Memberships"
                    value="892"
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
                    value="156"
                    change={-5}
                    trend="down"
                    icon={UserCheck}
                    iconColor="bg-gradient-to-br from-orange-500 to-red-600"
                />
            </div>

            {/* Charts and Tables Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Revenue Chart */}
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-white">Revenue Overview</CardTitle>
                                <p className="text-sm text-gray-400">Track your revenue performance</p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant={revenueTimeRange === 'monthly' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setRevenueTimeRange('monthly')}
                                    className={cn(
                                        revenueTimeRange === 'monthly'
                                            ? 'bg-purple-600 hover:bg-purple-700'
                                            : 'border-dark-700 text-gray-400 hover:text-white hover:bg-dark-800'
                                    )}
                                >
                                    Monthly
                                </Button>
                                <Button
                                    variant={revenueTimeRange === 'yearly' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setRevenueTimeRange('yearly')}
                                    className={cn(
                                        revenueTimeRange === 'yearly'
                                            ? 'bg-purple-600 hover:bg-purple-700'
                                            : 'border-dark-700 text-gray-400 hover:text-white hover:bg-dark-800'
                                    )}
                                >
                                    Yearly
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="month" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        border: '1px solid #334155',
                                        borderRadius: '8px',
                                        color: '#fff',
                                    }}
                                    formatter={(value) => value ? [`$${value.toLocaleString()}`, 'Revenue'] : ['$0', 'Revenue']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#8b5cf6"
                                    strokeWidth={2}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Recent Registrations */}
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-white">Recent Registrations</CardTitle>
                        <p className="text-sm text-gray-400">New members this week</p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-4 p-3 rounded-lg bg-dark-950/50 hover:bg-dark-800/50 transition-colors"
                                >
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-semibold">
                                        JD
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-white">John Doe</p>
                                        <p className="text-xs text-gray-400">Premium Plan</p>
                                    </div>
                                    <div className="text-xs text-gray-500">2 hours ago</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Equipment Maintenance & Quick Actions */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Equipment Maintenance Alerts */}
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-white">Equipment Maintenance</CardTitle>
                        <p className="text-sm text-gray-400">Upcoming maintenance schedule</p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {equipmentMaintenanceAlerts.map((item) => {
                                const getStatusColor = (status: string) => {
                                    if (status === 'overdue') return 'text-red-400 bg-red-500/10 border-red-500/20';
                                    if (status === 'this-week') return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
                                    return 'text-green-400 bg-green-500/10 border-green-500/20';
                                };

                                const getStatusText = (daysUntil: number) => {
                                    if (daysUntil < 0) return `${Math.abs(daysUntil)} days overdue`;
                                    return `${daysUntil} days until due`;
                                };

                                return (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between p-3 rounded-lg bg-dark-950/50 hover:bg-dark-800/50 transition-colors cursor-pointer"
                                        onClick={() => navigate('/equipment')}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn('p-2 rounded-lg', getStatusColor(item.status))}>
                                                <Wrench className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-white">{item.name}</p>
                                                <p className="text-xs text-gray-500">{item.location}</p>
                                            </div>
                                        </div>
                                        <div className={cn('text-xs font-medium px-2 py-1 rounded-full border', getStatusColor(item.status))}>
                                            {getStatusText(item.daysUntil)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions Panel */}
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-white">Quick Actions</CardTitle>
                        <p className="text-sm text-gray-400">Common tasks and shortcuts</p>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                variant="outline"
                                className="h-auto flex-col gap-2 p-4 border-dark-700 hover:border-purple-500/50 hover:bg-dark-800 transition-all group"
                                onClick={() => navigate('/members')}
                            >
                                <UserPlus className="h-6 w-6 text-purple-400 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-medium text-gray-300 group-hover:text-white">Add Member</span>
                            </Button>
                            <Button
                                variant="outline"
                                className="h-auto flex-col gap-2 p-4 border-dark-700 hover:border-blue-500/50 hover:bg-dark-800 transition-all group"
                                onClick={() => navigate('/classes')}
                            >
                                <Calendar className="h-6 w-6 text-blue-400 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-medium text-gray-300 group-hover:text-white">Add Class</span>
                            </Button>
                            <Button
                                variant="outline"
                                className="h-auto flex-col gap-2 p-4 border-dark-700 hover:border-green-500/50 hover:bg-dark-800 transition-all group"
                                onClick={() => navigate('/payments')}
                            >
                                <DollarSign className="h-6 w-6 text-green-400 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-medium text-gray-300 group-hover:text-white">Record Payment</span>
                            </Button>
                            <Button
                                variant="outline"
                                className="h-auto flex-col gap-2 p-4 border-dark-700 hover:border-orange-500/50 hover:bg-dark-800 transition-all group"
                                onClick={() => navigate('/equipment')}
                            >
                                <Wrench className="h-6 w-6 text-orange-400 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-medium text-gray-300 group-hover:text-white">Add Equipment</span>
                            </Button>
                            <Button
                                variant="outline"
                                className="h-auto flex-col gap-2 p-4 border-dark-700 hover:border-pink-500/50 hover:bg-dark-800 transition-all group col-span-2"
                                onClick={() => navigate('/analytics')}
                            >
                                <FileText className="h-6 w-6 text-pink-400 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-medium text-gray-300 group-hover:text-white">View Reports</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>


            {/* Upcoming Classes */}
            <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-white">Upcoming Classes Today</CardTitle>
                    <p className="text-sm text-gray-400">Schedule for {new Date().toLocaleDateString()}</p>
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
                                className="p-4 rounded-lg bg-gradient-to-br from-dark-950/80 to-dark-900/50 border border-dark-800 hover:border-purple-500/30 transition-all duration-300 group"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors">
                                        {classItem.name}
                                    </h3>
                                    <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                        {classItem.time}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-400 mb-1">{classItem.trainer}</p>
                                <div className="flex items-center justify-between mt-3">
                                    <span className="text-xs text-gray-500">Spots Available</span>
                                    <span className="text-sm font-medium text-white">{classItem.spots}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
