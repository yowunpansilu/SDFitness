import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { 
  Users, 
  DollarSign, 
  CreditCard, 
  UserCheck, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Wrench, 
  FileText, 
  UserPlus, 
  Loader2 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { dashboardService } from '@/services/dashboardService';

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down';
  icon: any;
  iconColor: string;
}

function StatCard({ title, value, change, trend, icon: Icon, iconColor }: StatCardProps) {
  return (
    <Card className="bg-navy-900 border-navy-800 shadow-sm rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 group border-2 border-transparent hover:border-indigo-500/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className={cn("p-3 rounded-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3", iconColor)}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className={cn(
            "flex items-center gap-1 text-xs font-black px-2 py-1 rounded-full",
            trend === 'up' ? "text-emerald-400 bg-emerald-400/10" : "text-rose-400 bg-rose-400/10"
          )}>
            {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {change}%
          </div>
        </div>
        <div className="mt-4">
          <p className="text-xs font-black text-navy-500 uppercase tracking-[0.2em]">{title}</p>
          <h3 className="text-3xl font-black text-white mt-1 tracking-tight">{value}</h3>
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await dashboardService.getStats();
      if (result.success) {
        setData(result);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to synchronize with administrative matrix.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
          <p className="text-navy-400 font-bold uppercase tracking-widest text-xs">Initializing Admin Matrix...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
         <div className="p-8 bg-rose-500/10 border border-rose-500/20 rounded-3xl text-center">
            <h2 className="text-rose-500 font-black mb-2">ACCESS ERROR</h2>
            <p className="text-navy-400 text-sm">{error || 'Data missing'}</p>
            <Button variant="outline" className="mt-4 border-rose-500/30 text-rose-500 hover:bg-rose-500/10" onClick={() => fetchStats()}>Retry</Button>
         </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-10 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 text-white">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white">
            Dashboard <span className="text-navy-500 italic font-medium">Overview</span>
          </h1>
          <p className="text-indigo-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">
            Fitness center performance metrics
          </p>
        </div>
        <div className="flex gap-3">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-900/20 h-11 px-6 font-bold uppercase text-xs tracking-widest transition-all hover:scale-105 active:scale-95 border border-white/10">
            <FileText className="mr-2 h-4 w-4" /> Export Report
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Members"
          value={data.summary.totalMembers.value}
          change={data.summary.totalMembers.change}
          trend={data.summary.totalMembers.trend}
          icon={Users}
          iconColor="bg-navy-800"
        />
        <StatCard
          title="Active Memberships"
          value={data.summary.activeMemberships.value}
          change={data.summary.activeMemberships.change}
          trend={data.summary.activeMemberships.trend}
          icon={CreditCard}
          iconColor="bg-indigo-600"
        />
        <StatCard
          title="Monthly Revenue"
          value={`LKR ${data.summary.monthlyRevenue.value.toLocaleString()}`}
          change={data.summary.monthlyRevenue.change}
          trend={data.summary.monthlyRevenue.trend}
          icon={DollarSign}
          iconColor="bg-emerald-600"
        />
        <StatCard
          title="Today's Attendance"
          value={data.summary.todayAttendance.value}
          change={data.summary.todayAttendance.change}
          trend={data.summary.todayAttendance.trend}
          icon={UserCheck}
          iconColor="bg-rose-600"
        />
      </div>

      {/* Main Charts Section */}
      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2 bg-navy-900 border-navy-800 shadow-sm rounded-3xl overflow-hidden transition-colors">
          <CardHeader className="border-b border-navy-800/50 pb-6 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-white font-black text-xl">Revenue Stream</CardTitle>
              <p className="text-sm font-medium text-navy-500">Financial performance tracking</p>
            </div>
          </CardHeader>
          <CardContent className="pt-8">
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={data.revenueChart}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" stroke="#475569" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600}} dy={10} />
                <YAxis stroke="#475569" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600}} dx={-10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '16px',
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                  }}
                  itemStyle={{ color: '#4f46e5', fontWeight: 700 }}
                  formatter={(value: any) => value !== undefined ? [`LKR ${value.toLocaleString()}`, 'Revenue'] : ['LKR 0', 'Revenue']}
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
        <Card className="bg-navy-900 border-navy-800 shadow-sm rounded-3xl overflow-hidden transition-colors">
          <CardHeader className="border-b border-navy-800/50 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white font-black text-xl">New Members</CardTitle>
                <p className="text-sm font-medium text-navy-500">Recent customer acquisitions</p>
              </div>
              <Button variant="ghost" className="text-indigo-400 hover:bg-navy-800 font-bold text-xs" onClick={() => navigate('/members')}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-5">
              {data.recentMembers.map((member: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-2 rounded-2xl hover:bg-navy-800/50 transition-all duration-300 group cursor-pointer"
                  onClick={() => navigate(`/members/${member.id}`)}
                >
                  <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm border-2 border-navy-800 bg-navy-800 text-indigo-400")}>
                    {member.initial}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{member.name}</p>
                    <p className="text-xs font-medium text-navy-500 uppercase tracking-widest">{member.plan}</p>
                  </div>
                  <div className="text-[10px] uppercase tracking-wider font-bold text-navy-600">{new Date(member.time).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Equipment & Quick Actions */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Equipment Maintenance */}
        <Card className="bg-navy-900 border-navy-800 shadow-sm rounded-3xl overflow-hidden transition-colors">
          <CardHeader className="border-b border-navy-800/50 pb-6">
            <CardTitle className="text-white font-black text-xl flex items-center gap-2">
               Equipment Health
            </CardTitle>
            <p className="text-sm font-medium text-navy-500">Upcoming maintenance schedule</p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {data.maintenanceAlerts.map((item: any) => {
                const isOverdue = item.daysUntil < 0;
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 rounded-2xl border border-navy-800/50 hover:border-indigo-500/30 hover:bg-navy-800/50 transition-all duration-300 cursor-pointer group"
                    onClick={() => navigate('/equipment')}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-3 rounded-xl transition-all group-hover:rotate-12",
                        isOverdue ? 'bg-rose-500/10 text-rose-400' : 'bg-navy-950 text-navy-500'
                      )}>
                        <Wrench className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-white uppercase tracking-tight">{item.name}</p>
                        <p className="text-[10px] font-black uppercase text-navy-500 tracking-widest">{item.location}</p>
                      </div>
                    </div>
                    <div className={cn(
                      "text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border",
                      isOverdue ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
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
        <Card className="bg-navy-900 border-navy-800 shadow-sm rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-950/30 to-navy-900 transition-colors">
          <CardHeader className="border-b border-navy-800 pb-6">
            <CardTitle className="text-white font-black text-xl">Quick Actions</CardTitle>
            <p className="text-sm font-medium text-navy-500">Essential management shortcuts</p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4">
              {[
                { title: 'Add Member', icon: UserPlus, color: 'text-indigo-400', bg: 'bg-indigo-500/10', link: '/members' },
                { title: 'Add Class', icon: Calendar, color: 'text-violet-400', bg: 'bg-violet-500/10', link: '/classes' },
                { title: 'Payments', icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10', link: '/payments' },
                { title: 'Inventory', icon: Wrench, color: 'text-rose-400', bg: 'bg-rose-500/10', link: '/equipment' },
              ].map((action, i) => (
                <button
                  key={i}
                  onClick={() => navigate(action.link)}
                  className="p-6 rounded-2xl flex flex-col items-center justify-center gap-3 bg-navy-950 border-2 border-navy-800 hover:border-indigo-400/50 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 group"
                >
                  <div className={cn("p-4 rounded-2xl group-hover:scale-110 group-hover:-rotate-6 transition-all shadow-sm", action.bg, action.color)}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-black text-navy-300 uppercase tracking-widest group-hover:text-indigo-400 transition-colors">{action.title}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Classes */}
      <Card className="bg-navy-900 border-navy-800 shadow-sm rounded-3xl overflow-hidden transition-colors">
        <CardHeader className="border-b border-navy-800 pb-6 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-white font-black text-xl">Today's Schedule</CardTitle>
            <p className="text-sm font-medium text-navy-500 italic">Manage daily fitness activities</p>
          </div>
          <Button variant="outline" className="rounded-xl border-navy-800 font-black text-xs uppercase tracking-tighter hover:bg-navy-800 transition-colors text-white" onClick={() => navigate('/classes')}>Full Schedule</Button>
        </CardHeader>
        <CardContent className="pt-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.todaysClasses.map((classItem: any, i: number) => (
              <div
                key={i}
                className="relative p-6 rounded-3xl bg-navy-950/40 border-2 border-transparent hover:border-indigo-400/20 hover:bg-navy-950 transition-all duration-500 group overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-3">
                  <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full bg-navy-900 shadow-sm text-indigo-400 border border-navy-800 transition-colors">
                    {classItem.time}
                  </span>
                </div>
                <h3 className="font-black text-xl text-white mb-1 group-hover:text-indigo-400 transition-colors">
                  {classItem.name}
                </h3>
                <p className="text-xs font-bold text-navy-500 mb-6 flex items-center gap-2 uppercase tracking-tight">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  {classItem.trainer}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-navy-600 transition-colors">
                    <span>Capacity Status</span>
                    <span className="text-white font-black">{classItem.spots}</span>
                  </div>
                  <div className="h-2 w-full bg-navy-800 rounded-full overflow-hidden transition-colors">
                    <div 
                      className="h-full bg-indigo-500 rounded-full transition-all duration-1000" 
                      style={{ width: `${classItem.percent}%` }}
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
