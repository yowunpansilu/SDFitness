import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Form validation schema
const classSchema = z.object({
  // Class Details
  name: z.string().min(1, 'Class name is required'),
  type: z.string().min(1, 'Class type is required'),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  duration: z.number().min(15, 'Duration must be at least 15 minutes'),

  // Schedule
  startDate: z.string().min(1, 'Start date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  recurrence: z.enum(['one-time', 'daily', 'weekly', 'monthly']),
  daysOfWeek: z.array(z.number()).optional(),
  endRecurrence: z.enum(['never', 'after', 'on-date']).optional(),
  occurrences: z.number().optional(),
  endDate: z.string().optional(),

  // Capacity & Location
  maxParticipants: z.number().min(1, 'Max participants must be at least 1'),
  location: z.string().min(1, 'Location is required'),

  // Trainer
  trainerId: z.string().min(1, 'Trainer is required'),
  backupTrainerId: z.string().optional(),

  // Requirements
  prerequisites: z.string().optional(),
  whatToBring: z.string().optional(),
  notes: z.string().optional(),
});

type ClassFormData = z.infer<typeof classSchema>;

const CLASS_TYPES = ['Cardio', 'Strength', 'Yoga', 'HIIT', 'Pilates', 'Boxing', 'Spinning', 'CrossFit'];
const DAYS_OF_WEEK = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 7, label: 'Sun' },
];
const LOCATIONS = ['Studio A', 'Studio B', 'Main Hall', 'Outdoor Area', 'Cardio Zone', 'Spin Room'];

// Mock trainers
const TRAINERS = [
  { id: '1', name: 'Mike Ross' },
  { id: '2', name: 'Sarah Lee' },
  { id: '3', name: 'Tom Wilson' },
];

