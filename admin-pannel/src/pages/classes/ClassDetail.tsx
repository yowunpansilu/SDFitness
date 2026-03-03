import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Users, Clock, MapPin, Calendar, User, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import api from '@/lib/api/axios';

const classTypeColors: Record<string, string> = {
    yoga: 'from-purple-500 to-pink-600',
    hiit: 'from-orange-500 to-red-600',
    spin: 'from-blue-500 to-cyan-600',
    strength: 'from-amber-500 to-orange-600',
    cardio: 'from-green-500 to-emerald-600',
    pilates: 'from-indigo-500 to-purple-600',
};

export function ClassDetail() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [cls, setCls] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClass = async () => {
            try {
                const res = await api.get(`/classes/${id}`);
                setCls(res.data);
            } catch { setCls(null); }
            setLoading(false);
        };
        fetchClass();
    }, [id]);

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-purple-500 animate-spin" /></div>;
    if (!cls) return <div className="text-center py-12"><p className="text-gray-400">Class not found</p><Button onClick={() => navigate('/classes')} className="mt-4">Back</Button></div>;

    const schedule = cls.schedule || {};
    const trainer = cls.trainer || {};
    const trainerUser = trainer.user || {};
    const trainerName = `${trainerUser.firstName || ''} ${trainerUser.lastName || ''}`.trim() || 'TBD';
    const capacity = cls.capacity || 0;
    const enrolled = cls.enrolledCount || cls.enrolled?.length || 0;
    const enrollmentPercentage = capacity > 0 ? (enrolled / capacity) * 100 : 0;
    const spotsRemaining = capacity - enrolled;
    const classType = cls.type || trainer.specialization?.[0]?.toLowerCase() || 'other';
    const duration = schedule.startTime && schedule.endTime
        ? (parseInt(schedule.endTime.split(':')[0]) * 60 + parseInt(schedule.endTime.split(':')[1])) - (parseInt(schedule.startTime.split(':')[0]) * 60 + parseInt(schedule.startTime.split(':')[1]))
        : 60;

    const enrolledMembers = (cls.enrolled || []).map((m: any) => {
        if (typeof m === 'string') return { _id: m, name: 'Member', joinedDate: '' };
        const u = m.user || m;
        return { _id: m._id || '', name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Member', joinedDate: m.joinDate || m.createdAt || '' };
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate('/classes')} className="text-gray-400 hover:text-white"><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
                    <div>
                        <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">{cls.name}</h1>
                        <p className="text-gray-400 mt-2">Class Details & Enrollment</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button onClick={() => navigate(`/classes/edit/${id}`)} className="bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30"><Edit className="h-4 w-4 mr-2" /> Edit Class</Button>
                    <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/20"><Trash2 className="h-4 w-4 mr-2" /> Delete</Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-400">Enrollment</CardTitle></CardHeader>
                    <CardContent><div className="text-3xl font-bold text-white">{enrolled}/{capacity}</div><p className="text-xs text-gray-500 mt-1">{enrollmentPercentage.toFixed(0)}% Full</p></CardContent>
                </Card>
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-400">Spots Remaining</CardTitle></CardHeader>
                    <CardContent><div className="text-3xl font-bold text-white">{spotsRemaining}</div><p className="text-xs text-gray-500 mt-1">Available spots</p></CardContent>
                </Card>
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-400">Duration</CardTitle></CardHeader>
                    <CardContent><div className="text-3xl font-bold text-white">{duration}</div><p className="text-xs text-gray-500 mt-1">Minutes</p></CardContent>
                </Card>
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-400">Price</CardTitle></CardHeader>
                    <CardContent><div className="text-3xl font-bold text-white">LKR {cls.price || 0}</div><p className="text-xs text-gray-500 mt-1">Per session</p></CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                        <CardHeader><CardTitle className="text-white flex items-center gap-2"><Calendar className="h-5 w-5" /> Class Information</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {cls.description && <div><label className="text-sm text-gray-400">Description</label><p className="text-white mt-1">{cls.description}</p></div>}
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-sm text-gray-400">Class Type</label><div className="mt-1"><Badge className={cn('text-white bg-gradient-to-r', classTypeColors[classType] || 'from-gray-500 to-gray-600')}>{classType}</Badge></div></div>
                                <div><label className="text-sm text-gray-400 flex items-center gap-2"><MapPin className="h-4 w-4" /> Location</label><p className="text-white mt-1">{cls.location || schedule.room || 'TBD'}</p></div>
                            </div>
                            <div><label className="text-sm text-gray-400 flex items-center gap-2"><Clock className="h-4 w-4" /> Schedule</label><p className="text-white mt-1">{schedule.dayOfWeek || 'TBD'} at {schedule.startTime || 'TBD'} - {schedule.endTime || ''}</p></div>
                            {cls.createdAt && <div><label className="text-sm text-gray-400">Created</label><p className="text-white mt-1">{new Date(cls.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p></div>}
                        </CardContent>
                    </Card>

                    <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                        <CardHeader><CardTitle className="text-white flex items-center gap-2"><Users className="h-5 w-5" /> Enrolled Members ({enrolled})</CardTitle></CardHeader>
                        <CardContent>
                            {enrolledMembers.length === 0 ? (
                                <p className="text-gray-400 text-center py-6">No members enrolled yet</p>
                            ) : (
                                <div className="space-y-3">
                                    {enrolledMembers.map((member: any) => (
                                        <div key={member._id} className="flex items-center justify-between p-3 rounded-lg bg-dark-800/50 hover:bg-dark-800 transition-colors cursor-pointer" onClick={() => navigate(`/members/${member._id}`)}>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10"><AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">{member.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback></Avatar>
                                                <div>
                                                    <p className="text-white font-medium">{member.name}</p>
                                                    {member.joinedDate && <p className="text-xs text-gray-400">Joined {new Date(member.joinedDate).toLocaleDateString()}</p>}
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" className="text-gray-400">View</Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                        <CardHeader><CardTitle className="text-white flex items-center gap-2"><User className="h-5 w-5" /> Trainer</CardTitle></CardHeader>
                        <CardContent>
                            <div className="text-center space-y-4">
                                <Avatar className="h-24 w-24 mx-auto"><AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white text-2xl">{trainerName.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback></Avatar>
                                <div>
                                    <h3 className="text-white font-semibold text-lg">{trainerName}</h3>
                                    {trainerUser.email && <p className="text-gray-400 text-sm">{trainerUser.email}</p>}
                                </div>
                                {trainer.specialization && trainer.specialization.length > 0 && (
                                    <div>
                                        <label className="text-sm text-gray-400 block mb-2">Specializations</label>
                                        <div className="flex flex-wrap gap-2 justify-center">
                                            {trainer.specialization.map((spec: string) => <Badge key={spec} className="bg-blue-500/20 text-blue-400 border-blue-500/30">{spec}</Badge>)}
                                        </div>
                                    </div>
                                )}
                                <Button onClick={() => navigate(`/trainers/${trainer._id}`)} className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white">View Profile</Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                        <CardHeader><CardTitle className="text-white text-sm">Quick Actions</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            <Button variant="outline" className="w-full border-dark-700 text-gray-300 hover:bg-dark-800">Send Notification</Button>
                            <Button variant="outline" className="w-full border-dark-700 text-gray-300 hover:bg-dark-800">Download Roster</Button>
                            <Button variant="outline" className="w-full border-dark-700 text-gray-300 hover:bg-dark-800">Cancel Session</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
