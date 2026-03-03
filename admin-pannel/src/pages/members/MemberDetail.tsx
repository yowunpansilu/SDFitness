import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Mail, Phone, Calendar, CreditCard, Activity, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import api from '@/lib/api/axios';

const statusColors: Record<string, string> = {
    active: 'bg-green-500/20 text-green-400 border-green-500/30',
    inactive: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    suspended: 'bg-red-500/20 text-red-400 border-red-500/30',
    frozen: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

export function MemberDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [member, setMember] = useState<any>(null);
    const [attendance, setAttendance] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [memberRes, attendanceRes] = await Promise.allSettled([
                    api.get(`/members/${id}`),
                    api.get(`/attendance?userId=${id}`)
                ]);
                if (memberRes.status === 'fulfilled') setMember(memberRes.value.data);
                if (attendanceRes.status === 'fulfilled') setAttendance(attendanceRes.value.data || []);
            } catch { /* handled by null check */ }
            setLoading(false);
        };
        fetchData();
    }, [id]);

    if (loading) {
        return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-purple-500 animate-spin" /></div>;
    }

    if (!member) {
        return <div className="text-center py-12"><p className="text-gray-400">Member not found</p><Button onClick={() => navigate('/members')} className="mt-4">Back</Button></div>;
    }

    const user = member.user || {};
    const firstName = user.firstName || '—';
    const lastName = user.lastName || '';
    const email = user.email || '—';
    const phone = user.phone || '—';
    const status = member.status || 'active';
    const memberNumber = member.memberNumber || '—';
    const joinDate = member.joinDate || user.createdAt;
    const subscription = member.subscription || {};
    const healthMetrics = member.healthMetrics || {};
    const emergencyContact = member.emergencyContact || {};
    const fitnessGoals = healthMetrics.fitnessGoals || [];

    const recentAttendance = attendance.slice(0, 10).map((rec: any) => {
        const checkIn = new Date(rec.checkInTime);
        const checkOut = rec.checkOutTime ? new Date(rec.checkOutTime) : null;
        const durationMin = checkOut ? Math.round((checkOut.getTime() - checkIn.getTime()) / 60000) : null;
        return {
            _id: rec._id,
            date: checkIn.toLocaleDateString(),
            checkIn: checkIn.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            checkOut: checkOut ? checkOut.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active',
            duration: durationMin ? `${Math.floor(durationMin / 60)}h ${durationMin % 60}m` : '—',
        };
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/members')} className="text-gray-400 hover:text-white hover:bg-dark-800">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Member Details</h1>
                        <p className="text-gray-400 mt-1">{memberNumber} • Joined {joinDate ? new Date(joinDate).toLocaleDateString() : '—'}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="border-dark-700 text-gray-400 hover:text-white hover:bg-dark-800"><Edit className="h-4 w-4 mr-2" /> Edit Member</Button>
                    <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"><Trash2 className="h-4 w-4 mr-2" /> Delete</Button>
                </div>
            </div>

            {/* Profile Card */}
            <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex flex-col items-center md:items-start gap-4">
                            <Avatar className="h-32 w-32 ring-4 ring-purple-500/20">
                                <AvatarImage src={user.profilePhoto || undefined} />
                                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white text-3xl font-semibold">
                                    {firstName[0]}{lastName[0] || ''}
                                </AvatarFallback>
                            </Avatar>
                            <Badge className={statusColors[status] || statusColors.active}>{status}</Badge>
                        </div>
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{firstName} {lastName}</h2>
                                    <p className="text-gray-400 capitalize">{user.gender || '—'} {user.dateOfBirth ? `• ${new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear()} years old` : ''}</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-gray-400"><Mail className="h-4 w-4" /><span className="text-sm">{email}</span></div>
                                    <div className="flex items-center gap-2 text-gray-400"><Phone className="h-4 w-4" /><span className="text-sm">{phone}</span></div>
                                    {user.dateOfBirth && <div className="flex items-center gap-2 text-gray-400"><Calendar className="h-4 w-4" /><span className="text-sm">Birthday: {new Date(user.dateOfBirth).toLocaleDateString()}</span></div>}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="p-4 rounded-lg bg-dark-950/50 border border-dark-800">
                                    <div className="flex items-center justify-between mb-2"><span className="text-sm text-gray-400">Current Membership</span><CreditCard className="h-4 w-4 text-purple-400" /></div>
                                    <p className="text-lg font-semibold text-white">{subscription.plan?.name || member.membershipType || '—'}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {subscription.endDate ? `Valid until ${new Date(subscription.endDate).toLocaleDateString()}` : 'No active subscription'}
                                    </p>
                                </div>
                                <div className="p-4 rounded-lg bg-dark-950/50 border border-dark-800">
                                    <div className="flex items-center justify-between mb-2"><span className="text-sm text-gray-400">Total Visits</span><Activity className="h-4 w-4 text-green-400" /></div>
                                    <p className="text-lg font-semibold text-white">{attendance.length}</p>
                                    <p className="text-xs text-gray-500 mt-1">Check-in records</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="bg-dark-900/50 border border-dark-800">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">Overview</TabsTrigger>
                    <TabsTrigger value="attendance" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">Attendance</TabsTrigger>
                    <TabsTrigger value="health" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">Health Metrics</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                            <CardHeader><CardTitle className="text-white">Emergency Contact</CardTitle></CardHeader>
                            <CardContent className="space-y-3">
                                <div><p className="text-sm text-gray-400">Name</p><p className="text-white font-medium">{emergencyContact.name || '—'}</p></div>
                                <div><p className="text-sm text-gray-400">Relationship</p><p className="text-white font-medium">{emergencyContact.relationship || '—'}</p></div>
                                <div><p className="text-sm text-gray-400">Phone</p><p className="text-white font-medium">{emergencyContact.phone || '—'}</p></div>
                            </CardContent>
                        </Card>
                        <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                            <CardHeader><CardTitle className="text-white">Fitness Goals</CardTitle></CardHeader>
                            <CardContent>
                                {fitnessGoals.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {fitnessGoals.map((goal: string) => (
                                            <Badge key={goal} className="bg-purple-500/20 text-purple-400 border-purple-500/30">{goal.replace('_', ' ')}</Badge>
                                        ))}
                                    </div>
                                ) : <p className="text-gray-400">No fitness goals set</p>}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="attendance">
                    <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                        <CardHeader><CardTitle className="text-white">Recent Attendance</CardTitle><p className="text-sm text-gray-400">Check-in and check-out records</p></CardHeader>
                        <CardContent>
                            {recentAttendance.length === 0 ? (
                                <p className="text-gray-400 text-center py-8">No attendance records found</p>
                            ) : (
                                <Table>
                                    <TableHeader><TableRow className="border-dark-800"><TableHead className="text-gray-400">Date</TableHead><TableHead className="text-gray-400">Check In</TableHead><TableHead className="text-gray-400">Check Out</TableHead><TableHead className="text-gray-400">Duration</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {recentAttendance.map((record) => (
                                            <TableRow key={record._id} className="border-dark-800">
                                                <TableCell className="text-gray-300">{record.date}</TableCell>
                                                <TableCell className="text-gray-300">{record.checkIn}</TableCell>
                                                <TableCell className="text-gray-300">{record.checkOut}</TableCell>
                                                <TableCell className="text-gray-300">{record.duration}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="health">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[
                            { label: 'Height', value: healthMetrics.height ? `${healthMetrics.height} cm` : '—' },
                            { label: 'Current Weight', value: healthMetrics.weight ? `${healthMetrics.weight} kg` : '—' },
                            { label: 'Target Weight', value: healthMetrics.targetWeight ? `${healthMetrics.targetWeight} kg` : '—' },
                            { label: 'BMI', value: healthMetrics.bmi || '—' },
                        ].map(({ label, value }) => (
                            <Card key={label} className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                                <CardHeader><CardTitle className="text-sm text-gray-400">{label}</CardTitle></CardHeader>
                                <CardContent><p className="text-2xl font-bold text-white">{value}</p></CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
