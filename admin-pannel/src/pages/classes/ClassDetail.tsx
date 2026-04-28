import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '@/lib/api/axios';
import { ArrowLeft, Edit, Users, Clock, MapPin, Calendar, User, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const classTypeColors = {
  yoga: 'from-purple-500 to-pink-600',
  hiit: 'from-orange-500 to-red-600',
  spin: 'from-blue-500 to-cyan-600',
  strength: 'from-amber-500 to-orange-600',
  cardio: 'from-green-500 to-emerald-600',
  pilates: 'from-indigo-500 to-purple-600',
};

// Mock data removed - fetching from API

interface GymClass {
  name: string;
  enrolled: number;
  enrolledMembers?: { _id: string; photoUrl?: string; firstName?: string; lastName?: string; createdAt: string }[];
  capacity: number;
  duration?: number;
  price?: number;
  description?: string;
  type?: string;
  location?: string;
  schedule?: { duration?: number; dayOfWeek?: string; startTime?: string };
  createdAt: string;
  trainer?: { _id: string; photoUrl?: string; userId?: { firstName?: string; lastName?: string; email?: string }; specialization?: string[] };
}

export function ClassDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [gymClass, setGymClass] = useState<GymClass | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClassDetails = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/classes/${id}`);
        setGymClass(response.data);
      } catch (error) {
        console.error('Error fetching class details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClassDetails();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('CRITICAL: ARE YOU SURE YOU WANT TO WIPE THIS PROTOCOL?')) {
      try {
        await api.delete(`/classes/${id}`);
        navigate('/classes');
      } catch (error) {
        console.error('Error deleting class:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-400 font-bold uppercase text-xs tracking-widest animate-pulse">Accessing Encrypted Protocol...</div>
      </div>
    );
  }

  if (!gymClass) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="text-rose-500 font-bold uppercase text-xs tracking-widest">Protocol Not Found</div>
        <Button onClick={() => navigate('/classes')} variant="outline" className="rounded-xl font-bold uppercase text-xs tracking-widest px-6">Return to Grid</Button>
      </div>
    );
  }

  const enrollmentPercentage = (gymClass.enrolled / gymClass.capacity) * 100;
  const spotsRemaining = gymClass.capacity - gymClass.enrolled;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/classes')}
            className="h-12 w-12 rounded-2xl text-slate-400 dark:text-navy-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-navy-800/50 transition-all p-0 flex items-center justify-center"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white transition-colors">
              {gymClass.name.toUpperCase()}
            </h1>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-navy-600 mt-1">Class Protocol & Enrollment System</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => navigate(`/classes/edit/${id}`)}
            className="px-6 py-6 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white hover:border-indigo-500 dark:hover:border-indigo-500 font-bold uppercase text-xs tracking-widest rounded-2xl transition-all shadow-sm flex items-center gap-3"
          >
            <Edit className="h-4 w-4 text-indigo-500" />
            Edit Protocol
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            className="px-6 py-6 border-slate-200 dark:border-navy-800 text-slate-400 dark:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 font-bold uppercase text-xs tracking-widest rounded-2xl transition-all flex items-center gap-3"
          >
            <Trash2 className="h-4 w-4" />
            Wipe
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        {[
          { label: 'Enrollment', value: `${gymClass.enrolledMembers ? gymClass.enrolledMembers.length : gymClass.enrolled}/${gymClass.capacity}`, sub: `${enrollmentPercentage.toFixed(0)}% Capacity`, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
          { label: 'Spots Available', value: spotsRemaining, sub: 'Field Capacity', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Duration', value: gymClass.duration || gymClass.schedule?.duration || 60, sub: 'Minutes / Session', color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Class Price', value: `LKR ${gymClass.price || 0}`, sub: 'Per Activation', color: 'text-rose-500', bg: 'bg-rose-500/10' }
        ].map((stat, i) => (
          <Card key={i} className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 rounded-3xl shadow-sm transition-colors overflow-hidden group">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-navy-600">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-white transition-colors">
                {stat.value}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", stat.bg.replace('10', '100'))} />
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-navy-500">{stat.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Class Information */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 rounded-[2.5rem] shadow-sm transition-colors overflow-hidden">
            <CardHeader className="p-10 pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-tight text-slate-400 dark:text-navy-600 flex items-center gap-3">
                <Calendar className="h-5 w-5 text-indigo-500" />
                Class Protocol Info
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 pt-0 space-y-10">
              <div className="p-8 rounded-3xl bg-slate-50 dark:bg-navy-950/50 border border-slate-100 dark:border-navy-800 transition-colors">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-navy-600 mb-3 block">Manifesto</label>
                <p className="text-slate-600 dark:text-navy-300 font-medium leading-relaxed text-lg transition-colors">{gymClass.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-navy-600">Faculty Assignment</label>
                  <div className="inline-block">
                    <Badge
                      className={cn(
                        'px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg text-white bg-gradient-to-r',
                        classTypeColors[gymClass.type as keyof typeof classTypeColors] || 'from-slate-500 to-slate-600'
                      )}
                    >
                      {(gymClass.type || 'PROTOCOL').toUpperCase()} Prime
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-navy-600 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-rose-500" />
                    Sector Location
                  </label>
                  <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white transition-colors">{gymClass.location || 'UNASSIGNED SECTOR'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-navy-600 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-emerald-500" />
                    Shift Schedule
                  </label>
                  <p className="text-lg font-bold text-slate-900 dark:text-white transition-colors">
                    {gymClass.schedule?.dayOfWeek?.toUpperCase() || 'UNSCHEDULED'} <span className="text-indigo-600 dark:text-indigo-400 ml-2 font-bold">{gymClass.schedule?.startTime}</span>
                  </p>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-navy-600">Registation</label>
                  <p className="text-lg font-bold text-slate-900 dark:text-white transition-colors">
                    {new Date(gymClass.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    }).toUpperCase()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enrolled Members */}
          <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 rounded-[2.5rem] shadow-sm transition-colors overflow-hidden">
            <CardHeader className="p-10 pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-tight text-slate-400 dark:text-navy-600 flex items-center gap-3">
                <Users className="h-5 w-5 text-indigo-500" />
                Active Enrollments ({gymClass.enrolled})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-50 dark:divide-navy-950">
                {(gymClass.enrolledMembers || []).map((member: { _id: string; photoUrl?: string; firstName?: string; lastName?: string; createdAt: string }) => (
                  <div
                    key={member._id}
                    className="flex items-center justify-between p-8 hover:bg-slate-50 dark:hover:bg-navy-950/50 transition-all cursor-pointer group"
                    onClick={() => navigate(`/members/${member._id}`)}
                  >
                    <div className="flex items-center gap-6">
                      <Avatar className="h-14 w-14 border-4 border-white dark:border-navy-900 shadow-xl transition-transform group-hover:scale-95">
                        <AvatarImage src={member.photoUrl} />
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-bold">
                          {member.firstName?.[0]}{member.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-lg font-bold text-slate-900 dark:text-white transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400 leading-tight">
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-navy-600 mt-1">
                          Activated On {new Date(member.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" className="h-12 px-6 rounded-2xl bg-slate-50 dark:bg-navy-950 text-slate-400 dark:text-navy-500 group-hover:bg-indigo-600 group-hover:text-white font-bold uppercase text-xs tracking-widest transition-all">
                      Open Profile
                    </Button>
                  </div>
                ))}
                {(gymClass.enrolledMembers || []).length === 0 && (
                  <div className="p-20 text-center">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-300 dark:text-navy-800">No Active Deployments Detected</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trainer Info */}
        <div className="space-y-8">
          <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 rounded-[2.5rem] shadow-sm transition-colors overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-tight text-slate-400 dark:text-navy-600 flex items-center gap-3 font-bold">
                <User className="h-5 w-5 text-indigo-500" />
                Faculty Lead
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="text-center space-y-6">
                <div className="relative inline-block">
                  <Avatar className="h-32 w-32 border-4 border-slate-50 dark:border-navy-950 shadow-2xl transition-transform hover:scale-105">
                    <AvatarImage src={gymClass.trainer?.photoUrl} />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white text-3xl font-bold">
                      {gymClass.trainer?.userId?.firstName?.[0]}{gymClass.trainer?.userId?.lastName?.[0] || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 bg-emerald-500 h-6 w-6 rounded-full border-4 border-white dark:border-navy-900" />
                </div>

                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white transition-colors">
                    {gymClass.trainer?.userId ? (
                      <>
                        {gymClass.trainer.userId.firstName} <span className="text-indigo-600 dark:text-indigo-400">{gymClass.trainer.userId.lastName}</span>
                      </>
                    ) : (
                      'FACULTY UNASSIGNED'
                    )}
                  </h3>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-navy-600 mt-1">{gymClass.trainer?.userId?.email || 'OFFLINE'}</p>
                </div>

                <div className="pt-4 border-t border-slate-50 dark:border-navy-950">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-navy-600 block mb-4">Core Matrices</label>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {(gymClass.trainer?.specialization || []).map((spec: string) => (
                      <Badge
                        key={spec}
                        className="bg-slate-50 dark:bg-navy-950 text-slate-600 dark:text-navy-400 border border-slate-100 dark:border-navy-800 font-bold text-[11px] uppercase tracking-widest px-4 py-1.5 rounded-lg"
                      >
                        {spec}
                      </Badge>
                    ))}
                    {(gymClass.trainer?.specialization || []).length === 0 && (
                      <span className="text-[11px] font-bold uppercase text-slate-300 dark:text-navy-800 tracking-widest">Generalist System</span>
                    )}
                  </div>
                </div>

                <Button
                  onClick={() => gymClass.trainer && navigate(`/trainers/${gymClass.trainer._id}`)}
                  disabled={!gymClass.trainer}
                  className="w-full h-14 bg-slate-900 dark:bg-indigo-600 hover:bg-black dark:hover:bg-indigo-700 text-white font-bold uppercase text-xs tracking-wider rounded-2xl shadow-xl shadow-indigo-500/10 transition-all flex items-center justify-center gap-3"
                >
                  Synchronize Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-slate-50 dark:bg-navy-950/50 border-none rounded-[2.5rem] transition-colors overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-navy-700">Quick Protocols</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-3">
              {[
                { label: 'Broadcast COMMS', icon: User },
                { label: 'Export Roster', icon: Users },
                { label: 'Cancel Session', icon: Clock, color: 'text-rose-500' }
              ].map((action, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className={cn(
                    "w-full h-14 border-white dark:border-navy-900 bg-white dark:bg-navy-900 text-slate-700 dark:text-navy-300 hover:border-indigo-500 font-bold uppercase text-xs tracking-widest rounded-2xl transition-all shadow-sm flex items-center justify-start gap-4 px-6 group",
                    action.color
                  )}
                >
                  <action.icon className="h-4 w-4 transition-transform group-hover:scale-110" />
                  {action.label}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