export function ClassForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditMode = Boolean(id);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: '',
      type: '',
      level: 'beginner',
      description: '',
      duration: 60,
      startDate: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:00',
      recurrence: 'one-time',
      maxParticipants: 20,
      location: '',
      trainerId: '',
      daysOfWeek: [],
    },
  });

  const recurrence = watch('recurrence');
  const endRecurrence = watch('endRecurrence');
  const selectedDays = watch('daysOfWeek') || [];

  const onSubmit = (data: ClassFormData) => {
    console.log('Form submitted:', data);

    toast({
      title: isEditMode ? 'Class Updated' : 'Class Created',
      description: `${data.name} has been ${isEditMode ? 'updated' : 'scheduled'} successfully`,
    });

    navigate('/admin/classes');
  };

  const toggleDay = (day: number) => {
    const current = selectedDays;
    const updated = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day];
    setValue('daysOfWeek', updated);
  };

  return (
    <div className="space-y-8 p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-300">
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/classes')}
            className="h-12 w-12 rounded-2xl text-slate-700 dark:text-slate-700 hover:text-indigo-600 dark:hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-100/50 transition-all p-0 flex items-center justify-center border border-slate-300 hover:border-slate-300 dark:hover:border-slate-300"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-4xl font-black italic tracking-tight text-slate-900 dark:text-slate-900 transition-colors">
              {isEditMode ? 'EDIT CLASS PROTOCOL' : 'INITIALIZE CLASS'}
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 dark:text-slate-800 mt-1">
              {isEditMode ? 'System Override Active' : 'New Deployment Sequence'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/admin/classes')}
            className="h-12 px-8 border-slate-300 dark:border-slate-300 text-slate-700 dark:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-100/50 font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all flex items-center gap-3"
          >
            <X className="h-4 w-4" />
            Abort
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            className="h-12 px-10 bg-white dark:bg-indigo-600 hover:bg-black dark:hover:bg-indigo-700 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-3"
          >
            <Save className="h-4 w-4" />
            {isEditMode ? 'Synchronize' : 'Confirm Dispatch'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 max-w-5xl mx-auto">
        {/* Class Details */}
        <Card className="bg-white dark:bg-white border-slate-300 dark:border-slate-300 rounded-[2.5rem] shadow-sm transition-colors overflow-hidden">
          <CardHeader className="p-10 pb-4">
            <CardTitle className="text-sm font-black uppercase tracking-[0.25em] text-slate-700 dark:text-slate-800 italic">CORE COMMAND</CardTitle>
          </CardHeader>
          <CardContent className="p-10 pt-0 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2 space-y-3">
                <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-700 italic">
                  Class Designation <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="name"
                  {...register('name')}
                  className="h-14 bg-slate-50 dark:bg-slate-50/50 border-slate-100 dark:border-slate-300 text-slate-900 dark:text-slate-900 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold placeholder:text-slate-600 dark:placeholder:text-slate-900 uppercase italic tracking-tight"
                  placeholder="E.G. TITAN BOOTCAMP"
                />
                {errors.name && (
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-2 ml-1">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="type" className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-700 italic">
                  Faculty Type <span className="text-rose-500">*</span>
                </Label>
                <Select onValueChange={(value) => setValue('type', value)}>
                  <SelectTrigger className="h-14 bg-slate-50 dark:bg-slate-50/50 border-slate-100 dark:border-slate-300 text-slate-900 dark:text-slate-900 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold uppercase italic">
                    <SelectValue placeholder="Select Class Branch" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-white border-slate-300 dark:border-slate-300">
                    {CLASS_TYPES.map((type) => (
                      <SelectItem key={type} value={type} className="hover:bg-indigo-50 dark:hover:bg-slate-100 text-[10px] font-black uppercase tracking-widest py-3">
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-2 ml-1">{errors.type.message}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="level" className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-700 italic">
                  Difficulty Matrix <span className="text-rose-500">*</span>
                </Label>
                <Select onValueChange={(value) => setValue('level', value as any)}>
                  <SelectTrigger className="h-14 bg-slate-50 dark:bg-slate-50/50 border-slate-100 dark:border-slate-300 text-slate-900 dark:text-slate-900 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold uppercase italic">
                    <SelectValue placeholder="Intensity Level" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-white border-slate-300 dark:border-slate-300">
                    <SelectItem value="beginner" className="hover:bg-indigo-50 dark:hover:bg-slate-100 text-[10px] font-black uppercase tracking-widest py-3">Beginner (Level 1)</SelectItem>
                    <SelectItem value="intermediate" className="hover:bg-indigo-50 dark:hover:bg-slate-100 text-[10px] font-black uppercase tracking-widest py-3">Intermediate (Level 2)</SelectItem>
                    <SelectItem value="advanced" className="hover:bg-indigo-50 dark:hover:bg-slate-100 text-[10px] font-black uppercase tracking-widest py-3">Advanced (Level 3)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="duration" className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-700 italic">
                  Active Runtime (MIN) <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="duration"
                  type="number"
                  {...register('duration', { valueAsNumber: true })}
                  className="h-14 bg-slate-50 dark:bg-slate-50/50 border-slate-100 dark:border-slate-300 text-slate-900 dark:text-slate-900 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold italic"
                  placeholder="60"
                />
                {errors.duration && (
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-2 ml-1">{errors.duration.message}</p>
                )}
              </div>

              <div className="md:col-span-2 space-y-3">
                <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-700 italic">
                  Mission Overview <span className="text-rose-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  className="bg-slate-50 dark:bg-slate-50/50 border-slate-100 dark:border-slate-300 text-slate-900 dark:text-slate-900 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium py-4 text-base min-h-[120px]"
                  placeholder="Brief the participants on the objectives of this deployment..."
                  rows={4}
                />
                {errors.description && (
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-2 ml-1">{errors.description.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card className="bg-white dark:bg-white border-slate-300 dark:border-slate-300 rounded-[2.5rem] shadow-sm transition-colors overflow-hidden">
          <CardHeader className="p-10 pb-4">
            <CardTitle className="text-sm font-black uppercase tracking-[0.25em] text-slate-700 dark:text-slate-800 italic">CHRONOS SYNC</CardTitle>
          </CardHeader>
          <CardContent className="p-10 pt-0 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <Label htmlFor="startDate" className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-700 italic">
                  Launch Date <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register('startDate')}
                  className="h-14 bg-slate-50 dark:bg-slate-50/50 border-slate-100 dark:border-slate-300 text-slate-900 dark:text-slate-900 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold uppercase italic"
                />
                {errors.startDate && (
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-2 ml-1">{errors.startDate.message}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="startTime" className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-700 italic">
                  Zero Hour <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="startTime"
                  type="time"
                  {...register('startTime')}
                  className="h-14 bg-slate-50 dark:bg-slate-50/50 border-slate-100 dark:border-slate-300 text-slate-900 dark:text-slate-900 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                />
                {errors.startTime && (
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-2 ml-1">{errors.startTime.message}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="endTime" className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-700 italic">
                  Stand Down <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="endTime"
                  type="time"
                  {...register('endTime')}
                  className="h-14 bg-slate-50 dark:bg-slate-50/50 border-slate-100 dark:border-slate-300 text-slate-900 dark:text-slate-900 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                />
                {errors.endTime && (
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-2 ml-1">{errors.endTime.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-700 italic">
                Recurrence Protocol <span className="text-rose-500">*</span>
              </Label>
              <Select onValueChange={(value) => setValue('recurrence', value as any)}>
                <SelectTrigger className="h-14 bg-slate-50 dark:bg-slate-50/50 border-slate-100 dark:border-slate-300 text-slate-900 dark:text-slate-900 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold uppercase italic">
                  <SelectValue placeholder="Cadence Pattern" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-white border-slate-300 dark:border-slate-300">
                  <SelectItem value="one-time" className="py-3">ONE-TIME DEPLOYMENT</SelectItem>
                  <SelectItem value="daily" className="py-3">DAILY CYCLE</SelectItem>
                  <SelectItem value="weekly" className="py-3">WEEKLY FREQUENCY</SelectItem>
                  <SelectItem value="monthly" className="py-3">MONTHLY PHASE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {recurrence === 'weekly' && (
              <div className="space-y-4 pt-4">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-700 italic">Active Deployment Windows</Label>
                <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
                  {DAYS_OF_WEEK.map((day) => (
                    <div
                      key={day.value}
                      className={cn(
                        "h-16 flex items-center justify-center rounded-2xl border-2 transition-all cursor-pointer font-black text-[10px] uppercase tracking-widest",
                        selectedDays.includes(day.value)
                          ? "bg-indigo-600 border-indigo-600 dark:border-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                          : "bg-slate-50 dark:bg-slate-50/50 border-slate-100 dark:border-slate-300 text-slate-700 dark:text-white hover:border-indigo-500/30"
                      )}
                      onClick={() => toggleDay(day.value)}
                    >
                      {day.label}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recurrence !== 'one-time' && (
              <div className="flex flex-col md:flex-row gap-8 pt-4">
                <div className="flex-1 space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-700 italic">Termination Logic</Label>
                  <Select onValueChange={(value) => setValue('endRecurrence', value as any)}>
                    <SelectTrigger className="h-14 bg-slate-50 dark:bg-slate-50/50 border-slate-100 dark:border-slate-300 text-slate-900 dark:text-slate-900 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold uppercase italic">
                      <SelectValue placeholder="Select End State" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-white border-slate-300 dark:border-slate-300">
                      <SelectItem value="never" className="py-3">INFINITE LOOP</SelectItem>
                      <SelectItem value="after" className="py-3">FIXED ITERATIONS</SelectItem>
                      <SelectItem value="on-date" className="py-3">HARD DEADLINE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {endRecurrence === 'after' && (
                  <div className="flex-1 space-y-3">
                    <Label htmlFor="occurrences" className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-700 italic"> Total Iterations </Label>
                    <Input
                      id="occurrences"
                      type="number"
                      {...register('occurrences', { valueAsNumber: true })}
                      className="h-14 bg-slate-50 dark:bg-slate-50/50 border-slate-100 dark:border-slate-300 text-slate-900 dark:text-slate-900 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold italic"
                      placeholder="SET LIMIT"
                    />
                  </div>
                )}

                {endRecurrence === 'on-date' && (
                  <div className="flex-1 space-y-3">
                    <Label htmlFor="endDate" className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-700 italic"> Final Pulse Date </Label>
                    <Input
                      id="endDate"
                      type="date"
                      {...register('endDate')}
                      className="h-14 bg-slate-50 dark:bg-slate-50/50 border-slate-100 dark:border-slate-300 text-slate-900 dark:text-slate-900 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold italic"
                    />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Capacity & Location */}
        <Card className="bg-white dark:bg-white border-slate-300 dark:border-slate-300 rounded-[2.5rem] shadow-sm transition-colors overflow-hidden">
          <CardHeader className="p-10 pb-4">
            <CardTitle className="text-sm font-black uppercase tracking-[0.25em] text-slate-700 dark:text-slate-800 italic">LOGISTICS</CardTitle>
          </CardHeader>
          <CardContent className="p-10 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label htmlFor="maxParticipants" className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-700 italic">
                  Max Cadet Capacity <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  {...register('maxParticipants', { valueAsNumber: true })}
                  className="h-14 bg-slate-50 dark:bg-slate-50/50 border-slate-100 dark:border-slate-300 text-slate-900 dark:text-slate-900 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold italic"
                  placeholder="20"
                />
                {errors.maxParticipants && (
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-2 ml-1">
                    {errors.maxParticipants.message}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="location" className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-700 italic">
                  Deployment Sector <span className="text-rose-500">*</span>
                </Label>
                <Select onValueChange={(value) => setValue('location', value)}>
                  <SelectTrigger className="h-14 bg-slate-50 dark:bg-slate-50/50 border-slate-100 dark:border-slate-300 text-slate-900 dark:text-slate-900 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold uppercase italic">
                    <SelectValue placeholder="Select Zone" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-white border-slate-300 dark:border-slate-300">
                    {LOCATIONS.map((location) => (
                      <SelectItem key={location} value={location} className="py-3">{location.toUpperCase()}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.location && (
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-2 ml-1">{errors.location.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trainer Assignment */}
        <Card className="bg-white dark:bg-white border-slate-300 dark:border-slate-300 rounded-[2.5rem] shadow-sm transition-colors overflow-hidden">
          <CardHeader className="p-10 pb-4">
            <CardTitle className="text-sm font-black uppercase tracking-[0.25em] text-slate-700 dark:text-slate-800 italic">FACULTY LEADS</CardTitle>
          </CardHeader>
          <CardContent className="p-10 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label htmlFor="trainerId" className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-700 italic">
                  Prime Instructor <span className="text-rose-500">*</span>
                </Label>
                <Select onValueChange={(value) => setValue('trainerId', value)}>
                  <SelectTrigger className="h-14 bg-slate-50 dark:bg-slate-50/50 border-slate-100 dark:border-slate-300 text-slate-900 dark:text-slate-900 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold uppercase italic">
                    <SelectValue placeholder="Assign Commander" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-white border-slate-300 dark:border-slate-300">
                    {TRAINERS.map((trainer) => (
                      <SelectItem key={trainer.id} value={trainer.id} className="py-3">{trainer.name.toUpperCase()}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.trainerId && (
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-2 ml-1">{errors.trainerId.message}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="backupTrainerId" className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-700 italic">
                  Auxiliary Lead
                </Label>
                <Select onValueChange={(value) => setValue('backupTrainerId', value)}>
                  <SelectTrigger className="h-14 bg-slate-50 dark:bg-slate-50/50 border-slate-100 dark:border-slate-300 text-slate-900 dark:text-slate-900 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold uppercase italic">
                    <SelectValue placeholder="Backup Available" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-white border-slate-300 dark:border-slate-300">
                    {TRAINERS.map((trainer) => (
                      <SelectItem key={trainer.id} value={trainer.id} className="py-3">{trainer.name.toUpperCase()}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requirements & Notes */}
        <Card className="bg-slate-50 dark:bg-slate-50 border-slate-300 rounded-[2.5rem] transition-colors overflow-hidden">
          <CardHeader className="p-10 pb-4">
            <CardTitle className="text-sm font-black uppercase tracking-[0.25em] text-slate-700 dark:text-slate-800 italic">INTEL & LOADOUT</CardTitle>
          </CardHeader>
          <CardContent className="p-10 pt-0 space-y-6">
            <div className="space-y-3">
              <Label htmlFor="prerequisites" className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-700 italic">
                Protocol Prerequisites
              </Label>
              <Input
                id="prerequisites"
                {...register('prerequisites')}
                className="h-14 bg-white dark:bg-white border-slate-100 dark:border-slate-300 text-slate-900 dark:text-slate-900 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold placeholder:text-slate-600 dark:placeholder:text-slate-900"
                placeholder="Required Clearance or Fitness Level"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="whatToBring" className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-700 italic">
                Personal Loadout
              </Label>
              <Input
                id="whatToBring"
                {...register('whatToBring')}
                className="h-14 bg-white dark:bg-white border-slate-100 dark:border-slate-300 text-slate-900 dark:text-slate-900 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold placeholder:text-slate-600 dark:placeholder:text-slate-900"
                placeholder="Tactical Gear (Mat, Water, etc.)"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="notes" className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-700 italic">
                Encrypted Addendum
              </Label>
              <Textarea
                id="notes"
                {...register('notes')}
                className="bg-white dark:bg-white border-slate-100 dark:border-slate-300 text-slate-900 dark:text-slate-900 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium py-4 text-base min-h-[100px]"
                placeholder="Additional operational details..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
