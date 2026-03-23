import { useState, useEffect } from 'react';
import { Users, DollarSign, CreditCard, UserCheck, TrendingUp, TrendingDown, Calendar, Wrench, FileText, UserPlus, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api/axios';

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
        <Card className="bg-white dark:bg-dark-900/50 border-gray-200 dark:border-dark-800 backdrop-blur-sm hover:bg-gray-50 dark:hover:bg-dark-900/70 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1 group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
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
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">{value}</div>
                    {change !== undefined && (
                        <div className={cn(
                            "flex items-center gap-1 text-sm font-medium",
                            trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
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
            </CardContent>
        </Card>
    );
}

// Revenue data for chart
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

interface DashboardData {
    members: any[];
    trainers: any[];
    classes: any[];
    equipment: any[];
    plans: any[];
}

export function AdminDashboard() {
    const navigate = useNavigate();
    const [revenueTimeRange, setRevenueTimeRange] = useState<'monthly' | 'yearly'>('monthly');
    const [data, setData] = useState<DashboardData>({ members: [], trainers: [], classes: [], equipment: [], plans: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [membersRes, trainersRes, classesRes, equipmentRes, plansRes] = await Promise.allSettled([
                    api.get('/members'),
                    api.get('/trainers'),
                    api.get('/classes'),
                    api.get('/equipment'),
                    api.get('/membership/plans'),
                ]);
                setData({
                    members: membersRes.status === 'fulfilled' ? membersRes.value.data : [],
                    trainers: trainersRes.status === 'fulfilled' ? trainersRes.value.data : [],
                    classes: classesRes.status === 'fulfilled' ? classesRes.value.data : [],
                    equipment: equipmentRes.status === 'fulfilled' ? equipmentRes.value.data : [],
                    plans: plansRes.status === 'fulfilled' ? plansRes.value.data : [],
                });
            } catch (err) {
                console.error('Failed to fetch dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const revenueData = revenueTimeRange === 'monthly' ? monthlyRevenueData : yearlyRevenueData;

    const activeMembers = data.members.filter((m: any) => m.status === 'active').length;
    // const maintenanceEquipment = data.equipment.filter((e: any) => e.status === 'maintenance' || e.status === 'out_of_order');

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                <span className="ml-3 text-gray-400">Loading dashboard...</span>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Dashboard Overview
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Welcome back! Here's what's happening with your gym today.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Members"
                    value={data.members.length}
                    icon={Users}
                    iconColor="bg-gradient-to-br from-blue-500 to-blue-600"
                />
                <StatCard
                    title="Active Members"
                    value={activeMembers}
                    icon={CreditCard}
                    iconColor="bg-gradient-to-br from-purple-500 to-pink-600"
                />
                <StatCard
                    title="Total Trainers"
                    value={data.trainers.length}
                    icon={UserCheck}
                    iconColor="bg-gradient-to-br from-green-500 to-emerald-600"
                />
                <StatCard
                    title="Total Classes"
                    value={data.classes.length}
                    icon={Calendar}
                    iconColor="bg-gradient-to-br from-orange-500 to-red-600"
                />
            </div>

            {/* Charts and Tables Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Revenue Chart */}
                <Card className="bg-white dark:bg-dark-900/50 border-gray-200 dark:border-dark-800 backdrop-blur-sm">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-gray-900 dark:text-white">Revenue Overview</CardTitle>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Track your revenue performance</p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant={revenueTimeRange === 'monthly' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setRevenueTimeRange('monthly')}
                                    className={cn(
                                        revenueTimeRange === 'monthly'
                                            ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                            : 'border-gray-200 dark:border-dark-700 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-800'
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
                                            ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                            : 'border-gray-200 dark:border-dark-700 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-800'
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
                                    formatter={(value: any) => value ? [`$${value.toLocaleString()}`, 'Revenue'] : ['$0', 'Revenue']}
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

                {/* Recent Members */}
                <Card className="bg-white dark:bg-dark-900/50 border-gray-200 dark:border-dark-800 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-gray-900 dark:text-white">Recent Members</CardTitle>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Latest registered members</p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {data.members.slice(0, 5).map((member: any, i: number) => (
                                <div
                                    key={member._id || i}
                                    className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-dark-950/50 hover:bg-gray-100 dark:hover:bg-dark-800/50 transition-colors cursor-pointer"
                                    onClick={() => navigate(`/members/${member._id}`)}
                                >
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-semibold">
                                        {(member.user?.firstName || '?')[0]}{(member.user?.lastName || '?')[0]}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {member.user?.firstName} {member.user?.lastName}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{member.membershipType || 'Standard'} Plan</p>
                                    </div>
                                    <div className="text-xs text-gray-400 dark:text-gray-500">
                                        {member.joinDate ? new Date(member.joinDate).toLocaleDateString() : ''}
                                    </div>
                                </div>
                            ))}
                            {data.members.length === 0 && (
                                <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-4">No members found</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Equipment Maintenance & Quick Actions */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Equipment Status */}
                <Card className="bg-white dark:bg-dark-900/50 border-gray-200 dark:border-dark-800 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-gray-900 dark:text-white">Equipment Status</CardTitle>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Current equipment overview</p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {data.equipment.slice(0, 5).map((item: any) => {
                                const getStatusColor = (status: string) => {
                                    if (status === 'out_of_order') return 'text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20';
                                    if (status === 'maintenance') return 'text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
                                    return 'text-green-600 dark:text-green-400 bg-green-500/10 border-green-500/20';
                                };

                                return (
                                    <div
                                        key={item._id}
                                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-dark-950/50 hover:bg-gray-100 dark:hover:bg-dark-800/50 transition-colors cursor-pointer"
                                        onClick={() => navigate('/equipment')}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn('p-2 rounded-lg', getStatusColor(item.status))}>
                                                <Wrench className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{item.category || item.location}</p>
                                            </div>
                                        </div>
                                        <div className={cn('text-xs font-medium px-2 py-1 rounded-full border', getStatusColor(item.status))}>
                                            {(item.status || 'active').replace('_', ' ')}
                                        </div>
                                    </div>
                                );
                            })}
                            {data.equipment.length === 0 && (
                                <p className="text-gray-500 text-sm text-center py-4">No equipment data</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions Panel */}
                <Card className="bg-white dark:bg-dark-900/50 border-gray-200 dark:border-dark-800 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-gray-900 dark:text-white">Quick Actions</CardTitle>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Common tasks and shortcuts</p>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                variant="outline"
                                className="h-auto flex-col gap-2 p-4 border-gray-200 dark:border-dark-700 hover:border-purple-500/50 hover:bg-gray-50 dark:hover:bg-dark-800 transition-all group"
                                onClick={() => navigate('/members')}
                            >
                                <UserPlus className="h-6 w-6 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">Add Member</span>
                            </Button>
                            <Button
                                variant="outline"
                                className="h-auto flex-col gap-2 p-4 border-gray-200 dark:border-dark-700 hover:border-blue-500/50 hover:bg-gray-50 dark:hover:bg-dark-800 transition-all group"
                                onClick={() => navigate('/classes')}
                            >
                                <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">Add Class</span>
                            </Button>
                            <Button
                                variant="outline"
                                className="h-auto flex-col gap-2 p-4 border-gray-200 dark:border-dark-700 hover:border-green-500/50 hover:bg-gray-50 dark:hover:bg-dark-800 transition-all group"
                                onClick={() => navigate('/payments')}
                            >
                                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">Record Payment</span>
                            </Button>
                            <Button
                                variant="outline"
                                className="h-auto flex-col gap-2 p-4 border-gray-200 dark:border-dark-700 hover:border-orange-500/50 hover:bg-gray-50 dark:hover:bg-dark-800 transition-all group"
                                onClick={() => navigate('/equipment')}
                            >
                                <Wrench className="h-6 w-6 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">Add Equipment</span>
                            </Button>
                            <Button
                                variant="outline"
                                className="h-auto flex-col gap-2 p-4 border-gray-200 dark:border-dark-700 hover:border-pink-500/50 hover:bg-gray-50 dark:hover:bg-dark-800 transition-all group col-span-2"
                                onClick={() => navigate('/analytics')}
                            >
                                <FileText className="h-6 w-6 text-pink-600 dark:text-pink-400 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">View Reports</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Membership Plans Overview */}
            <Card className="bg-white dark:bg-dark-900/50 border-gray-200 dark:border-dark-800 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Membership Plans</CardTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Active plans and pricing</p>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {data.plans.map((plan: any, i: number) => (
                            <div
                                key={plan._id || i}
                                className="p-4 rounded-lg bg-gray-50 dark:bg-gradient-to-br dark:from-dark-950/80 dark:to-dark-900/50 border border-gray-200 dark:border-dark-800 hover:border-purple-500/30 transition-all duration-300 group cursor-pointer"
                                onClick={() => navigate('/plans')}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                        {plan.name}
                                    </h3>
                                </div>
                                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                                    LKR {(plan.price || 0).toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {plan.durationDays} days • {(plan.features || []).length} features
                                </p>
                            </div>
                        ))}
                        {data.plans.length === 0 && (
                            <p className="text-gray-500 text-sm col-span-4 text-center py-4">No plans found</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
