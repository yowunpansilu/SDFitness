import { Users, DollarSign, CreditCard, UserCheck, TrendingUp, TrendingDown, Calendar, Wrench, FileText, UserPlus, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/contexts/ThemeContext';
import api from '@/lib/api/axios';

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  trend?: 'up' | 'down';
  iconColor: string;
  loading?: boolean;
}

function StatCard({ title, value, change, icon: Icon, trend, iconColor, loading }: StatCardProps) {
  return (
    <Card className="bg-white dark:bg-navy-900 border-navy-100/50 dark:border-navy-800 shadow-sm hover:shadow-xl hover:shadow-navy-500/10 transition-all duration-300 group overflow-hidden border-b-4 border-b-transparent hover:border-b-navy-500 rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xs font-bold uppercase tracking-[0.15em] text-navy-400 dark:text-navy-400 group-hover:text-navy-600 dark:group-hover:text-white transition-colors">
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
        {loading ? (
          <Loader2 className="h-6 w-6 animate-spin text-navy-200" />
        ) : (
          <>
            <div className="flex items-baseline justify-between mb-1">
              <div className="text-2xl font-bold text-navy-900 dark:text-white tracking-tight">{value}</div>
              {change !== undefined && (
                <div className={cn(
                  "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg",
                  trend === 'up' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-rose-500/10 text-red-600 dark:text-rose-400'
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
              <p className="text-xs font-bold text-navy-300 dark:text-navy-500 uppercase tracking-widest">
                vs last month
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}


export function AdminDashboard() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [revenueTimeRange, setRevenueTimeRange] = useState<'monthly' | 'yearly'>('monthly');
  const [stats, setStats] = useState<{
    revenueHistory?: Record<string, { month: string, revenue: number }[]>;
    totalMembers?: number;
    activeMembers?: number;
    monthlyRevenue?: number;
    equipmentStats?: { broken: number };
    maintenanceNeeded?: { _id: string, name: string, location: string, daysUntil: number }[];
  } | null>(null);
  const [recentMembers, setRecentMembers] = useState<{ _id?: string, userId?: { firstName?: string, lastName?: string }, membershipType?: string, joinDate: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, membersRes] = await Promise.all([
          api.get('/analytics/dashboard'),
          api.get('/members?limit=5')
        ]);
        setStats(statsRes.data);
        setRecentMembers(membersRes.data.data || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const revenueData = stats?.revenueHistory?.[revenueTimeRange] || [
    { month: 'Jan', revenue: 0 },
    { month: 'Feb', revenue: 0 },
  ];

  return (
    <div className="space-y-10 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 text-navy-950 dark:text-white">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-navy-950 dark:text-white">
            Dashboard <span className="text-navy-400 dark:text-navy-500 font-medium">Overview</span>
          </h1>
          <p className="text-navy-500 dark:text-navy-400 font-bold uppercase tracking-wider text-xs mt-2">
            Fitness center performance metrics
          </p>
        </div>
        <div className="flex gap-3">
          <Button className="bg-navy-900 dark:bg-indigo-600 hover:bg-navy-800 dark:hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-navy-100 dark:shadow-indigo-900/20 h-11 px-6 font-bold uppercase text-xs tracking-widest transition-all hover:scale-105 active:scale-95 border border-white/10">
            <FileText className="mr-2 h-4 w-4" /> Export Report
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Members"
          value={stats?.totalMembers?.toLocaleString() || '0'}
          icon={Users}
          iconColor="bg-navy-900 dark:bg-navy-800"
          loading={loading}
        />
        <StatCard
          title="Active Memberships"
          value={stats?.activeMembers?.toLocaleString() || '0'}
          icon={CreditCard}
          iconColor="bg-navy-800 dark:bg-indigo-600"
          loading={loading}
        />
        <StatCard
          title="Monthly Revenue"
          value={`LKR ${stats?.monthlyRevenue?.toLocaleString() || '0'}`}
          icon={DollarSign}
          iconColor="bg-navy-700 dark:bg-emerald-600"
          loading={loading}
        />
        <StatCard
          title="Equipment Issues"
          value={stats?.equipmentStats?.broken || 0}
          icon={UserCheck}
          iconColor="bg-navy-600 dark:bg-rose-600"
          loading={loading}
        />
      </div>

      {/* Charts and Tables Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Revenue Chart */}
        <Card className="bg-white dark:bg-navy-900 border-navy-100/50 dark:border-navy-800 shadow-sm rounded-3xl overflow-hidden transition-colors">
          <CardHeader className="border-b border-navy-50 dark:border-navy-800/50 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-navy-950 dark:text-white font-bold text-xl">Revenue Growth</CardTitle>
                <p className="text-sm font-medium text-navy-400 dark:text-navy-500">Financial performance monitoring</p>
              </div>
              <div className="flex bg-navy-50 dark:bg-navy-950 p-1 rounded-xl">
                <button
                  onClick={() => setRevenueTimeRange('monthly')}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                    revenueTimeRange === 'monthly'
                      ? "bg-white dark:bg-navy-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-navy-400 dark:text-navy-600 hover:text-navy-950 dark:hover:text-white"
                  )}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setRevenueTimeRange('yearly')}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                    revenueTimeRange === 'yearly'
                      ? "bg-white dark:bg-navy-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-navy-400 dark:text-navy-600 hover:text-navy-950 dark:hover:text-white"
                  )}
                >
                  Yearly
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8">
            <ResponsiveContainer width="100%" height={320} minWidth={0}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#1e293b' : '#e2e8f0'} vertical={false} />
                <XAxis dataKey="month" stroke={theme === 'dark' ? '#475569' : '#94a3b8'} axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} dy={10} />
                <YAxis stroke={theme === 'dark' ? '#475569' : '#94a3b8'} axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} dx={-10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#0f172a' : '#fff',
                    border: 'none',
                    borderRadius: '16px',
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                  }}
                  itemStyle={{ color: '#4f46e5', fontWeight: 700 }}
                  formatter={(value: number | undefined) => value !== undefined ? [`LKR${value.toLocaleString()}`, 'Revenue'] : ['LKR0', 'Revenue']}
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
        <Card className="bg-white dark:bg-navy-900 border-navy-100/50 dark:border-navy-800 shadow-sm rounded-3xl overflow-hidden transition-colors">
          <CardHeader className="border-b border-navy-50 dark:border-navy-800/50 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-navy-950 dark:text-white font-bold text-xl">New Members</CardTitle>
                <p className="text-sm font-medium text-navy-400 dark:text-navy-500">Recent customer acquisitions</p>
              </div>
              <Button variant="ghost" className="text-indigo-600 dark:text-indigo-400 hover:bg-navy-50 dark:hover:bg-navy-800 font-bold text-xs" onClick={() => navigate('/members')}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-5">
              {recentMembers.map((member: { _id?: string, userId?: { firstName?: string, lastName?: string }, membershipType?: string, joinDate: string }, i: number) => (
                <div
                  key={member._id || i}
                  className="flex items-center gap-4 p-2 rounded-2xl hover:bg-navy-50 dark:hover:bg-navy-800/50 transition-all duration-300 group cursor-pointer"
                  onClick={() => navigate(`/members/${member._id}`)}
                >
                  <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm border-2 border-white dark:border-navy-800 bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400")}>
                    {member.userId?.firstName?.[0] || 'M'}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-navy-950 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {member.userId?.firstName} {member.userId?.lastName}
                    </p>
                    <p className="text-xs font-medium text-navy-400 dark:text-navy-500">{member.membershipType || 'Standard'}</p>
                  </div>
                  <div className="text-xs uppercase tracking-wider font-bold text-navy-300 dark:text-navy-600">
                    {new Date(member.joinDate).toLocaleDateString()}
                  </div>
                </div>
              ))}
              {recentMembers.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">No recent members found</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Equipment & Quick Actions */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Equipment Maintenance */}
        <Card className="bg-white dark:bg-navy-900 border-navy-100/50 dark:border-navy-800 shadow-sm rounded-3xl overflow-hidden transition-colors">
          <CardHeader className="border-b border-navy-50 dark:border-navy-800/50 pb-6">
            <CardTitle className="text-navy-950 dark:text-white font-bold text-xl flex items-center gap-2">
              Equipment Health
            </CardTitle>
            <p className="text-sm font-medium text-navy-400 dark:text-navy-500">Upcoming maintenance schedule</p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {stats?.maintenanceNeeded?.map((item: { _id: string, name: string, location: string, daysUntil: number }) => {
                const isOverdue = item.daysUntil < 0;
                return (
                  <div
                    key={item._id}
                    className="flex items-center justify-between p-4 rounded-2xl border border-navy-50 dark:border-navy-800/50 hover:border-indigo-500/30 hover:bg-navy-50 dark:hover:bg-navy-800/50 transition-all duration-300 cursor-pointer group"
                    onClick={() => navigate(`/equipment/${item._id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-3 rounded-xl transition-all group-hover:rotate-12",
                        isOverdue ? 'bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400' : 'bg-navy-50 dark:bg-navy-950 text-navy-500'
                      )}>
                        <Wrench className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-navy-950 dark:text-white">{item.name}</p>
                        <p className="text-xs font-medium text-navy-400 dark:text-navy-500">{item.location}</p>
                      </div>
                    </div>
                    <div className={cn(
                      "text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full",
                      isOverdue ? "bg-rose-50 text-rose-600 border border-rose-100" : "bg-indigo-50 text-indigo-600 border border-indigo-100"
                    )}>
                      {item.daysUntil < 0 ? `${Math.abs(item.daysUntil)} Days Overdue` : `${item.daysUntil} Days Left`}
                    </div>
                  </div>
                );
              })}
              {(!stats?.maintenanceNeeded || stats.maintenanceNeeded.length === 0) && (
                <p className="text-sm text-slate-400 text-center py-4">No equipment needs maintenance</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Panel */}
        <Card className="bg-white dark:bg-navy-900 border-navy-100/50 dark:border-navy-800 shadow-sm rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-50/30 to-white dark:from-navy-950/30 dark:to-navy-900 transition-colors">
          <CardHeader className="border-b border-navy-50 dark:border-navy-800 pb-6">
            <CardTitle className="text-navy-950 dark:text-white font-bold text-xl">Quick Actions</CardTitle>
            <p className="text-sm font-medium text-navy-400 dark:text-navy-500">Essential management shortcuts</p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4">
              {[
                { title: 'Add Member', icon: UserPlus, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10', link: '/members' },
                { title: 'Add Class', icon: Calendar, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-500/10', link: '/classes' },
                { title: 'Payments', icon: DollarSign, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', link: '/payments' },
                { title: 'Inventory', icon: Wrench, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10', link: '/equipment' },
              ].map((action, i) => (
                <button
                  key={i}
                  onClick={() => navigate(action.link)}
                  className="p-6 rounded-2xl flex flex-col items-center justify-center gap-3 bg-white dark:bg-navy-950 border-2 border-navy-50 dark:border-navy-800 hover:border-indigo-500/50 dark:hover:border-indigo-400/50 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 group"
                >
                  <div className={cn("p-4 rounded-2xl group-hover:scale-110 group-hover:-rotate-6 transition-all shadow-sm", action.bg, action.color)}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-bold text-navy-700 dark:text-navy-300 uppercase tracking-widest group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{action.title}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Classes */}
      <Card className="bg-white dark:bg-navy-900 border-navy-100/50 dark:border-navy-800 shadow-sm rounded-3xl overflow-hidden transition-colors">
        <CardHeader className="border-b border-navy-50 dark:border-navy-800 pb-6 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-navy-950 dark:text-white font-bold text-xl">Today's Schedule</CardTitle>
            <p className="text-sm font-medium text-navy-400 dark:text-navy-500">Manage daily fitness activities</p>
          </div>
          <Button variant="outline" className="rounded-xl border-navy-200 dark:border-navy-800 font-bold text-xs uppercase tracking-normal hover:bg-navy-50 dark:hover:bg-navy-800 transition-colors dark:text-white" onClick={() => navigate('/classes')}>Full Schedule</Button>
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
                className="relative p-6 rounded-3xl bg-navy-50/50 dark:bg-navy-950/40 border-2 border-transparent hover:border-indigo-500/20 dark:hover:border-indigo-400/20 hover:bg-white dark:hover:bg-navy-950 transition-all duration-500 group overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-3">
                  <span className="text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full bg-white dark:bg-navy-900 shadow-sm text-indigo-600 dark:text-indigo-400 border border-navy-100 dark:border-navy-800 transition-colors">
                    {classItem.time}
                  </span>
                </div>
                <h3 className="font-bold text-xl text-navy-950 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {classItem.name}
                </h3>
                <p className="text-xs font-bold text-navy-400 dark:text-navy-500 mb-6 flex items-center gap-2 uppercase tracking-tight">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse" />
                  {classItem.trainer}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-navy-400 dark:text-navy-600 transition-colors">
                    <span>Capacity Status</span>
                    <span className="text-navy-900 dark:text-white font-bold">{classItem.spots}</span>
                  </div>
                  <div className="h-2 w-full bg-navy-100/50 dark:bg-navy-800 rounded-full overflow-hidden transition-colors">
                    <div
                      className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-1000"
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
