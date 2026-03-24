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
const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b'];

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('6months');

  return (
    <div className="space-y-10 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 text-slate-900 dark:text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Performance <span className="text-indigo-600 dark:text-indigo-400 italic">Intelligence</span>
          </h1>
          <p className="text-slate-500 dark:text-navy-400 font-medium mt-1">
            Deep dive into organizational health, growth vectors and financial metrics.
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[200px] h-11 bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 rounded-xl font-bold text-slate-600 dark:text-white focus:ring-4 focus:ring-indigo-500/10 shadow-sm transition-all hover:border-indigo-500/50">
            <Calendar className="h-4 w-4 mr-2 text-indigo-500 dark:text-indigo-400" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-slate-200 dark:border-navy-800 dark:bg-navy-900 p-1 dark:text-white">
            <SelectItem value="1month" className="rounded-lg">Last Month</SelectItem>
            <SelectItem value="3months" className="rounded-lg">Last 3 Months</SelectItem>
            <SelectItem value="6months" className="rounded-lg">Last 6 Months</SelectItem>
            <SelectItem value="1year" className="rounded-lg">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white dark:bg-navy-900 border-navy-100/50 dark:border-navy-800 shadow-sm rounded-2xl overflow-hidden group hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-navy-400">Gross Revenue</CardTitle>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 transition-transform group-hover:scale-110">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900 dark:text-white">$28,330</div>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase">
                <TrendingUp className="h-2.5 w-2.5" />
                <span>+15.3%</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-navy-500 uppercase tracking-widest font-black transition-colors">Growth rate</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-navy-900 border-navy-100/50 dark:border-navy-800 shadow-sm rounded-2xl overflow-hidden group hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-navy-400">Active Assets</CardTitle>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 transition-transform group-hover:scale-110">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900 dark:text-white">324</div>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase">
                <TrendingUp className="h-2.5 w-2.5" />
                <span>+12.1%</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-navy-500 uppercase tracking-widest font-black transition-colors">Subscriber flux</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-navy-900 border-navy-100/50 dark:border-navy-800 shadow-sm rounded-2xl overflow-hidden group hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-navy-400">Engagement Index</CardTitle>
            <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 transition-transform group-hover:scale-110">
              <Activity className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900 dark:text-white">84.6%</div>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase">
                <TrendingUp className="h-2.5 w-2.5" />
                <span>+3.2%</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-navy-500 uppercase tracking-widest font-black transition-colors">Attendance yield</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-navy-900 border-navy-100/50 dark:border-navy-800 shadow-sm rounded-2xl overflow-hidden group hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-navy-400">LTV Retention</CardTitle>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 transition-transform group-hover:scale-110">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900 dark:text-white">92.3%</div>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase">
                <TrendingUp className="h-2.5 w-2.5" />
                <span>+1.8%</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-navy-500 uppercase tracking-widest font-black transition-colors">Stability score</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Member Growth */}
        <Card className="bg-white dark:bg-navy-900 border-navy-100/50 dark:border-navy-800 shadow-sm rounded-[2rem] overflow-hidden transition-colors">
          <CardHeader className="p-8 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Market Expansion</CardTitle>
                <p className="text-xs font-bold text-slate-400 dark:text-navy-500 uppercase tracking-widest mt-1 italic transition-colors">Longitudinal subscriber acquisition</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-navy-950 text-slate-400 dark:text-navy-600 transition-colors">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 pt-4">
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={memberGrowthData}>
                <defs>
                  <linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="currentColor" className="text-slate-100 dark:text-navy-800 transition-colors" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 700 }} 
                  className="text-slate-400 dark:text-navy-500 transition-colors font-bold"
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 700 }} 
                  className="text-slate-400 dark:text-navy-500 transition-colors font-bold"
                />
                <Tooltip
                  cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '5 5' }}
                  contentStyle={{
                    backgroundColor: 'var(--tooltip-bg, #fff)',
                    border: 'none',
                    borderRadius: '16px',
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                    padding: '12px 16px',
                  }}
                  itemStyle={{ color: '#6366f1', fontWeight: 900, fontSize: '12px', textTransform: 'uppercase' }}
                  labelStyle={{ color: '#64748b', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="members" stroke="#6366f1" strokeWidth={4} fill="url(#colorMembers)" animationDuration={2000} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Trend */}
        <Card className="bg-white dark:bg-navy-900 border-navy-100/50 dark:border-navy-800 shadow-sm rounded-[2rem] overflow-hidden transition-colors">
          <CardHeader className="p-8 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Fiscal Velocity</CardTitle>
                <p className="text-xs font-bold text-slate-400 dark:text-navy-500 uppercase tracking-widest mt-1 italic transition-colors">Monthly gross revenue optimization</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-navy-950 text-slate-400 dark:text-navy-600 transition-colors">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 pt-4">
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="currentColor" className="text-slate-100 dark:text-navy-800 transition-colors" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 700 }}
                  className="text-slate-400 dark:text-navy-500 transition-colors font-bold"
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 700 }}
                  className="text-slate-400 dark:text-navy-500 transition-colors font-bold"
                />
                <Tooltip
                  cursor={{ stroke: '#10b981', strokeWidth: 2 }}
                  contentStyle={{
                    backgroundColor: 'var(--tooltip-bg, #fff)',
                    border: 'none',
                    borderRadius: '16px',
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                    padding: '12px 16px',
                  }}
                  itemStyle={{ color: '#10b981', fontWeight: 900, fontSize: '12px', textTransform: 'uppercase' }}
                  labelStyle={{ color: '#64748b', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px' }}
                  formatter={(value: any) => [`$${(value || 0).toLocaleString()}`, 'Revenue']}
                />
                <Line type="stepAfter" dataKey="revenue" stroke="#10b981" strokeWidth={4} dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: 'currentColor' }} className="dark:text-navy-900" activeDot={{ r: 8, strokeWidth: 0 }} animationDuration={2000} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Analytics */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Class Attendance */}
        <Card className="bg-white dark:bg-navy-900 border-navy-100/50 dark:border-navy-800 shadow-sm rounded-[2rem] overflow-hidden transition-colors">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Content Performance</CardTitle>
            <p className="text-xs font-bold text-slate-400 dark:text-navy-500 uppercase tracking-widest mt-1 italic transition-colors">Attendance concentration by modality</p>
          </CardHeader>
          <CardContent className="p-8 pt-4">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={classAttendanceData}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="currentColor" className="text-slate-100 dark:text-navy-800 transition-colors" />
                <XAxis 
                  dataKey="class" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 700 }}
                  className="text-slate-400 dark:text-navy-500 transition-colors font-bold"
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 700 }}
                  className="text-slate-400 dark:text-navy-500 transition-colors font-bold"
                />
                <Tooltip
                  cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                  contentStyle={{
                    backgroundColor: 'var(--tooltip-bg, #fff)',
                    border: 'none',
                    borderRadius: '16px',
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                    padding: '12px 16px',
                  }}
                  itemStyle={{ color: '#8b5cf6', fontWeight: 900, fontSize: '12px', textTransform: 'uppercase' }}
                  labelStyle={{ color: '#64748b', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px' }}
                  formatter={(value) => [`${value}%`, 'Yield']}
                />
                <Bar dataKey="attendance" fill="#8b5cf6" radius={[12, 12, 4, 4]} barSize={40} animationDuration={2000} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Membership Breakdown */}
        <Card className="bg-white dark:bg-navy-900 border-navy-100/50 dark:border-navy-800 shadow-sm rounded-[2rem] overflow-hidden transition-colors">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Segment Distribution</CardTitle>
            <p className="text-xs font-bold text-slate-400 dark:text-navy-500 uppercase tracking-widest mt-1 italic transition-colors">Active market share by subscription tier</p>
          </CardHeader>
          <CardContent className="p-8 pt-4">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={membershipBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={8}
                  dataKey="count"
                  animationDuration={2000}
                >
                  {membershipBreakdown.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--tooltip-bg, #fff)',
                    border: 'none',
                    borderRadius: '16px',
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                    padding: '12px 16px',
                  }}
                  itemStyle={{ fontWeight: 900, fontSize: '12px', textTransform: 'uppercase' }}
                  labelStyle={{ display: 'none' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-4 mt-2">
               {membershipBreakdown.map((item, index) => (
                 <div key={item.plan} className="flex items-center gap-2">
                   <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                   <span className="text-[10px] font-black uppercase text-slate-500 dark:text-navy-400 transition-colors">{item.plan} ({item.percentage}%)</span>
                 </div>
               ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card className="bg-white dark:bg-navy-900 border-slate-200/60 dark:border-navy-800 shadow-sm rounded-[2.5rem] overflow-hidden transition-colors">
        <CardHeader className="p-10 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Human Capital Impact</CardTitle>
              <p className="text-xs font-bold text-slate-400 dark:text-navy-500 uppercase tracking-widest mt-1 italic transition-colors">Personnel performance based on revenue & satisfaction</p>
            </div>
            <Badge className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-navy-800 font-black text-[10px] uppercase py-1 px-3 rounded-xl shadow-none transition-colors">Elite Status</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {topTrainers.map((trainer, index) => (
              <div
                key={trainer.name}
                className="group relative p-6 rounded-[2rem] bg-slate-50/50 dark:bg-navy-950/50 border border-transparent hover:border-indigo-500/10 hover:bg-white dark:hover:bg-navy-950 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/5"
              >
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-2xl font-black shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-6">
                      {trainer.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-2xl bg-white dark:bg-navy-900 shadow-sm flex items-center justify-center border-2 border-slate-50 dark:border-navy-800 transition-colors">
                      <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400">#{index + 1}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{trainer.name}</p>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black transition-colors">
                        ★ {trainer.rating}
                      </div>
                      <span className="text-[10px] font-black text-slate-400 dark:text-navy-500 uppercase tracking-widest transition-colors font-bold">{trainer.sessions} SESSIONS</span>
                    </div>
                  </div>
                  <div className="w-full pt-4 border-t border-slate-100 dark:border-navy-800 transition-colors">
                    <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">${trainer.revenue.toLocaleString()}</p>
                    <p className="text-[9px] font-black text-slate-400 dark:text-navy-500 uppercase tracking-widest mt-1 transition-colors">Value generated</p>
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
