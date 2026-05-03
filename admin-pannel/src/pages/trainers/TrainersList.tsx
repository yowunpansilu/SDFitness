import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Mail, Phone, Award, Users, TrendingUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import api from '@/lib/api/axios';

interface Trainer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specializations: string[];
  certifications: unknown[];
  assignedMembers: number;
  rating: number;
  photoUrl?: string;
  status: 'active' | 'inactive' | 'on_leave';
  joinDate: string;
}

const statusColors = {
  active: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
  inactive: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-navy-800 dark:text-navy-400 dark:border-navy-700',
  on_leave: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
};

export function TrainersList() {
  const navigate = useNavigate();
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('all');

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const response = await api.get('/trainers');
        // Map backend structure to frontend interface
        const mappedTrainers = response.data.map((t: { _id: string; userId?: { firstName?: string; lastName?: string; email?: string; phone?: string; avatar?: string }; specializations?: string[]; certifications?: unknown[]; assignedMembers?: number; rating?: number; status?: string; joinDate?: string; createdAt?: string }) => ({
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
          joinDate: t.joinDate || t.createdAt
        }));
        setTrainers(mappedTrainers);
      } catch (error) {
        console.error('Failed to fetch trainers:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrainers();
  }, []);

  const filteredTrainers = trainers.filter((trainer) => {
    const matchesSearch =
      trainer.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trainer.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trainer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trainer.specializations.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSpecialization =
      specializationFilter === 'all' ||
      trainer.specializations.some((s) =>
        s.toLowerCase().includes(specializationFilter.toLowerCase())
      );

    return matchesSearch && matchesSpecialization;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-navy-600">Synchronizing Faculty System</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 text-slate-900 dark:text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Elite <span className="text-indigo-600 dark:text-indigo-400">Trainers</span>
          </h1>
          <p className="text-slate-500 dark:text-navy-400 font-medium mt-1 uppercase text-xs tracking-widest font-bold">
            Oversee your professional coaching staff and their portfolio.
          </p>
        </div>
        <Button
          onClick={() => navigate('/trainers/add')}
          className="bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 h-11 px-6 font-bold transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Trainer
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white dark:bg-navy-900 border-navy-100/50 dark:border-navy-800 shadow-sm rounded-2xl overflow-hidden group transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-navy-400">Total Staff</CardTitle>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 transition-transform group-hover:scale-110 shadow-sm">
              <Plus className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{trainers.length}</div>
            <p className="text-xs font-medium text-slate-400 dark:text-navy-500 mt-1 uppercase tracking-wider font-bold">Professionals onboarded</p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-navy-900 border-navy-100/50 dark:border-navy-800 shadow-sm rounded-2xl overflow-hidden group transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-emerald-500 dark:text-emerald-400">Active duty</CardTitle>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 transition-transform group-hover:scale-110 shadow-sm">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              {trainers.filter((t) => t.status === 'active').length}
            </div>
            <p className="text-xs font-medium text-slate-400 dark:text-navy-500 mt-1 uppercase tracking-wider font-bold">Currently teaching</p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-navy-900 border-navy-100/50 dark:border-navy-800 shadow-sm rounded-2xl overflow-hidden group transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">Clientele</CardTitle>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 transition-transform group-hover:scale-110 shadow-sm">
              <Award className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              {trainers.reduce((sum: number, t) => sum + (t.assignedMembers || 0), 0)}
            </div>
            <p className="text-xs font-medium text-slate-400 dark:text-navy-500 mt-1 uppercase tracking-wider font-bold">Assigned members</p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-navy-900 border-navy-100/50 dark:border-navy-800 shadow-sm rounded-2xl overflow-hidden group transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-amber-500 dark:text-amber-400">Avg Rating</CardTitle>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 transition-transform group-hover:scale-110 shadow-sm">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              {trainers.length > 0
                ? (trainers.reduce((sum: number, t) => sum + (t.rating || 0), 0) / trainers.length).toFixed(1)
                : '0.0'}
            </div>
            <p className="text-xs font-medium text-slate-400 dark:text-navy-500 mt-1 uppercase tracking-wider font-bold">Service quality</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white dark:bg-navy-900 border-navy-100/50 dark:border-navy-800 shadow-sm rounded-3xl overflow-hidden transition-colors">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" />
              <Input
                placeholder="Search trainers by name or specialization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 h-11 bg-slate-50 dark:bg-navy-950 border-transparent focus:bg-white dark:focus:bg-navy-950 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 rounded-xl transition-all dark:text-white"
              />
            </div>
            <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
              <SelectTrigger className="w-full md:w-[220px] h-11 bg-slate-50 dark:bg-navy-950 border-transparent rounded-xl focus:ring-indigo-500/10 shadow-none dark:text-white">
                <SelectValue placeholder="All Specializations" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 dark:border-navy-800 dark:bg-navy-900 dark:text-white">
                <SelectItem value="all">All Specializations System</SelectItem>
                <SelectItem value="HIIT">HIIT Protocol</SelectItem>
                <SelectItem value="Yoga">Yoga Specialization</SelectItem>
                <SelectItem value="CrossFit">CrossFit Elite</SelectItem>
                <SelectItem value="Boxing">Combat Boxing</SelectItem>
                <SelectItem value="Pilates">Core Pilates</SelectItem>
                <SelectItem value="Strength Training">Strength Performance</SelectItem>
                <SelectItem value="Cardio">Cardio System</SelectItem>
                <SelectItem value="Spinning">Spinning Cycle</SelectItem>
                <SelectItem value="Zumba">Zumba Flow</SelectItem>
                <SelectItem value="Functional Training">Functional Ops</SelectItem>
                <SelectItem value="Bodybuilding">Bodybuilding Prime</SelectItem>
                <SelectItem value="Powerlifting">Powerlifting Force</SelectItem>
                <SelectItem value="Athletic Performance">Athletic System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Trainers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTrainers.map((trainer) => (
          <Card
            key={trainer.id}
            onClick={() => navigate(`/trainers/${trainer.id}`)}
            className="bg-white dark:bg-navy-900 border-slate-200/60 dark:border-navy-800 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/5 dark:hover:shadow-navy-950/50 hover:-translate-y-2 transition-all duration-500 cursor-pointer group rounded-[2.5rem] overflow-hidden p-2"
          >
            <CardContent className="p-6 space-y-6">
              {/* Trainer Header */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative">
                  <Avatar className="h-24 w-24 ring-4 ring-indigo-50 dark:ring-navy-950 group-hover:ring-indigo-100 dark:group-hover:ring-indigo-900/50 transition-all duration-500 hvr-pulse-grow shadow-md">
                    <AvatarImage src={trainer.photoUrl} className="object-cover" />
                    <AvatarFallback className="bg-indigo-600 dark:bg-navy-950 text-white text-2xl font-bold">
                      {trainer.firstName[0]}{trainer.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1">
                    <div className="h-6 w-6 rounded-full bg-white dark:bg-navy-950 p-1 shadow-sm">
                      <div className={cn("w-full h-full rounded-full ring-2 ring-white dark:ring-navy-950", trainer.status === 'active' ? 'bg-emerald-500 animate-pulse' : trainer.status === 'on_leave' ? 'bg-amber-500' : 'bg-slate-300 dark:bg-navy-800')} />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase tracking-tight">
                    {trainer.firstName} {trainer.lastName}
                  </h3>
                  <Badge className={cn('mt-2 font-bold text-[11px] uppercase tracking-widest rounded-lg border shadow-none px-2', statusColors[trainer.status])}>
                    {trainer.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              {/* Info Rows */}
              <div className="space-y-3 bg-slate-50/50 dark:bg-navy-950/50 p-4 rounded-3xl transition-colors">
                <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500 dark:text-navy-400 group-hover:text-slate-600 dark:group-hover:text-navy-200 transition-colors">
                  <div className="p-1.5 rounded-lg bg-white dark:bg-navy-900 shadow-sm border border-navy-100/10">
                    <Mail className="h-3 w-3 text-indigo-500 dark:text-indigo-400" />
                  </div>
                  <span className="truncate">{trainer.email}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500 dark:text-navy-400 group-hover:text-slate-600 dark:group-hover:text-navy-200 transition-colors">
                  <div className="p-1.5 rounded-lg bg-white dark:bg-navy-900 shadow-sm border border-navy-100/10">
                    <Phone className="h-3 w-3 text-indigo-500 dark:text-indigo-400" />
                  </div>
                  <span>{trainer.phone}</span>
                </div>
              </div>

              {/* Specializations */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Award className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs uppercase font-bold tracking-widest text-slate-400 dark:text-navy-600">Expertise</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {trainer.specializations.slice(0, 2).map((spec) => (
                    <Badge key={spec} variant="outline" className="border-indigo-100 dark:border-navy-800 text-indigo-600 dark:text-indigo-400 bg-indigo-50/30 dark:bg-indigo-500/5 font-bold text-[11px] uppercase tracking-widest py-0.5 rounded-lg">
                      {spec}
                    </Badge>
                  ))}
                  {trainer.specializations.length > 2 && (
                    <Badge className="bg-slate-100 dark:bg-navy-800 text-slate-500 dark:text-navy-500 border-none font-bold text-[11px] uppercase tracking-widest rounded-lg">
                      +{trainer.specializations.length - 2}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-navy-800 transition-colors">
                <div className="space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-navy-600">Members</p>
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{trainer.assignedMembers}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-navy-600">Rating</p>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{trainer.rating}<span className="text-xs font-normal text-slate-400 dark:text-navy-600 ml-0.5">/ 5.0</span></p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTrainers.length === 0 && (
        <div className="text-center py-20 bg-white dark:bg-navy-900 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-navy-800 transition-colors">
          <div className="inline-flex p-6 rounded-full bg-slate-50 dark:bg-navy-950 mb-6">
            <Users className="h-10 w-10 text-slate-300 dark:text-navy-800" />
          </div>
          <h3 className="text-slate-900 dark:text-white font-bold text-xl uppercase tracking-tight">No trainers found</h3>
          <p className="text-slate-400 dark:text-navy-500 font-medium">Try refining your search or specialization filter</p>
        </div>
      )}
    </div>
  );
}
