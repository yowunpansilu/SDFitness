import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Award,
  Users,
  Edit,
  Trash2,
  TrendingUp,
  DollarSign,
  Clock,
  Loader2,
  Globe,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import api from '@/lib/api/axios';
import { useToast } from '@/hooks/use-toast';

interface Certification {
  name: string;
  issuer: string;
  issueDate: string;
}

interface Trainer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specializations: string[];
  certifications: Certification[];
  assignedMembers: number;
  rating: number;
  photoUrl?: string;
  status: 'active' | 'inactive' | 'on_leave';
  joinDate: string;
  bio: string;
  hourlyRate: number;
  employmentStatus: string;
  commissionRate: number;
  availableHoursPerWeek: number;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
}

const statusColors = {
  active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  inactive: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  on_leave: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
};

export function TrainerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrainer = async () => {
      try {
        const response = await api.get(`/trainers/${id}`);
        const t = response.data;
        setTrainer({
          id: t._id,
          firstName: t.userId?.firstName || 'Unknown',
          lastName: t.userId?.lastName || 'Faculty',
          email: t.userId?.email || 'N/A',
          phone: t.userId?.phone || 'N/A',
          specializations: t.specializations || [],
          certifications: t.certifications || [],
          assignedMembers: t.assignedMembers || 0,
          rating: t.rating || 5.0,
          photoUrl: t.userId?.avatar,
          status: t.status || 'active',
          joinDate: t.joinDate || t.createdAt,
          bio: t.bio || '',
          hourlyRate: t.hourlyRate || 0,
          employmentStatus: t.employmentStatus || 'full-time',
          commissionRate: t.commissionRate || 0,
          availableHoursPerWeek: t.availableHoursPerWeek || 40,
          emergencyContact: t.emergencyContact || { name: '', relationship: '', phone: '' },
        });
      } catch (error) {
        console.error('Failed to fetch trainer:', error);
        toast({
          title: 'Error',
          description: 'Failed to synchronize faculty profile.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrainer();
  }, [id, toast]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to terminate this faculty assignment? This action is permanent.')) return;
    try {
      await api.delete(`/trainers/${id}`);
      toast({
        title: 'Faculty Terminated',
        description: 'Profile has been successfully purged from the matrix.',
      });
      navigate('/trainers');
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to terminate faculty profile.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-navy-600">Retrieving Faculty System</p>
      </div>
    );
  }

  if (!trainer) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white uppercase">Profile Not Located</h2>
        <Button onClick={() => navigate('/trainers')} className="mt-4">Return to Faculty List</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate('/trainers')}
        className="text-slate-400 dark:text-navy-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800/50 rounded-xl transition-all font-bold uppercase text-xs tracking-widest"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Faculty System
      </Button>

      {/* Trainer Header */}
      <Card className="bg-white dark:bg-navy-900/50 border-slate-200 dark:border-navy-800 backdrop-blur-sm rounded-3xl overflow-hidden transition-colors">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row gap-8">
            <Avatar className="h-32 w-32 ring-4 ring-indigo-500/20 shadow-2xl">
              <AvatarImage src={trainer.photoUrl} />
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white text-3xl font-bold">
                {trainer.firstName[0]}{trainer.lastName[0]}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white transition-colors uppercase">
                    {trainer.firstName} <span className="text-indigo-600 dark:text-indigo-400">{trainer.lastName}</span>
                  </h1>
                  <Badge className={cn('mt-3 px-4 py-1 rounded-full font-bold text-xs uppercase tracking-widest transition-colors', statusColors[trainer.status])}>
                    {trainer.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate(`/trainers/edit/${id}`)}
                    className="h-10 w-10 border-slate-200 dark:border-navy-800 text-slate-400 dark:text-navy-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-navy-800 rounded-xl transition-all"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleDelete}
                    className="h-10 w-10 border-slate-200 dark:border-navy-800 text-slate-400 dark:text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex items-center gap-3 text-slate-500 dark:text-navy-400">
                  <div className="h-8 w-8 rounded-lg bg-slate-50 dark:bg-navy-950 flex items-center justify-center">
                    <Mail className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-bold">{trainer.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500 dark:text-navy-400">
                  <div className="h-8 w-8 rounded-lg bg-slate-50 dark:bg-navy-950 flex items-center justify-center">
                    <Phone className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-bold">{trainer.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500 dark:text-navy-400">
                  <div className="h-8 w-8 rounded-lg bg-slate-50 dark:bg-navy-950 flex items-center justify-center">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-bold">Activated {new Date(trainer.joinDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500 dark:text-navy-400">
                  <div className="h-8 w-8 rounded-lg bg-slate-50 dark:bg-navy-950 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-bold">Rating {trainer.rating}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        {[
          { label: 'Assigned Members', value: trainer.assignedMembers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Avg Rating', value: trainer.rating, icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Simulated Sessions', value: '156', icon: Clock, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Simulated Revenue', value: `LKR${(trainer.hourlyRate * 156 * 0.7).toLocaleString()}`, icon: DollarSign, color: 'text-indigo-500', bg: 'bg-indigo-500/10' }
        ].map((stat, i) => (
          <Card key={i} className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 rounded-2xl shadow-sm transition-colors overflow-hidden group">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-navy-600">{stat.label}</CardTitle>
                <div className={cn("p-2 rounded-xl transition-transform group-hover:scale-110", stat.bg)}>
                  <stat.icon className={cn("h-4 w-4", stat.color)} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-white transition-colors">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-white dark:bg-navy-900 p-1.5 rounded-2xl border border-slate-100 dark:border-navy-800 shadow-sm transition-colors h-auto w-full md:w-auto">
          {['overview', 'members', 'schedule', 'certifications'].map(t => (
            <TabsTrigger
              key={t}
              value={t}
              className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest data-[state=active]:bg-indigo-600 dark:data-[state=active]:bg-indigo-500 data-[state=active]:text-white transition-all capitalize"
            >
              {t}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 rounded-3xl transition-colors">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-navy-600">Biography</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-navy-300 font-medium leading-relaxed transition-colors">{trainer.bio}</p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 rounded-3xl transition-colors">
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-navy-600 flex items-center gap-2">
                  <Award className="h-5 w-5 text-indigo-500" />
                  Performance Specializations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {trainer.specializations.map((spec) => (
                    <Badge key={spec} className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50 font-bold text-xs uppercase tracking-widest px-4 py-2 rounded-xl transition-colors">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-50 dark:bg-navy-950 border-none rounded-3xl transition-colors">
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-navy-600">Emergency Protocol</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-navy-600 mb-1">Contact Name</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white transition-colors">{trainer.emergencyContact.name}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-navy-600 mb-1">Secure Line</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white transition-colors">{trainer.emergencyContact.phone}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Assigned Members Tab */}
        <TabsContent value="members">
          <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 rounded-3xl overflow-hidden transition-colors shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-navy-600">Student System ({trainer.assignedMembers})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 dark:bg-navy-950/50 border-y border-slate-100 dark:border-navy-800 transition-colors">
                    <TableHead className="font-bold text-xs uppercase tracking-widest pl-8 text-slate-700 dark:text-navy-400">Student Profile</TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-widest text-slate-700 dark:text-navy-400">Tier Status</TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-widest text-slate-700 dark:text-navy-400">Enrolled On</TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-widest text-slate-700 dark:text-navy-400 text-right pr-8">Sessions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-navy-600">
                      No active student units assigned to this faculty
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule">
          <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 rounded-3xl transition-colors shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-navy-600">Shift Protocol System</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-32 flex flex-col items-center justify-center text-center space-y-4">
                  <Globe className="h-8 w-8 text-slate-200 dark:text-navy-800" />
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-navy-600">Standard faculty shifts currently in reconciliation</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Certifications Tab */}
        <TabsContent value="certifications">
          <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 rounded-3xl transition-colors shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-navy-600">Certified System Credentials</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {trainer.certifications.length > 0 ? (
                  trainer.certifications.map((cert) => (
                    <div
                      key={cert.name}
                      className="flex items-center gap-4 p-6 rounded-2xl bg-slate-50 dark:bg-navy-950/50 border border-slate-100 dark:border-navy-800 transition-all hover:bg-white dark:hover:bg-navy-950 group"
                    >
                      <div className="h-12 w-12 rounded-xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-500 transition-transform group-hover:scale-110">
                        <Award className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-base font-bold text-slate-900 dark:text-white leading-none mb-1 uppercase tracking-tight transition-colors">{cert.name}</p>
                        <p className="text-xs text-slate-400 dark:text-navy-600 font-bold uppercase tracking-widest">{cert.issuer} • {new Date(cert.issueDate).getFullYear()}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 py-12 flex flex-col items-center justify-center text-center space-y-4">
                    <ShieldAlert className="h-8 w-8 text-slate-200 dark:text-navy-800" />
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-navy-600">No validated credentials on file for this faculty unit</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
