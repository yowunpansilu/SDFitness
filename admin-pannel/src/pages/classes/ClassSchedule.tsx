import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Clock, Users, MapPin, Calendar as CalendarIcon, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface ClassSession {
  id: string;
  name: string;
  trainer: {
    id: string;
    name: string;
    photoUrl?: string;
  };
  time: string;
  duration: number;
  capacity: number;
  enrolled: number;
  location: string;
  type: 'yoga' | 'hiit' | 'spin' | 'strength' | 'cardio' | 'pilates';
  day: number; // 0-6 (Sunday-Saturday)
}

// Mock data
const mockClasses: ClassSession[] = [
  {
    id: '1',
    name: 'Morning Yoga Flow',
    trainer: { id: '3', name: 'Emma Wilson', photoUrl: undefined },
    time: '06:00 AM',
    duration: 60,
    capacity: 20,
    enrolled: 18,
    location: 'Studio A',
    type: 'yoga',
    day: 1,
  },
  {
    id: '2',
    name: 'HIIT Bootcamp',
    trainer: { id: '2', name: 'Mike Ross', photoUrl: undefined },
    time: '07:00 AM',
    duration: 45,
    capacity: 25,
    enrolled: 25,
    location: 'Gym Floor',
    type: 'hiit',
    day: 1,
  },
  {
    id: '3',
    name: 'Spin Class',
    trainer: { id: '2', name: 'Mike Ross', photoUrl: undefined },
    time: '06:00 PM',
    duration: 45,
    capacity: 30,
    enrolled: 22,
    location: 'Spin Room',
    type: 'spin',
    day: 1,
  },
  {
    id: '4',
    name: 'Power Strength',
    trainer: { id: '1', name: 'Sarah Johnson', photoUrl: undefined },
    time: '06:00 AM',
    duration: 60,
    capacity: 15,
    enrolled: 12,
    location: 'Weight Room',
    type: 'strength',
    day: 2,
  },
  {
    id: '5',
    name: 'Evening Yoga',
    trainer: { id: '3', name: 'Emma Wilson', photoUrl: undefined },
    time: '07:00 PM',
    duration: 60,
    capacity: 20,
    enrolled: 16,
    location: 'Studio A',
    type: 'yoga',
    day: 2,
  },
  {
    id: '6',
    name: 'CrossFit WOD',
    trainer: { id: '4', name: 'David Chen', photoUrl: undefined },
    time: '06:00 AM',
    duration: 60,
    capacity: 20,
    enrolled: 19,
    location: 'CrossFit Box',
    type: 'strength',
    day: 3,
  },
  {
    id: '7',
    name: 'Cardio Blast',
    trainer: { id: '2', name: 'Mike Ross', photoUrl: undefined },
    time: '06:00 PM',
    duration: 30,
    capacity: 25,
    enrolled: 20,
    location: 'Gym Floor',
    type: 'cardio',
    day: 3,
  },
];

