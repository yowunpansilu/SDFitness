import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Mail, Phone, Award, Users, TrendingUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { trainerService } from '@/services/trainerService';
import { useToast } from '@/hooks/use-toast';

interface Trainer {
  _id: string;
  user: {
      firstName: string;
      lastName: string;
      email: string;
      avatar?: string;
  };
  specialization: string[];
  experienceYears: number;
  status: 'active' | 'inactive' | 'on_leave';
  rating?: number;
}

const statusColors = {
  active: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  inactive: 'bg-slate-100 text-slate-600 border-slate-300',
  on_leave: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
};

export function TrainersList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('all');

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        setLoading(true);
        const data = await trainerService.getTrainers();
        setTrainers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching trainers:', error);
        toast({
          title: 'Error',
          description: 'Failed to load trainer staff metrics.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchTrainers();
  }, []);

  const filteredTrainers = trainers.filter((trainer) => {
    const firstName = trainer.user?.firstName || '';
    const lastName = trainer.user?.lastName || '';
    const email = trainer.user?.email || '';
    const fullName = `${firstName} ${lastName}`.toLowerCase();
    
    const matchesSearch =
      fullName.includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSpecialization =
      specializationFilter === 'all' ||
      (trainer.specialization || []).some((s) =>
        s?.toLowerCase().includes(specializationFilter.toLowerCase())
      );

    return matchesSearch && matchesSpecialization;
  });

  const avgRating = trainers.length > 0 
    ? (trainers.reduce((sum, t) => sum + (t.rating || 5), 0) / trainers.length).toFixed(1)
    : '5.0';

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
          <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">Accessing Trainer Matrix...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">
            Professional <span className="text-indigo-600 italic font-medium">Coaching Staff</span>
          </h1>
          <p className="text-slate-700 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">
            Elite training protocols and performance oversight
          </p>
        </div>
        <Button
          onClick={() => navigate('/trainers/add')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-900/20 h-11 px-6 font-bold uppercase text-xs tracking-widest transition-all hover:scale-105 active:scale-95 border border-slate-300"
        >
          <Plus className="h-4 w-4 mr-2" />
          Onboard Professional
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white border-slate-300 shadow-sm rounded-3xl overflow-hidden group transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-700">Active Staff</CardTitle>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 transition-transform group-hover:scale-110">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">{trainers.length}</div>
            <p className="text-[9px] font-black text-slate-800 mt-1 uppercase tracking-widest">Protocol administrators</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-slate-300 shadow-sm rounded-3xl overflow-hidden group transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-emerald-500">On Duty</CardTitle>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 transition-transform group-hover:scale-110">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">
              {trainers.filter((t) => t.status === 'active').length}
            </div>
            <p className="text-[9px] font-black text-slate-800 mt-1 uppercase tracking-widest">Currently transmitting</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-300 shadow-sm rounded-3xl overflow-hidden group transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Exp. Years</CardTitle>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 transition-transform group-hover:scale-110">
              <Award className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">
              {trainers.reduce((sum, t) => sum + t.experienceYears, 0)}+
            </div>
            <p className="text-[9px] font-black text-slate-800 mt-1 uppercase tracking-widest">Combined expertise</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-300 shadow-sm rounded-3xl overflow-hidden group transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-amber-500">Efficiency</CardTitle>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 transition-transform group-hover:scale-110">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">
              {avgRating}
            </div>
            <p className="text-[9px] font-black text-slate-800 mt-1 uppercase tracking-widest">Mean quality rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white border-slate-300 shadow-sm rounded-3xl overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-700 group-focus-within:text-indigo-600 transition-colors" />
              <input
                placeholder="Find Professional: Name or expertise..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 h-11 bg-slate-50 border-2 border-slate-300 focus:border-indigo-500/50 rounded-xl transition-all font-bold text-xs uppercase tracking-widest text-slate-900 placeholder:text-slate-900 outline-none"
              />
            </div>
            <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
              <SelectTrigger className="w-full md:w-[220px] h-11 bg-slate-50 border-none rounded-xl focus:ring-indigo-500/10 font-bold text-xs text-slate-900 uppercase tracking-widest">
                <SelectValue placeholder="All Specializations" />
              </SelectTrigger>
              <SelectContent className="rounded-xl bg-white border-slate-300 text-slate-900">
                <SelectItem value="all" className="uppercase text-[10px] font-black tracking-widest cursor-pointer">All Expertise</SelectItem>
                <SelectItem value="strength" className="uppercase text-[10px] font-black tracking-widest cursor-pointer">Strength</SelectItem>
                <SelectItem value="cardio" className="uppercase text-[10px] font-black tracking-widest cursor-pointer">Cardio</SelectItem>
                <SelectItem value="yoga" className="uppercase text-[10px] font-black tracking-widest cursor-pointer">Yoga</SelectItem>
                <SelectItem value="crossfit" className="uppercase text-[10px] font-black tracking-widest cursor-pointer">CrossFit</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Trainers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTrainers.map((trainer) => (
          <Card
            key={trainer._id}
            onClick={() => navigate(`/trainers/${trainer._id}`)}
            className="bg-white border-slate-300 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-2 transition-all duration-500 cursor-pointer group rounded-[2.5rem] overflow-hidden border-2 border-slate-300 hover:border-indigo-500/20"
          >
            <CardContent className="p-6 space-y-6">
              {/* Trainer Header */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative">
                  <Avatar className="h-24 w-24 ring-4 ring-slate-200 group-hover:ring-indigo-500/20 transition-all duration-500 shadow-xl">
                    <AvatarImage src={trainer.user?.avatar} className="object-cover" />
                    <AvatarFallback className="bg-slate-50 text-indigo-600 text-2xl font-black italic">
                      {trainer.user?.firstName?.[0] || '?'}{trainer.user?.lastName?.[0] || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1">
                    <div className="h-6 w-6 rounded-full bg-white p-1 shadow-sm">
                      <div className={cn("w-full h-full rounded-full ring-2 ring-slate-200", 
                        trainer.status === 'active' ? 'bg-emerald-500 animate-pulse' : 
                        trainer.status === 'on_leave' ? 'bg-amber-500' : 'bg-slate-200'
                      )} />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                    {trainer.user?.firstName} {trainer.user?.lastName}
                  </h3>
                  <Badge className={cn('mt-2 font-black text-[9px] uppercase tracking-[0.2em] rounded-lg border-none shadow-none px-3', statusColors[trainer.status || 'active'])}>
                    {(trainer.status || 'active').replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              {/* Info Rows */}
              <div className="space-y-3 bg-slate-50/50 p-4 rounded-3xl">
                <div className="flex items-center gap-3 text-[10px] font-black text-slate-700 uppercase tracking-widest">
                  <Mail className="h-3 w-3 text-indigo-600" />
                  <span className="truncate">{trainer.user?.email || 'OFFLINE_MAIL'}</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-black text-slate-700 uppercase tracking-widest">
                  <Phone className="h-3 w-3 text-indigo-600" />
                  <span>MATRIX-CONNECT</span>
                </div>
              </div>

              {/* Specializations */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Award className="h-4 w-4 text-indigo-600" />
                  <span className="text-[10px] uppercase font-black tracking-widest text-slate-800">Specializations</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(trainer.specialization || []).map((s, i) => (
                    <Badge key={i} variant="outline" className="text-[8px] font-black border-slate-300 text-slate-700 uppercase tracking-widest px-2 py-0">
                      {s}
                    </Badge>
                  ))}
                  {(trainer.specialization || []).length > 2 && (
                    <Badge className="bg-slate-50 text-slate-800 border-none font-black text-[9px] uppercase tracking-widest rounded-lg">
                      +{(trainer.specialization || []).length - 2}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-300">
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-800">Experience</p>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                    <p className="text-sm font-black text-slate-900">{trainer.experienceYears}Y</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-800">Rating</p>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5 text-amber-500" />
                    <p className="text-sm font-black text-slate-900">{trainer.rating || 5.0}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTrainers.length === 0 && (
        <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-300">
          <div className="inline-flex p-6 rounded-full bg-slate-50 mb-6">
            <Users className="h-10 w-10 text-slate-900" />
          </div>
          <h3 className="text-slate-900 font-black text-xl uppercase tracking-widest">Zero Personnel Detected</h3>
          <p className="text-slate-700 font-bold text-xs uppercase tracking-widest mt-2">Matrix filters returned no matches</p>
        </div>
      )}
    </div>
  );
}
