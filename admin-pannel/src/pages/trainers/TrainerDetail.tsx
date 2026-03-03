import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Calendar, Award, Users, Edit, Trash2, TrendingUp, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import api from '@/lib/api/axios';

const statusColors: Record<string, string> = {
    active: 'bg-green-500/20 text-green-400 border-green-500/30',
    inactive: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    on_leave: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
};

export function TrainerDetail() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [trainer, setTrainer] = useState<any>(null);
    const [classes, setClasses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [trainerRes, classesRes] = await Promise.allSettled([
                    api.get(`/trainers/${id}`),
                    api.get('/classes'),
                ]);
                if (trainerRes.status === 'fulfilled') setTrainer(trainerRes.value.data);
                if (classesRes.status === 'fulfilled') {
                    const allClasses = classesRes.value.data || [];
                    setClasses(allClasses.filter((c: any) =>
                        c.trainer?._id === id || c.trainer === id
                    ));
                }
            } catch { /* handled by null check */ }
            setLoading(false);
        };
        fetchData();
    }, [id]);

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-purple-500 animate-spin" /></div>;
    if (!trainer) return <div className="text-center py-12"><p className="text-gray-400">Trainer not found</p><Button onClick={() => navigate('/trainers')} className="mt-4">Back</Button></div>;

    const user = trainer.user || {};
    const firstName = user.firstName || '—';
    const lastName = user.lastName || '';
    const email = user.email || '—';
    const phone = user.phone || '—';
    const status = trainer.status || 'active';
    const specializations = trainer.specialization || [];
    const certifications = trainer.certifications || [];
    const bio = trainer.bio || 'No bio available.';
    const hireDate = trainer.hireDate || user.createdAt;
    const rating = trainer.rating || 0;
    const emergencyContact = trainer.emergencyContact || {};

    return (
        <div className="space-y-6">
            <Button variant="ghost" onClick={() => navigate('/trainers')} className="text-gray-400 hover:text-white hover:bg-dark-800"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Trainers</Button>

            {/* Header Card */}
            <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        <Avatar className="h-32 w-32 ring-4 ring-purple-500/20">
                            <AvatarImage src={user.profilePhoto || undefined} />
                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white text-3xl font-bold">{firstName[0]}{lastName[0] || ''}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-white">{firstName} {lastName}</h1>
                                    <Badge className={cn('mt-2', statusColors[status] || statusColors.active)}>{status.replace('_', ' ')}</Badge>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="icon" className="border-dark-700 text-gray-400 hover:text-white hover:bg-dark-800"><Edit className="h-4 w-4" /></Button>
                                    <Button variant="outline" size="icon" className="border-dark-700 text-gray-400 hover:text-red-400 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            </div>
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-2 text-gray-400"><Mail className="h-4 w-4" /><span>{email}</span></div>
                                <div className="flex items-center gap-2 text-gray-400"><Phone className="h-4 w-4" /><span>{phone}</span></div>
                                <div className="flex items-center gap-2 text-gray-400"><Calendar className="h-4 w-4" /><span>Hired: {hireDate ? new Date(hireDate).toLocaleDateString() : '—'}</span></div>
                                <div className="flex items-center gap-2 text-gray-400"><TrendingUp className="h-4 w-4" /><span>Rating: {rating} / 5.0</span></div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader className="pb-2"><div className="flex items-center justify-between"><CardTitle className="text-sm font-medium text-gray-400">Assigned Classes</CardTitle><Users className="h-4 w-4 text-blue-400" /></div></CardHeader>
                    <CardContent><div className="text-3xl font-bold text-white">{classes.length}</div></CardContent>
                </Card>
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader className="pb-2"><div className="flex items-center justify-between"><CardTitle className="text-sm font-medium text-gray-400">Rating</CardTitle><TrendingUp className="h-4 w-4 text-amber-400" /></div></CardHeader>
                    <CardContent><div className="text-3xl font-bold text-white">{rating}</div><p className="text-xs text-gray-500 mt-1">out of 5.0</p></CardContent>
                </Card>
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader className="pb-2"><div className="flex items-center justify-between"><CardTitle className="text-sm font-medium text-gray-400">Specializations</CardTitle><Award className="h-4 w-4 text-green-400" /></div></CardHeader>
                    <CardContent><div className="text-3xl font-bold text-white">{specializations.length}</div></CardContent>
                </Card>
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader className="pb-2"><div className="flex items-center justify-between"><CardTitle className="text-sm font-medium text-gray-400">Certifications</CardTitle><Clock className="h-4 w-4 text-purple-400" /></div></CardHeader>
                    <CardContent><div className="text-3xl font-bold text-white">{certifications.length}</div></CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="bg-dark-900/50 border border-dark-800">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="classes">Assigned Classes</TabsTrigger>
                    <TabsTrigger value="certifications">Certifications</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                        <CardHeader><CardTitle className="text-white">Bio</CardTitle></CardHeader>
                        <CardContent><p className="text-gray-400 leading-relaxed">{bio}</p></CardContent>
                    </Card>
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                            <CardHeader><CardTitle className="text-white flex items-center gap-2"><Award className="h-5 w-5 text-purple-400" /> Specializations</CardTitle></CardHeader>
                            <CardContent>
                                {specializations.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">{specializations.map((spec: string) => <Badge key={spec} className="bg-purple-500/20 text-purple-400 border-purple-500/30">{spec}</Badge>)}</div>
                                ) : <p className="text-gray-400">None listed</p>}
                            </CardContent>
                        </Card>
                        <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                            <CardHeader><CardTitle className="text-white">Emergency Contact</CardTitle></CardHeader>
                            <CardContent className="space-y-2">
                                <div className="text-gray-400"><p className="text-sm text-gray-500">Name</p><p className="text-white">{emergencyContact.name || '—'}</p></div>
                                <div className="text-gray-400"><p className="text-sm text-gray-500">Phone</p><p className="text-white">{emergencyContact.phone || '—'}</p></div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="classes">
                    <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                        <CardHeader><CardTitle className="text-white">Assigned Classes ({classes.length})</CardTitle></CardHeader>
                        <CardContent>
                            {classes.length === 0 ? (
                                <p className="text-gray-400 text-center py-8">No classes assigned</p>
                            ) : (
                                <Table>
                                    <TableHeader><TableRow className="border-dark-700 hover:bg-transparent"><TableHead className="text-gray-400">Class</TableHead><TableHead className="text-gray-400">Schedule</TableHead><TableHead className="text-gray-400">Capacity</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {classes.map((cls: any) => (
                                            <TableRow key={cls._id} className="border-dark-700 hover:bg-dark-800/50 cursor-pointer" onClick={() => navigate(`/classes/${cls._id}`)}>
                                                <TableCell className="text-white font-medium">{cls.name}</TableCell>
                                                <TableCell className="text-gray-400">{cls.schedule?.dayOfWeek || '—'} {cls.schedule?.startTime || ''}</TableCell>
                                                <TableCell className="text-gray-400">{cls.enrolled || 0}/{cls.capacity || 0}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="certifications">
                    <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                        <CardHeader><CardTitle className="text-white">Certifications & Credentials</CardTitle></CardHeader>
                        <CardContent>
                            {certifications.length === 0 ? (
                                <p className="text-gray-400 text-center py-8">No certifications recorded</p>
                            ) : (
                                <div className="grid md:grid-cols-2 gap-4">
                                    {certifications.map((cert: string) => (
                                        <div key={cert} className="flex items-center gap-3 p-4 rounded-lg bg-dark-800/50 border border-dark-700">
                                            <div className="p-2 rounded-lg bg-amber-500/20"><Award className="h-5 w-5 text-amber-400" /></div>
                                            <div><p className="text-white font-semibold">{cert}</p><p className="text-sm text-gray-500">Valid</p></div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
