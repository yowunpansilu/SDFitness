import { TrendingUp, Users, DollarSign, Activity, Calendar, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { analyticsService } from '@/services/analyticsService';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b'];

export function AnalyticsDashboard() {
  const { toast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('6months');

  const fetchAnalytics = async (range: string) => {
    try {
      setLoading(true);
      const result = await analyticsService.getAnalytics(range);
      if (result.success) {
        setData(result);
      }
    } catch (error) {
       console.error('Analytics fetch error:', error);
       toast({
         title: 'Intelligence Error',
         description: 'Failed to synchronize with performance matrix.',
         variant: 'destructive',
       });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(timeRange);
  }, [timeRange]);

  if (loading || !data) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
          <p className="text-navy-400 font-bold uppercase tracking-widest text-xs">Calibrating Performance Intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white">
            Organizational <span className="text-indigo-400 italic font-medium">Intelligence</span>
          </h1>
          <p className="text-navy-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">
            Strategic performance metrics and multidimensional growth vectors
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[200px] h-11 bg-navy-900 border-navy-800 rounded-xl font-black text-[10px] uppercase tracking-widest text-white outline-none ring-0">
            <Calendar className="h-4 w-4 mr-2 text-indigo-500" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl bg-navy-900 border-navy-800 text-white">
            <SelectItem value="1month" className="uppercase text-[10px] font-black tracking-widest cursor-pointer">Last 30 Days</SelectItem>
            <SelectItem value="3months" className="uppercase text-[10px] font-black tracking-widest cursor-pointer">Quarterly</SelectItem>
            <SelectItem value="6months" className="uppercase text-[10px] font-black tracking-widest cursor-pointer">Semester</SelectItem>
            <SelectItem value="1year" className="uppercase text-[10px] font-black tracking-widest cursor-pointer">Annual Cycle</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Primary Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Gross Revenue', value: `LKR ${(data.summary?.grossRevenue?.value || 0).toLocaleString()}`, change: data.summary?.grossRevenue?.change || 0, icon: DollarSign, color: 'text-emerald-400', sub: 'Fiscal throughput' },
          { title: 'Active Network', value: data.summary?.activeAssets?.value || 0, change: data.summary?.activeAssets?.change || 0, icon: Users, color: 'text-indigo-400', sub: 'Member equilibrium' },
          { title: 'Engagement', value: data.summary?.engagementIndex?.value || '0%', change: data.summary?.engagementIndex?.change || 0, icon: Activity, color: 'text-violet-400', sub: 'Attendance yield' },
          { title: 'Stability', value: data.summary?.stabilityScore?.value || '0%', change: data.summary?.stabilityScore?.change || 0, icon: TrendingUp, color: 'text-amber-400', sub: 'Retention factor' },
        ].map((stat, i) => (
          <Card key={i} className="bg-navy-900 border-navy-800 shadow-sm rounded-3xl overflow-hidden group hover:shadow-xl hover:shadow-indigo-500/5 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-navy-500">{stat.title}</CardTitle>
              <div className={cn("p-2 rounded-xl bg-navy-950 transition-transform group-hover:scale-110", stat.color)}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-white">{stat.value}</div>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase">
                  <TrendingUp className="h-2.5 w-2.5" />
                  <span>{stat.change}%</span>
                </div>
                <span className="text-[9px] font-black text-navy-700 uppercase tracking-widest">{stat.sub}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Analytical Visuals */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Expansion Curve */}
        <Card className="bg-navy-900 border-navy-800 rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black text-white uppercase tracking-tight italic">Expansion Curve</CardTitle>
                <p className="text-[10px] font-black text-navy-600 uppercase tracking-widest mt-1">Longitudinal subscriber growth cycle</p>
              </div>
              <Users className="h-5 w-5 text-indigo-500" />
            </div>
          </CardHeader>
          <CardContent className="p-8 pt-4">
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={data.charts.memberGrowth}>
                <defs>
                  <linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 900 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 900 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '16px', padding: '12px' }}
                  itemStyle={{ color: '#6366f1', fontWeight: 900, fontSize: '10px', textTransform: 'uppercase' }}
                  labelStyle={{ color: '#475569', fontWeight: 900, fontSize: '9px', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="members" stroke="#6366f1" strokeWidth={4} fill="url(#colorMembers)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Fiscal Velocity */}
        <Card className="bg-navy-900 border-navy-800 rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black text-white uppercase tracking-tight italic">Fiscal Velocity</CardTitle>
                <p className="text-[10px] font-black text-navy-600 uppercase tracking-widest mt-1">Transactional energy distribution</p>
              </div>
              <DollarSign className="h-5 w-5 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent className="p-8 pt-4">
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={data.charts.revenueTrend}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 900 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 900 }} />
                <Tooltip
                   contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '16px', padding: '12px' }}
                   itemStyle={{ color: '#10b981', fontWeight: 900, fontSize: '10px', textTransform: 'uppercase' }}
                   labelStyle={{ color: '#475569', fontWeight: 900, fontSize: '9px', marginBottom: '4px' }}
                   formatter={(v: any) => [`LKR ${(v || 0).toLocaleString()}`, 'Revenue']}
                />
                <Line type="stepAfter" dataKey="revenue" stroke="#10b981" strokeWidth={4} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
         {/* Subscriptions */}
         <Card className="bg-navy-900 border-navy-800 rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-xl font-black text-white uppercase tracking-tight italic">Segment Distribution</CardTitle>
            <p className="text-[10px] font-black text-navy-600 uppercase tracking-widest mt-1">Subscription tier concentration</p>
          </CardHeader>
          <CardContent className="p-8 pt-4">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={data.charts.membershipBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={10}
                  dataKey="count"
                >
                  {data.charts.membershipBreakdown.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '16px' }}
                   itemStyle={{ fontWeight: 900, fontSize: '10px', textTransform: 'uppercase' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-6 mt-4">
               {data.charts.membershipBreakdown.map((item: any, index: number) => (
                 <div key={item.plan} className="flex items-center gap-3">
                   <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                   <span className="text-[9px] font-black uppercase text-navy-400 tracking-widest">{item.plan} ({item.percentage}%)</span>
                 </div>
               ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card className="bg-navy-900 border-navy-800 rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8 pb-4">
             <CardTitle className="text-xl font-black text-white uppercase tracking-tight italic">Personnel Impact</CardTitle>
             <p className="text-[10px] font-black text-navy-600 uppercase tracking-widest mt-1">High-value administrative units</p>
          </CardHeader>
          <CardContent className="p-8 pt-4">
             <div className="space-y-6">
                {data.topTrainers.map((trainer: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-3xl bg-navy-950 border border-transparent hover:border-indigo-500/20 transition-all group">
                     <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center font-black text-indigo-400 text-xs">
                           {(trainer.name || 'Anonymous').split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div>
                           <p className="text-xs font-black text-white uppercase tracking-tight group-hover:text-indigo-400 transition-colors">{trainer.name || 'Anonymous Personnel'}</p>
                           <p className="text-[9px] font-black text-navy-600 uppercase tracking-widest">{trainer.sessions ?? 0} Sessions Organized</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-xs font-black text-emerald-400 tracking-tighter">LKR {(trainer.revenue || 0).toLocaleString()}</p>
                        <p className="text-[8px] font-black text-navy-700 uppercase tracking-widest">Yield Produced</p>
                     </div>
                  </div>
                ))}
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
