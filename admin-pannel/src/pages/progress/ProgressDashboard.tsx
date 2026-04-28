import { useState, useEffect } from 'react';
import {
    Activity,
    TrendingUp,
    Calendar,
    Search,
    User,
    ChevronRight,
    Scale
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import api from '@/lib/api/axios';
import { format } from 'date-fns';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export function ProgressDashboard() {
    const [members, setMembers] = useState<{ _id: string; firstName?: string; lastName?: string; memberId?: string; currentWeight?: number; goal?: string }[]>([]);
    const [search, setSearch] = useState('');
    const [selectedMember, setSelectedMember] = useState<{ _id: string; firstName?: string; lastName?: string; memberId?: string; currentWeight?: number; goal?: string } | null>(null);
    const [weeklyProgress, setWeeklyProgress] = useState<{ date: string; workout: number; diet: number }[]>([]);
    const [fetchingProgress, setFetchingProgress] = useState(false);

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const res = await api.get('/admin/members'); // Assuming this endpoint exists for member search
            setMembers(res.data.members || res.data);
        } catch (err) {
            console.error('Error fetching members:', err);
        }
    };

    const handleSelectMember = async (member: { _id: string; firstName?: string; lastName?: string; memberId?: string; currentWeight?: number; goal?: string }) => {
        setSelectedMember(member);
        setFetchingProgress(true);
        try {
            const res = await api.get(`/progress/weekly?userId=${member._id}`);
            const chartData = res.data.map((item: { date: string; workoutCompleted?: boolean; dietFollowed?: boolean }) => ({
                date: format(new Date(item.date), 'EEE'),
                workout: item.workoutCompleted ? 1 : 0,
                diet: item.dietFollowed ? 1 : 0,
            }));
            setWeeklyProgress(chartData);
        } catch (err) {
            console.error('Error fetching member progress:', err);
        } finally {
            setFetchingProgress(false);
        }
    };

    const filteredMembers = members.filter(m =>
        `${m.firstName} ${m.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        m.memberId?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-black text-white uppercase italic tracking-tight">
                    Member <span className="text-indigo-400">Progress</span>
                </h1>
                <p className="text-navy-400 text-sm font-bold uppercase tracking-widest text-xs">Monitor consistency and transformation metrics</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Search Sidebar */}
                <Card className="bg-navy-900/50 border-navy-800 lg:col-span-1 flex flex-col h-[700px]">
                    <CardHeader className="border-b border-navy-800">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-500" />
                            <Input
                                placeholder="Search member name or ID..."
                                className="pl-10 bg-navy-950 border-navy-800 text-white placeholder:text-navy-600 rounded-xl"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 overflow-y-auto scrollbar-thin scrollbar-thumb-navy-800">
                        <div className="divide-y divide-navy-800">
                            {filteredMembers.map((member) => (
                                <button
                                    key={member._id}
                                    onClick={() => handleSelectMember(member)}
                                    className={cn(
                                        "w-full flex items-center gap-3 p-4 text-left transition-all",
                                        selectedMember?._id === member._id
                                            ? "bg-indigo-600/10 border-l-4 border-indigo-500 text-white"
                                            : "text-navy-300 hover:bg-navy-800/50"
                                    )}
                                >
                                    <div className="w-10 h-10 rounded-full bg-navy-800 flex items-center justify-center font-bold text-xs">
                                        {member.firstName?.[0]}{member.lastName?.[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold truncate">{member.firstName} {member.lastName}</p>
                                        <p className="text-[10px] text-navy-500 font-black uppercase">{member.memberId}</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-navy-600" />
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Dashboard View */}
                <div className="lg:col-span-2 space-y-6">
                    {selectedMember ? (
                        <>
                            {/* Member Header */}
                            <Card className="bg-indigo-600 border-none overflow-hidden text-white shadow-xl shadow-indigo-900/20">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                                            <User className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black italic uppercase tracking-tighter">
                                                {selectedMember.firstName} {selectedMember.lastName}
                                            </h2>
                                            <div className="flex items-center gap-4 mt-1">
                                                <div className="flex items-center gap-1.5 text-indigo-100 text-xs font-bold uppercase tracking-wider">
                                                    <Scale className="w-3.5 h-3.5" />
                                                    Current: {selectedMember.currentWeight || 'N/A'} kg
                                                </div>
                                                <div className="flex items-center gap-1.5 text-indigo-100 text-xs font-bold uppercase tracking-wider">
                                                    <Activity className="w-3.5 h-3.5" />
                                                    Goal: {selectedMember.goal || 'Fitness'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Weekly Consistency Chart */}
                                <Card className="bg-navy-900/50 border-navy-800">
                                    <CardHeader>
                                        <CardTitle className="text-sm font-black uppercase tracking-widest text-navy-400 flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                                            Weekly Consistency
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="h-[300px]">
                                        {fetchingProgress ? (
                                            <div className="h-full flex items-center justify-center animate-pulse bg-navy-800/10 rounded-xl" />
                                        ) : weeklyProgress.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                                <BarChart data={weeklyProgress}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                                                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                                    <YAxis hide />
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                                                        itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                                    />
                                                    <Bar name="Workout" dataKey="workout" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                                    <Bar name="Diet" dataKey="diet" fill="#10b981" radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="h-full flex items-center justify-center text-navy-600 font-bold uppercase text-[10px]">
                                                No activity logs this week
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card className="bg-navy-900/50 border-navy-800">
                                    <CardHeader>
                                        <CardTitle className="text-sm font-black uppercase tracking-widest text-navy-400 flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-indigo-400" />
                                            Goal Target
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex flex-col items-center justify-center py-12">
                                        <div className="w-32 h-32 rounded-full border-8 border-navy-800 flex items-center justify-center relative">
                                            <div className="absolute inset-0 rounded-full border-8 border-indigo-500 border-t-transparent animate-spin-slow" />
                                            <div className="text-center">
                                                <p className="text-2xl font-black text-white italic">75%</p>
                                                <p className="text-[8px] font-black uppercase text-navy-500">Progress</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </>
                    ) : (
                        <Card className="bg-navy-900/50 border-navy-800 border-dashed h-full min-h-[400px] flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-navy-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-navy-600">
                                    <User className="w-8 h-8" />
                                </div>
                                <h3 className="text-white font-black uppercase italic tracking-tight">Select a Member</h3>
                                <p className="text-navy-500 text-xs font-bold uppercase tracking-widest mt-1">to view their transformation data</p>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
