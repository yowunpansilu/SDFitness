import { useNavigate, useParams } from 'react-router-dom';
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

// Mock data - in real app, fetch based on ID
const mockClass = {
  id: '1',
  name: 'Morning Yoga Flow',
  type: 'yoga' as const,
  description: 'Start your day with an energizing yoga session designed to improve flexibility and strength. Suitable for all levels.',
  trainer: {
    id: '3',
    name: 'Emma Wilson',
    photoUrl: undefined,
    email: 'emma.wilson@sdfitness.com',
    specializations: ['Yoga', 'Pilates', 'Meditation'],
  },
  schedule: {
    days: ['Monday', 'Wednesday', 'Friday'],
    time: '06:00 AM',
    duration: 60,
  },
  capacity: 20,
  enrolled: 18,
  location: 'Studio A',
  price: 15,
  isRecurring: true,
  createdDate: '2024-01-15',
};

const mockEnrolledMembers = [
  { id: '1', name: 'Michael Brown', photoUrl: undefined, joinedDate: '2024-01-20' },
  { id: '2', name: 'Emily Davis', photoUrl: undefined, joinedDate: '2024-01-22' },
  { id: '3', name: 'James Wilson', photoUrl: undefined, joinedDate: '2024-01-25' },
  { id: '4', name: 'Sarah Parker', photoUrl: undefined, joinedDate: '2024-01-28' },
  { id: '5', name: 'David Kim', photoUrl: undefined, joinedDate: '2024-02-01' },
];

