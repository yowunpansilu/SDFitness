import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

interface Trainer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specializations: string[];
  certifications: string[];
  assignedMembers: number;
  rating: number;
  photoUrl?: string;
  status: 'active' | 'inactive' | 'on_leave';
  hireDate: string;
  bio: string;
  emergencyContact: {
    name: string;
    phone: string;
  };
}

interface AssignedMember {
  id: string;
  name: string;
  membershipType: string;
  startDate: string;
  sessionsCompleted: number;
  photoUrl?: string;
}

// Mock data
const mockTrainer: Trainer = {
  id: '1',
  firstName: 'Sarah',
  lastName: 'Johnson',
  email: 'sarah.j@sdfitness.com',
  phone: '+1 234 567 8901',
  specializations: ['Strength Training', 'Bodybuilding', 'Powerlifting'],
  certifications: ['NASM-CPT', 'CSCS', 'USA Powerlifting Coach'],
  assignedMembers: 24,
  rating: 4.8,
  photoUrl: undefined,
  status: 'active',
  hireDate: '2023-01-15',
  bio: 'Certified personal trainer with over 8 years of experience specializing in strength training and bodybuilding. Passionate about helping clients achieve their fitness goals through customized workout programs and nutrition guidance.',
  emergencyContact: {
    name: 'John Johnson',
    phone: '+1 234 567 8999',
  },
};

const mockAssignedMembers: AssignedMember[] = [
  {
    id: '1',
    name: 'Michael Brown',
    membershipType: 'Premium',
    startDate: '2024-01-15',
    sessionsCompleted: 45,
    photoUrl: undefined,
  },
  {
    id: '2',
    name: 'Emily Davis',
    membershipType: 'VIP',
    startDate: '2024-02-20',
    sessionsCompleted: 32,
    photoUrl: undefined,
  },
  {
    id: '3',
    name: 'James Wilson',
    membershipType: 'Premium',
    startDate: '2023-11-08',
    sessionsCompleted: 78,
    photoUrl: undefined,
  },
];

const mockSchedule = [
  { day: 'Monday', time: '6:00 AM - 2:00 PM', type: 'Morning Shift' },
  { day: 'Tuesday', time: '6:00 AM - 2:00 PM', type: 'Morning Shift' },
  { day: 'Wednesday', time: '2:00 PM - 10:00 PM', type: 'Evening Shift' },
  { day: 'Thursday', time: '6:00 AM - 2:00 PM', type: 'Morning Shift' },
  { day: 'Friday', time: '2:00 PM - 10:00 PM', type: 'Evening Shift' },
  { day: 'Saturday', time: '9:00 AM - 5:00 PM', type: 'Day Shift' },
];

const statusColors = {
  active: 'bg-green-500/20 text-green-400 border-green-500/30',
  inactive: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  on_leave: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
};

