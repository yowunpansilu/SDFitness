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
        <Card className="bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 group overflow-hidden border-b-4 border-b-transparent hover:border-b-indigo-500 rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 transition-colors">
                    {title}
                </CardTitle>
                <div className={cn(
                    "p-2.5 rounded-xl transition-all duration-300 group-hover:scale-110 shadow-sm",
                    iconColor
                )}>
                    <Icon className="h-5 w-5 text-white" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-baseline justify-between mb-1">
                    <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{value}</div>
                    {change !== undefined && (
                        <div className={cn(
                            "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg",
                            trend === 'up' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                        )}>
                            {trend === 'up' ? (
                                <TrendingUp className="h-3 w-3" />
                            ) : (
                                <TrendingDown className="h-3 w-3" />
                            )}
                            <span>{Math.abs(change)}%</span>
                        </div>
                    )}
                </div>
                {change !== undefined && (
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                        vs last month
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
        <div className="space-y-10 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white drop-shadow-sm">
                        Dashboard <span className="text-indigo-600 italic">Overview</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">
                        Review your fitness center performance and member growth.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none h-11 px-6 font-bold transition-all hover:scale-105 active:scale-95">
                        <FileText className="mr-2 h-4 w-4" /> Export Report
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Members"
                    value="1,234"
                    change={12}
                    trend="up"
                    icon={Users}
                    iconColor="bg-gradient-to-br from-indigo-500 to-blue-600"
                />
                <StatCard
                    title="Active Memberships"
                    value="892"
                    change={8}
                    trend="up"
                    icon={CreditCard}
                    iconColor="bg-gradient-to-br from-violet-500 to-purple-600"
                />
                <StatCard
                    title="Monthly Revenue"
                    value="$45,231"
                    change={23}
                    trend="up"
                    icon={DollarSign}
                    iconColor="bg-gradient-to-br from-emerald-500 to-green-600"
                />
                <StatCard
                    title="Today's Attendance"
                    value="156"
                    change={-5}
                    trend="down"
                    icon={UserCheck}
                    iconColor="bg-gradient-to-br from-orange-500 to-rose-600"
                />
            </div>

            {/* Charts and Tables Grid */}
            <div className="grid gap-8 lg:grid-cols-2">
                {/* Revenue Chart */}
                <Card className="bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800/50 pb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-slate-900 dark:text-white font-black text-xl">Revenue Growth</CardTitle>
                                <p className="text-sm font-medium text-slate-500">Financial performance monitoring</p>
                            </div>
                            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                                <button
                                    onClick={() => setRevenueTimeRange('monthly')}
                                    className={cn(
                                        "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                                        revenueTimeRange === 'monthly'
                                            ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm"
                                            : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
                                    )}
                                >
                                    Monthly
                                </button>
                                <button
                                    onClick={() => setRevenueTimeRange('yearly')}
                                    className={cn(
                                        "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                                        revenueTimeRange === 'yearly'
                                            ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm"
                                            : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
                                    )}
                                >
                                    Yearly
                                </button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-8">
                        <ResponsiveContainer width="100%" height={320}>
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                <XAxis dataKey="month" stroke="#94a3b8" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600}} dy={10} />
                                <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600}} dx={-10} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: 'none',
                                        borderRadius: '16px',
                                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                    }}
                                    itemStyle={{ color: '#4f46e5', fontWeight: 700 }}
                                    formatter={(value: any) => value !== undefined ? [`$${value.toLocaleString()}`, 'Revenue'] : ['$0', 'Revenue']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#4f46e5"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Recent Registrations */}
                <Card className="bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800/50 pb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-slate-900 dark:text-white font-black text-xl">New Members</CardTitle>
                                <p className="text-sm font-medium text-slate-500">Recent customer acquisitions</p>
                            </div>
                            <Button variant="ghost" className="text-indigo-600 hover:bg-indigo-50 font-bold text-xs" onClick={() => navigate('/members')}>
                                View All
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-5">
                            {[
                                { name: 'John Doe', plan: 'Premium Plan', time: '2 mins ago', initial: 'JD', color: 'bg-indigo-100 text-indigo-600' },
                                { name: 'Jane Smith', plan: 'Basic', time: '1 hour ago', initial: 'JS', color: 'bg-emerald-100 text-emerald-600' },
                                { name: 'Mike Ross', plan: 'Premium Plan', time: '3 hours ago', initial: 'MR', color: 'bg-violet-100 text-violet-600' },
                                { name: 'Emma Wilson', plan: 'Student Plan', time: '5 hours ago', initial: 'EW', color: 'bg-rose-100 text-rose-600' },
                                { name: 'David Lee', plan: 'Elite Coaching', time: 'Yesterday', initial: 'DL', color: 'bg-amber-100 text-amber-600' },
                            ].map((member, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-4 p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300 group cursor-pointer"
                                >
                                    <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm border-2 border-white dark:border-slate-800", member.color)}>
                                        {member.initial}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{member.name}</p>
                                        <p className="text-xs font-medium text-slate-400">{member.plan}</p>
                                    </div>
                                    <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{member.time}</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Equipment & Quick Actions */}
            <div className="grid gap-8 lg:grid-cols-2">
                {/* Equipment Maintenance */}
                <Card className="bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800/50 pb-6">
                        <CardTitle className="text-slate-900 dark:text-white font-black text-xl flex items-center gap-2">
                             Equipment Health
                        </CardTitle>
                        <p className="text-sm font-medium text-slate-500">Upcoming maintenance schedule</p>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            {equipmentMaintenanceAlerts.map((item) => {
                                const isOverdue = item.status === 'overdue';
                                return (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-500/30 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300 cursor-pointer group"
                                        onClick={() => navigate('/equipment')}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "p-3 rounded-xl transition-all group-hover:rotate-12",
                                                isOverdue ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                            )}>
                                                <Wrench className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-white">{item.name}</p>
                                                <p className="text-xs font-medium text-slate-400">{item.location}</p>
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full",
                                            isOverdue ? "bg-rose-50 text-rose-600 border border-rose-100" : "bg-indigo-50 text-indigo-600 border border-indigo-100"
                                        )}>
                                            {item.daysUntil < 0 ? `${Math.abs(item.daysUntil)} Days Overdue` : `${item.daysUntil} Days Left`}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions Panel */}
                <Card className="bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-50/30 to-white dark:from-slate-900 dark:to-slate-950">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800/50 pb-6">
                        <CardTitle className="text-slate-900 dark:text-white font-black text-xl">Quick Actions</CardTitle>
                        <p className="text-sm font-medium text-slate-500">Essential management shortcuts</p>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { title: 'Add Member', icon: UserPlus, color: 'text-indigo-600', bg: 'bg-indigo-50', link: '/members' },
                                { title: 'Add Class', icon: Calendar, color: 'text-violet-600', bg: 'bg-violet-50', link: '/classes' },
                                { title: 'Payments', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', link: '/payments' },
                                { title: 'Inventory', icon: Wrench, color: 'text-rose-600', bg: 'bg-rose-50', link: '/equipment' },
                            ].map((action, i) => (
                                <button
                                    key={i}
                                    onClick={() => navigate(action.link)}
                                    className="p-6 rounded-2xl flex flex-col items-center justify-center gap-3 bg-white dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-700 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 group"
                                >
                                    <div className={cn("p-4 rounded-2xl group-hover:scale-110 group-hover:-rotate-6 transition-all", action.bg, action.color)}>
                                        <action.icon className="h-6 w-6" />
                                    </div>
                                    <span className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">{action.title}</span>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Upcoming Classes */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800/50 pb-6 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-slate-900 dark:text-white font-black text-xl">Today's Schedule</CardTitle>
                        <p className="text-sm font-medium text-slate-500">Manage daily fitness activities</p>
                    </div>
                    <Button variant="outline" className="rounded-xl border-slate-200 font-bold text-xs" onClick={() => navigate('/classes')}>Full Schedule</Button>
                </CardHeader>
                <CardContent className="pt-8">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[
                            { name: 'Yoga Flow', time: '10:00 AM', trainer: 'Sarah Johnson', spots: '8/15', color: 'indigo' },
                            { name: 'HIIT Training', time: '2:00 PM', trainer: 'Mike Ross', spots: '12/12', color: 'rose' },
                            { name: 'Spin Class', time: '6:00 PM', trainer: 'Emma Wilson', spots: '5/20', color: 'violet' },
                        ].map((classItem, i) => (
                            <div
                                key={i}
                                className="relative p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border-2 border-transparent hover:border-indigo-500/20 hover:bg-white dark:hover:bg-slate-800 transition-all duration-500 group overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-3">
                                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 shadow-sm text-indigo-600 border border-slate-100 dark:border-slate-800">
                                        {classItem.time}
                                    </span>
                                </div>
                                <h3 className="font-black text-xl text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 transition-colors">
                                    {classItem.name}
                                </h3>
                                <p className="text-sm font-bold text-slate-400 mb-6 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                    {classItem.trainer}
                                </p>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
                                        <span>Capacity</span>
                                        <span>{classItem.spots} Filled</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-indigo-600 rounded-full" 
                                            style={{ width: `${(parseInt(classItem.spots.split('/')[0]) / parseInt(classItem.spots.split('/')[1])) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