export function ClassDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const enrollmentPercentage = (mockClass.enrolled / mockClass.capacity) * 100;
  const spotsRemaining = mockClass.capacity - mockClass.enrolled;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/classes')}
            className="h-12 w-12 rounded-2xl text-slate-700 dark:text-slate-700 hover:text-indigo-600 dark:hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-100/50 transition-all p-0 flex items-center justify-center"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-4xl font-black italic tracking-tight text-slate-900 dark:text-slate-900 transition-colors">
              {mockClass.name.toUpperCase()}
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-700 dark:text-slate-800 mt-1">Class Protocol & Enrollment Matrix</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => navigate(`/classes/edit/${id}`)}
            className="px-6 py-6 bg-white dark:bg-white border border-slate-300 dark:border-slate-300 text-slate-900 dark:text-slate-900 hover:border-indigo-500 dark:hover:border-indigo-500 font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all shadow-sm flex items-center gap-3"
          >
            <Edit className="h-4 w-4 text-indigo-600" />
            Edit Protocol
          </Button>
          <Button
            variant="outline"
            className="px-6 py-6 border-slate-300 dark:border-slate-300 text-slate-700 dark:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-600 font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all flex items-center gap-3"
          >
            <Trash2 className="h-4 w-4" />
            Wipe
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        {[
          { label: 'Enrollment', value: `${mockClass.enrolled}/${mockClass.capacity}`, sub: `${enrollmentPercentage.toFixed(0)}% Capacity`, color: 'text-indigo-600', bg: 'bg-indigo-500/10' },
          { label: 'Spots Available', value: spotsRemaining, sub: 'Field Capacity', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Duration', value: mockClass.schedule.duration, sub: 'Minutes / Session', color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Price Metric', value: `$${mockClass.price}`, sub: 'Per Activation', color: 'text-rose-500', bg: 'bg-rose-500/10' }
        ].map((stat, i) => (
          <Card key={i} className="bg-white dark:bg-white border-slate-300 dark:border-slate-300 rounded-3xl shadow-sm transition-colors overflow-hidden group">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-800 italic">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-slate-900 dark:text-slate-900 transition-colors">
                {stat.value}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", stat.bg.replace('10', '100'))} />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-700">{stat.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Class Information */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-white dark:bg-white border-slate-300 dark:border-slate-300 rounded-[2.5rem] shadow-sm transition-colors overflow-hidden">
            <CardHeader className="p-10 pb-4">
              <CardTitle className="text-sm font-black uppercase tracking-[0.25em] text-slate-700 dark:text-slate-800 italic flex items-center gap-3">
                <Calendar className="h-5 w-5 text-indigo-600" />
                Class Protocol Info
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 pt-0 space-y-10">
              <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-50/50 border border-slate-100 dark:border-slate-300 transition-colors">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-800 mb-3 block italic">Manifesto</label>
                <p className="text-slate-600 dark:text-slate-600 font-medium leading-relaxed text-lg transition-colors">{mockClass.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-800 italic">Faculty Assignment</label>
                  <div className="inline-block">
                    <Badge
                      className={cn(
                        'px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg text-slate-900 bg-gradient-to-r',
                        classTypeColors[mockClass.type]
                      )}
                    >
                      {mockClass.type} Prime
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-800 italic flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-rose-500" />
                    Sector Location
                  </label>
                  <p className="text-2xl font-black italic tracking-tight text-slate-900 dark:text-slate-900 transition-colors">{mockClass.location}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-800 italic flex items-center gap-2">
                    <Clock className="h-4 w-4 text-emerald-500" />
                    Shift Schedule
                  </label>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-900 transition-colors">
                    {mockClass.schedule.days.map(d => d.substring(0, 3).toUpperCase()).join(' • ')} <span className="text-indigo-600 dark:text-indigo-600 ml-2 font-black italic">{mockClass.schedule.time}</span>
                  </p>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-800 italic">Initialization</label>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-900 transition-colors">
                    {new Date(mockClass.createdDate).toLocaleDateString('en-US', {
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
          <Card className="bg-white dark:bg-white border-slate-300 dark:border-slate-300 rounded-[2.5rem] shadow-sm transition-colors overflow-hidden">
            <CardHeader className="p-10 pb-4">
              <CardTitle className="text-sm font-black uppercase tracking-[0.25em] text-slate-700 dark:text-slate-800 italic flex items-center gap-3">
                <Users className="h-5 w-5 text-indigo-600" />
                Active Enrollments ({mockClass.enrolled})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-50 dark:divide-navy-950">
                {mockEnrolledMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-8 hover:bg-slate-50 dark:hover:bg-slate-50/50 transition-all cursor-pointer group"
                    onClick={() => navigate(`/members/${member.id}`)}
                  >
                    <div className="flex items-center gap-6">
                      <Avatar className="h-14 w-14 border-4 border-white dark:border-slate-300 shadow-xl transition-transform group-hover:scale-95">
                        <AvatarImage src={member.photoUrl} />
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-slate-900 font-black italic">
                          {member.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-lg font-black text-slate-900 dark:text-slate-900 transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-600 leading-tight">{member.name}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-800 mt-1">
                          Activated On {new Date(member.joinedDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" className="h-12 px-6 rounded-2xl bg-slate-50 dark:bg-slate-50 text-slate-700 dark:text-slate-700 group-hover:bg-indigo-600 group-hover:text-white font-black uppercase text-[10px] tracking-widest transition-all">
                      Open Profile
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trainer Info */}
        <div className="space-y-8">
          <Card className="bg-white dark:bg-white border-slate-300 dark:border-slate-300 rounded-[2.5rem] shadow-sm transition-colors overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-sm font-black uppercase tracking-[0.25em] text-slate-700 dark:text-slate-800 italic flex items-center gap-3 font-black">
                <User className="h-5 w-5 text-indigo-600" />
                Faculty Lead
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="text-center space-y-6">
                <div className="relative inline-block">
                  <Avatar className="h-32 w-32 border-4 border-slate-50 dark:border-slate-400 shadow-2xl transition-transform hover:scale-105">
                    <AvatarImage src={mockClass.trainer.photoUrl} />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-slate-900 text-3xl font-black italic">
                      {mockClass.trainer.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 bg-emerald-500 h-6 w-6 rounded-full border-4 border-white dark:border-slate-300" />
                </div>

                <div>
                  <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-900 transition-colors">
                    {mockClass.trainer.name.split(' ')[0]} <span className="text-indigo-600 dark:text-indigo-600 italic">{mockClass.trainer.name.split(' ')[1]}</span>
                  </h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 dark:text-slate-800 mt-1">{mockClass.trainer.email}</p>
                </div>

                <div className="pt-4 border-t border-slate-50 dark:border-slate-400">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-800 block mb-4 italic">Core Matrices</label>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {mockClass.trainer.specializations.map((spec) => (
                      <Badge
                        key={spec}
                        className="bg-slate-50 dark:bg-slate-50 text-slate-600 dark:text-slate-600 border border-slate-100 dark:border-slate-300 font-black text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-lg"
                      >
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => navigate(`/trainers/${mockClass.trainer.id}`)}
                  className="w-full h-14 bg-white dark:bg-indigo-600 hover:bg-black dark:hover:bg-indigo-700 text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-500/10 transition-all flex items-center justify-center gap-3"
                >
                  Synchronize Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-slate-50 dark:bg-slate-50/50 border-slate-300 rounded-[2.5rem] transition-colors overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-900 italic">Quick Protocols</CardTitle>
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
                    "w-full h-14 border-white dark:border-slate-300 bg-white dark:bg-white text-slate-700 dark:text-slate-600 hover:border-indigo-500 font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all shadow-sm flex items-center justify-start gap-4 px-6 group",
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