const classTypeColors: Record<string, string> = {
  yoga: 'bg-purple-50 text-purple-600 border-purple-100  ',
  hiit: 'bg-rose-50 text-rose-600 border-rose-100  ',
  spin: 'bg-indigo-50 text-indigo-600 border-indigo-100  ',
  strength: 'bg-amber-50 text-amber-600 border-amber-100  ',
  cardio: 'bg-emerald-50 text-emerald-600 border-emerald-100  ',
  pilates: 'bg-sky-50 text-sky-600 border-sky-100  ',
};

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function ClassSchedule() {
  const navigate = useNavigate();
  const [currentWeek, setCurrentWeek] = useState(0);

  const getClassesForDay = (day: number) => {
    return mockClasses.filter(c => c.day === day).sort((a, b) => a.time.localeCompare(b.time));
  };

  const today = new Date().getDay();

  return (
    <div className="space-y-10 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 text-slate-900 dark:text-slate-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-slate-900">
            Class <span className="text-indigo-600 dark:text-indigo-600 italic">Schedule</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-600 font-medium mt-1">
            Organize group sessions, manage capacity and trainer assignments.
          </p>
        </div>
        <Button
          onClick={() => navigate('/classes/add')}
          className="bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 h-11 px-6 font-bold transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Session
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white dark:bg-white border-navy-100/50 dark:border-slate-300 shadow-sm rounded-2xl overflow-hidden group transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-600">Total Classes</CardTitle>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-600 transition-transform group-hover:scale-110 shadow-sm">
              <CalendarIcon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900 dark:text-slate-900">{mockClasses.length}</div>
            <p className="text-[10px] font-medium text-slate-700 dark:text-slate-700 mt-1 uppercase tracking-wider font-bold">In system active</p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-white border-navy-100/50 dark:border-slate-300 shadow-sm rounded-2xl overflow-hidden group transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-600">This Week</CardTitle>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-600 transition-transform group-hover:scale-110 shadow-sm">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900 dark:text-slate-900">42</div>
            <p className="text-[10px] font-medium text-slate-700 dark:text-slate-700 mt-1 uppercase tracking-wider font-bold">Planned sessions</p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-white border-navy-100/50 dark:border-slate-300 shadow-sm rounded-2xl overflow-hidden group transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-emerald-500 dark:text-emerald-600">Enrollment</CardTitle>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-600 transition-transform group-hover:scale-110 shadow-sm">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900 dark:text-slate-900">
              {mockClasses.reduce((sum, c) => sum + c.enrolled, 0)}
            </div>
            <p className="text-[10px] font-medium text-slate-700 dark:text-slate-700 mt-1 uppercase tracking-wider font-bold">Total bookers</p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-white border-navy-100/50 dark:border-slate-300 shadow-sm rounded-2xl overflow-hidden group transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-amber-500 dark:text-amber-600">Utilization</CardTitle>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-600 transition-transform group-hover:scale-110 shadow-sm">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900 dark:text-slate-900">87%</div>
            <p className="text-[10px] font-medium text-slate-700 dark:text-slate-700 mt-1 uppercase tracking-wider font-bold">Avg attendance</p>
          </CardContent>
        </Card>
      </div>

      {/* Week Navigation */}
      <Card className="bg-white dark:bg-white border-navy-100/50 dark:border-slate-300 shadow-sm rounded-3xl overflow-hidden transition-colors">
        <CardContent className="p-4 px-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentWeek(currentWeek - 1)}
              className="h-10 w-10 text-slate-700 dark:text-slate-700 hover:text-indigo-600 dark:hover:text-slate-900 hover:bg-slate-50 dark:hover:bg-slate-100 rounded-xl transition-all"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-600">
                <CalendarIcon className="h-4 w-4" />
              </div>
              <span className="text-slate-900 dark:text-slate-900 font-black uppercase text-xs tracking-widest">March 2024 • Week {currentWeek + 10}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentWeek(currentWeek + 1)}
              className="h-10 w-10 text-slate-700 dark:text-slate-700 hover:text-indigo-600 dark:hover:text-slate-900 hover:bg-slate-50 dark:hover:bg-slate-100 rounded-xl transition-all"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Schedule Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        {daysOfWeek.map((day, index) => {
          const dayClasses = getClassesForDay(index);
          const isToday = index === today;

          return (
            <div key={day} className="space-y-4">
              {/* Day Header */}
              <div className={cn(
                "text-center p-4 rounded-2xl shadow-sm border transition-all",
                isToday
                  ? "bg-indigo-600 dark:bg-indigo-600 border-indigo-600 dark:border-indigo-600 ring-4 ring-indigo-500/10 dark:ring-indigo-500/5 scale-105 z-10"
                  : "bg-white dark:bg-white border-slate-300/60 dark:border-slate-300"
              )}>
                <p className={cn(
                  "font-black uppercase text-[10px] tracking-[0.2em]",
                  isToday ? "text-indigo-100" : "text-slate-700 dark:text-slate-700"
                )}>
                  {day.slice(0, 3)}
                </p>
                <p className={cn(
                  "text-xl font-black mt-0.5",
                  isToday ? "text-slate-900" : "text-slate-900 dark:text-slate-900"
                )}>
                  {15 + index}
                </p>
                {isToday && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white mx-auto mt-2 animate-pulse" />
                )}
              </div>

              {/* Classes for this day */}
              <div className="space-y-4">
                {dayClasses.length > 0 ? (
                  dayClasses.map((classSession) => {
                    const isFull = classSession.enrolled >= classSession.capacity;

                    return (
                      <Card
                        key={classSession.id}
                        onClick={() => navigate(`/classes/${classSession.id}`)}
                        className="bg-white dark:bg-white border-slate-300/60 dark:border-slate-300 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 dark:hover:shadow-navy-950/50 hover:-translate-y-1 transition-all duration-500 cursor-pointer group rounded-3xl overflow-hidden"
                      >
                        <CardContent className="p-4 space-y-4">
                          <div>
                            <Badge className={cn(
                              "text-[9px] font-black uppercase tracking-widest border-none px-2 rounded-lg mb-2 shadow-none",
                              classTypeColors[classSession.type]
                            )}>
                              {classSession.type}
                            </Badge>
                            <h3 className="font-black text-slate-900 dark:text-slate-900 group-hover:text-indigo-600 dark:group-hover:text-indigo-600 transition-colors text-sm leading-tight">
                              {classSession.name}
                            </h3>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-700 dark:text-slate-700 group-hover:text-slate-600 dark:group-hover:text-slate-600 transition-colors">
                              <Clock className="h-3 w-3" />
                              <span>{classSession.time} • {classSession.duration}m</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-700 dark:text-slate-700 group-hover:text-slate-600 dark:group-hover:text-slate-600 transition-colors">
                              <MapPin className="h-3 w-3" />
                              <span className="uppercase tracking-widest">{classSession.location}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-2 border-t border-slate-50 dark:border-slate-300">
                            <Avatar className="h-6 w-6 border-2 border-white dark:border-slate-300 shadow-sm">
                              <AvatarImage src={classSession.trainer.photoUrl} />
                              <AvatarFallback className="bg-indigo-600 dark:bg-slate-50 text-white text-[8px] font-black">
                                {classSession.trainer.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-600 truncate">{classSession.trainer.name}</span>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-900 dark:text-slate-900 uppercase tracking-tighter">
                                <Users className="h-3 w-3 text-indigo-600 dark:text-indigo-600" />
                                <span>{classSession.enrolled} Enrolled</span>
                              </div>
                              {isFull && (
                                <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Full</span>
                              )}
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all duration-1000",
                                  isFull
                                    ? "bg-rose-500"
                                    : "bg-indigo-600 dark:bg-indigo-500"
                                )}
                                style={{ width: `${(classSession.enrolled / classSession.capacity) * 100}%` }}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  <div className="p-8 text-center rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-300 bg-slate-50/10 dark:bg-slate-50/20">
                    <p className="text-slate-600 dark:text-slate-800 font-black uppercase text-[9px] tracking-[0.2em]">Empty</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