export function TrainerDetail() {
  const navigate = useNavigate();
  const [trainer] = useState(mockTrainer);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate('/trainers')}
        className="text-slate-700 dark:text-slate-700 hover:text-slate-900 dark:hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-100/50 rounded-xl transition-all"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Trainers
      </Button>

      {/* Trainer Header */}
      <Card className="bg-white dark:bg-white/50 border-slate-300 dark:border-slate-300 backdrop-blur-sm rounded-3xl overflow-hidden transition-colors">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row gap-8">
            <Avatar className="h-32 w-32 ring-4 ring-indigo-500/20 shadow-2xl">
              <AvatarImage src={trainer.photoUrl} />
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-slate-900 text-3xl font-black italic">
                {trainer.firstName[0]}{trainer.lastName[0]}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-slate-900 transition-colors">
                    {trainer.firstName} <span className="text-indigo-600 dark:text-indigo-600 italic">{trainer.lastName}</span>
                  </h1>
                  <Badge className={cn('mt-3 px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest transition-colors', statusColors[trainer.status])}>
                    {trainer.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 border-slate-300 dark:border-slate-300 text-slate-700 dark:text-slate-700 hover:text-indigo-600 dark:hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-100 rounded-xl transition-all"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 border-slate-300 dark:border-slate-300 text-slate-700 dark:text-rose-500 hover:text-rose-600 dark:hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-600">
                  <div className="h-8 w-8 rounded-lg bg-slate-50 dark:bg-slate-50 flex items-center justify-center">
                    <Mail className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-bold">{trainer.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-600">
                  <div className="h-8 w-8 rounded-lg bg-slate-50 dark:bg-slate-50 flex items-center justify-center">
                    <Phone className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-bold">{trainer.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-600">
                  <div className="h-8 w-8 rounded-lg bg-slate-50 dark:bg-slate-50 flex items-center justify-center">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-bold">Hired {new Date(trainer.hireDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-600">
                  <div className="h-8 w-8 rounded-lg bg-slate-50 dark:bg-slate-50 flex items-center justify-center">
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
          { label: 'Sessions / Mo', value: '156', icon: Clock, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Revenue Generated', value: '$12,450', icon: DollarSign, color: 'text-indigo-600', bg: 'bg-indigo-500/10' }
        ].map((stat, i) => (
          <Card key={i} className="bg-white dark:bg-white border-slate-300 dark:border-slate-300 rounded-2xl shadow-sm transition-colors overflow-hidden group">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-800">{stat.label}</CardTitle>
                <div className={cn("p-2 rounded-xl transition-transform group-hover:scale-110", stat.bg)}>
                  <stat.icon className={cn("h-4 w-4", stat.color)} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-slate-900 dark:text-slate-900 transition-colors">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-white dark:bg-white p-1.5 rounded-2xl border border-slate-100 dark:border-slate-300 shadow-sm transition-colors h-auto w-full md:w-auto">
          {['overview', 'members', 'schedule', 'certifications'].map(t => (
            <TabsTrigger 
              key={t} 
              value={t} 
              className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest data-[state=active]:bg-indigo-600 dark:data-[state=active]:bg-indigo-500 data-[state=active]:text-white transition-all capitalize"
            >
              {t}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card className="bg-white dark:bg-white border-slate-300 dark:border-slate-300 rounded-3xl transition-colors">
            <CardHeader>
              <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-slate-700 dark:text-slate-800 italic">Biography</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-600 font-medium leading-relaxed transition-colors">{trainer.bio}</p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-white dark:bg-white border-slate-300 dark:border-slate-300 rounded-3xl transition-colors">
              <CardHeader>
                <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-slate-700 dark:text-slate-800 italic flex items-center gap-2">
                  <Award className="h-5 w-5 text-indigo-600" />
                  Performance Specializations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {trainer.specializations.map((spec) => (
                    <Badge key={spec} className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-600 border-indigo-100 dark:border-indigo-900/50 font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl transition-colors">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-50 dark:bg-slate-50 border-slate-300 rounded-3xl transition-colors">
              <CardHeader>
                <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-slate-700 dark:text-slate-800 italic">Emergency Protocol</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-800 mb-1">Contact Name</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-900 transition-colors">{trainer.emergencyContact.name}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-800 mb-1">Secure Line</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-900 transition-colors">{trainer.emergencyContact.phone}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Assigned Members Tab */}
        <TabsContent value="members">
          <Card className="bg-white dark:bg-white border-slate-300 dark:border-slate-300 rounded-3xl overflow-hidden transition-colors shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-slate-700 dark:text-slate-800 italic">Student Matrix ({mockAssignedMembers.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 dark:bg-slate-50/50 border-y border-slate-100 dark:border-slate-300 transition-colors">
                    <TableHead className="font-black text-[10px] uppercase tracking-widest pl-8 text-slate-700 dark:text-slate-600">Student Profile</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-700 dark:text-slate-600">Tier Status</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-700 dark:text-slate-600">Enrolled On</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-700 dark:text-slate-600 text-right pr-8">Sessions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockAssignedMembers.map((member) => (
                    <TableRow
                      key={member.id}
                      className="border-b border-slate-50 dark:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-50/80 cursor-pointer transition-colors group"
                      onClick={() => navigate(`/members/${member.id}`)}
                    >
                      <TableCell className="pl-8">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-300 shadow-sm transition-transform group-hover:scale-95">
                            <AvatarImage src={member.photoUrl} />
                            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-slate-900 text-[10px] font-black italic">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-bold text-slate-900 dark:text-slate-900">{member.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-600 border-indigo-100 dark:border-indigo-900/50 font-black text-[9px] uppercase tracking-widest transition-colors">
                          {member.membershipType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm font-medium text-slate-500 dark:text-slate-700">
                        {new Date(member.startDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        <span className="text-sm font-black text-slate-900 dark:text-slate-900 transition-colors">{member.sessionsCompleted}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule">
          <Card className="bg-white dark:bg-white border-slate-300 dark:border-slate-300 rounded-3xl transition-colors shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-slate-700 dark:text-slate-800 italic">Shift Protocol Matrix</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockSchedule.map((schedule) => (
                  <div
                    key={schedule.day}
                    className="flex items-center justify-between p-6 rounded-2xl bg-slate-50 dark:bg-slate-50/50 border border-slate-100 dark:border-slate-300 transition-all hover:bg-white dark:hover:bg-slate-50 group"
                  >
                    <div className="flex items-center gap-8">
                      <div className="w-24">
                        <p className="text-sm font-black text-slate-900 dark:text-slate-900 uppercase italic tracking-wider transition-colors">{schedule.day}</p>
                      </div>
                      <div className="flex items-center gap-3 text-slate-500 dark:text-slate-700">
                        <Clock className="h-4 w-4 text-indigo-600" />
                        <span className="text-sm font-bold">{schedule.time}</span>
                      </div>
                    </div>
                    <Badge className="bg-white dark:bg-white text-slate-700 dark:text-slate-600 border-slate-300 dark:border-slate-300 font-black text-[9px] uppercase tracking-[0.2em] px-4 shadow-sm group-hover:border-indigo-100 dark:group-hover:border-indigo-900 transition-colors">
                      {schedule.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Certifications Tab */}
        <TabsContent value="certifications">
          <Card className="bg-white dark:bg-white border-slate-300 dark:border-slate-300 rounded-3xl transition-colors shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-slate-700 dark:text-slate-800 italic">Certified Matrix Credentials</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {trainer.certifications.map((cert) => (
                  <div
                    key={cert}
                    className="flex items-center gap-4 p-6 rounded-2xl bg-slate-50 dark:bg-slate-50/50 border border-slate-100 dark:border-slate-300 transition-all hover:bg-white dark:hover:bg-slate-50 group"
                  >
                    <div className="h-12 w-12 rounded-xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-500 transition-transform group-hover:scale-110">
                      <Award className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-base font-black text-slate-900 dark:text-slate-900 leading-none mb-1 uppercase tracking-tight transition-colors">{cert}</p>
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-500 font-black uppercase tracking-widest uppercase tracking-widest">Active Credential</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
