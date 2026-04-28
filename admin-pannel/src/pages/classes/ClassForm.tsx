import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '@/lib/api/axios';
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
  level: z.string().min(1, 'Level is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  duration: z.number().min(15, 'Duration must be at least 15 minutes'),

  // Schedule
  dayOfWeek: z.string().min(1, 'Day of week is required'),
  startTime: z.string().min(1, 'Start time is required'),
  price: z.number().min(0, 'Price must be non-negative'),

  // Capacity & Location
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  location: z.string().min(1, 'Location is required'),

  // Trainer
  trainerId: z.string().min(1, 'Trainer is required'),
});

type ClassFormData = z.infer<typeof classSchema>;

const CLASS_TYPES = ['Cardio', 'Strength', 'Yoga', 'HIIT', 'Pilates', 'Boxing', 'Spinning', 'CrossFit'];
const DAYS_OF_WEEK_LABELS = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];
const LOCATIONS = ['Studio A', 'Studio B', 'Main Hall', 'Outdoor Area', 'Cardio Zone', 'Spin Room'];

// Mock trainers removed - fetching from API

export function ClassForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditMode = Boolean(id);
  const [trainers, setTrainers] = useState<{ id: string, name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(isEditMode);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: '',
      type: '',
      level: 'beginner',
      description: '',
      duration: 60,
      startTime: '09:00',
      dayOfWeek: 'Monday',
      capacity: 20,
      location: '',
      trainerId: '',
      price: 0
    },
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const trainersRes = await api.get('/trainers');
        setTrainers(trainersRes.data.map((t: { _id: string, userId?: { firstName: string, lastName: string } }) => ({
          id: t._id,
          name: t.userId ? `${t.userId.firstName} ${t.userId.lastName}` : 'Unnamed Trainer'
        })));

        if (isEditMode) {
          const classRes = await api.get(`/classes/${id}`);
          const c = classRes.data;
          reset({
            name: c.name,
            type: c.type,
            level: c.level,
            description: c.description,
            duration: c.duration,
            startTime: c.schedule?.startTime,
            dayOfWeek: c.schedule?.dayOfWeek,
            capacity: c.capacity,
            location: c.location,
            trainerId: c.trainer?._id || c.trainer,
            price: c.price || 0
          });
        }
      } catch (error) {
        console.error('Error loading form data:', error);
        toast({
          title: 'System Access Error',
          description: 'Failed to synchronize faculty or protocol data.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, [id, isEditMode, reset, toast]);

  const onSubmit = async (data: ClassFormData) => {
    try {
      const payload = {
        ...data,
        trainer: data.trainerId,
        schedule: {
          dayOfWeek: data.dayOfWeek,
          startTime: data.startTime
        }
      };

      if (isEditMode) {
        await api.put(`/classes/${id}`, payload);
      } else {
        await api.post('/classes', payload);
      }

      toast({
        title: isEditMode ? 'Class Synchronized' : 'Class Registed',
        description: `${data.name} sequence updated successfully.`,
      });

      navigate('/classes');
    } catch (error) {
      console.error('Error submitting class:', error);
      toast({
        title: 'Sequence Failure',
        description: 'An error occurred during protocol synchronization.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-400 font-bold uppercase text-xs tracking-widest animate-pulse">Registing Interface...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-navy-800">
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/classes')}
            className="h-12 w-12 rounded-2xl text-slate-400 dark:text-navy-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-navy-800/50 transition-all p-0 flex items-center justify-center border border-transparent hover:border-slate-200 dark:hover:border-navy-700"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white transition-colors">
              {isEditMode ? 'EDIT CLASS PROTOCOL' : 'INITIALIZE CLASS'}
            </h1>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 dark:text-navy-600 mt-1">
              {isEditMode ? 'System Override Active' : 'New Deployment Sequence'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/classes')}
            className="h-12 px-8 border-slate-200 dark:border-navy-800 text-slate-400 dark:text-navy-500 hover:bg-slate-50 dark:hover:bg-navy-800/50 font-bold uppercase text-xs tracking-widest rounded-2xl transition-all flex items-center gap-3"
          >
            <X className="h-4 w-4" />
            Abort
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            className="h-12 px-10 bg-slate-900 dark:bg-indigo-600 hover:bg-black dark:hover:bg-indigo-700 text-white font-bold uppercase text-xs tracking-widest rounded-2xl transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-3"
          >
            <Save className="h-4 w-4" />
            {isEditMode ? 'Synchronize' : 'Confirm Dispatch'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 max-w-5xl mx-auto">
        {/* Class Details */}
        <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 rounded-[2.5rem] shadow-sm transition-colors overflow-hidden">
          <CardHeader className="p-10 pb-4">
            <CardTitle className="text-sm font-bold uppercase tracking-tight text-slate-400 dark:text-navy-600">CORE COMMAND</CardTitle>
          </CardHeader>
          <CardContent className="p-10 pt-0 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2 space-y-3">
                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-navy-500">
                  Class Designation <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="name"
                  {...register('name')}
                  className={cn(
                    "h-14 bg-slate-50 dark:bg-navy-950/50 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold placeholder:text-slate-300 dark:placeholder:text-navy-800 uppercase tracking-tight",
                    errors.name && "border-rose-500 ring-rose-500/10"
                  )}
                  placeholder="E.G. TITAN BOOTCAMP"
                />
                {errors.name && (
                  <p className="text-xs font-bold text-rose-500 uppercase tracking-widest mt-2 ml-1">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="type" className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-navy-500">
                  Faculty Type <span className="text-rose-500">*</span>
                </Label>
                <Select onValueChange={(value) => setValue('type', value)} value={watch('type')}>
                  <SelectTrigger className={cn(
                    "h-14 bg-slate-50 dark:bg-navy-950/50 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold uppercase",
                    errors.type && "border-rose-500 ring-rose-500/10"
                  )}>
                    <SelectValue placeholder="Select Class Branch" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
                    {CLASS_TYPES.map((type) => (
                      <SelectItem key={type} value={type} className="hover:bg-indigo-50 dark:hover:bg-navy-800 text-xs font-bold uppercase tracking-widest py-3">
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-xs font-bold text-rose-500 uppercase tracking-widest mt-2 ml-1">{errors.type.message}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="level" className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-navy-500">
                  Difficulty System <span className="text-rose-500">*</span>
                </Label>
                <Select onValueChange={(value) => setValue('level', value)} value={watch('level')}>
                  <SelectTrigger className={cn(
                    "h-14 bg-slate-50 dark:bg-navy-950/50 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold uppercase",
                    errors.level && "border-rose-500 ring-rose-500/10"
                  )}>
                    <SelectValue placeholder="Intensity Level" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
                    <SelectItem value="beginner" className="hover:bg-indigo-50 dark:hover:bg-navy-800 text-xs font-bold uppercase tracking-widest py-3">Beginner (Level 1)</SelectItem>
                    <SelectItem value="intermediate" className="hover:bg-indigo-50 dark:hover:bg-navy-800 text-xs font-bold uppercase tracking-widest py-3">Intermediate (Level 2)</SelectItem>
                    <SelectItem value="advanced" className="hover:bg-indigo-50 dark:hover:bg-navy-800 text-xs font-bold uppercase tracking-widest py-3">Advanced (Level 3)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="duration" className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-navy-500">
                  Active Runtime (MIN) <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="duration"
                  type="number"
                  {...register('duration', { valueAsNumber: true })}
                  className={cn(
                    "h-14 bg-slate-50 dark:bg-navy-950/50 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold",
                    errors.duration && "border-rose-500 ring-rose-500/10"
                  )}
                  placeholder="60"
                />
                {errors.duration && (
                  <p className="text-xs font-bold text-rose-500 uppercase tracking-widest mt-2 ml-1">{errors.duration.message}</p>
                )}
              </div>

              <div className="md:col-span-2 space-y-3">
                <Label htmlFor="description" className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-navy-500">
                  Mission Overview <span className="text-rose-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  className={cn(
                    "bg-slate-50 dark:bg-navy-950/50 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium py-4 text-base min-h-[120px]",
                    errors.description && "border-rose-500 ring-rose-500/10"
                  )}
                  placeholder="Brief the participants on the objectives of this deployment..."
                  rows={4}
                />
                {errors.description && (
                  <p className="text-xs font-bold text-rose-500 uppercase tracking-widest mt-2 ml-1">{errors.description.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 rounded-[2.5rem] shadow-sm transition-colors overflow-hidden">
          <CardHeader className="p-10 pb-4">
            <CardTitle className="text-sm font-bold uppercase tracking-tight text-slate-400 dark:text-navy-600">CHRONOS SYNC</CardTitle>
          </CardHeader>
          <CardContent className="p-10 pt-0 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-navy-500">
                  Deployment Day <span className="text-rose-500">*</span>
                </Label>
                <Select onValueChange={(value) => setValue('dayOfWeek', value)} value={watch('dayOfWeek')}>
                  <SelectTrigger className={cn(
                    "h-14 bg-slate-50 dark:bg-navy-950/50 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold uppercase",
                    errors.dayOfWeek && "border-rose-500 ring-rose-500/10"
                  )}>
                    <SelectValue placeholder="Select Day" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
                    {DAYS_OF_WEEK_LABELS.map(d => (
                      <SelectItem key={d} value={d} className="py-3">{d.toUpperCase()}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.dayOfWeek && (
                  <p className="text-xs font-bold text-rose-500 uppercase tracking-widest mt-2 ml-1">{errors.dayOfWeek.message}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="startTime" className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-navy-500">
                  Zero Hour <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="startTime"
                  type="time"
                  {...register('startTime')}
                  className={cn(
                    "h-14 bg-slate-50 dark:bg-navy-950/50 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold",
                    errors.startTime && "border-rose-500 ring-rose-500/10"
                  )}
                />
                {errors.startTime && (
                  <p className="text-xs font-bold text-rose-500 uppercase tracking-widest mt-2 ml-1">{errors.startTime.message}</p>
                )}
              </div>
            </div>

            {/* Simplified scheduling for now to match backend model */}
          </CardContent>
        </Card>

        {/* Capacity & Location */}
        <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 rounded-[2.5rem] shadow-sm transition-colors overflow-hidden">
          <CardHeader className="p-10 pb-4">
            <CardTitle className="text-sm font-bold uppercase tracking-tight text-slate-400 dark:text-navy-600">LOGISTICS</CardTitle>
          </CardHeader>
          <CardContent className="p-10 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label htmlFor="capacity" className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-navy-500">
                  Max Cadet Capacity <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="capacity"
                  type="number"
                  {...register('capacity', { valueAsNumber: true })}
                  className={cn(
                    "h-14 bg-slate-50 dark:bg-navy-950/50 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold",
                    errors.capacity && "border-rose-500 ring-rose-500/10"
                  )}
                  placeholder="20"
                />
                {errors.capacity && (
                  <p className="text-xs font-bold text-rose-500 uppercase tracking-widest mt-2 ml-1">
                    {errors.capacity.message}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="price" className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-navy-500">
                  Class Price (LKR) <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  {...register('price', { valueAsNumber: true })}
                  className={cn(
                    "h-14 bg-slate-50 dark:bg-navy-950/50 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold",
                    errors.price && "border-rose-500 ring-rose-500/10"
                  )}
                  placeholder="e.g. 2500"
                />
                {errors.price && (
                  <p className="text-xs font-bold text-rose-500 uppercase tracking-widest mt-2 ml-1">{errors.price.message}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="location" className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-navy-500">
                  Deployment Sector <span className="text-rose-500">*</span>
                </Label>
                <Select onValueChange={(value) => setValue('location', value)} value={watch('location')}>
                  <SelectTrigger className={cn(
                    "h-14 bg-slate-50 dark:bg-navy-950/50 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold uppercase",
                    errors.location && "border-rose-500 ring-rose-500/10"
                  )}>
                    <SelectValue placeholder="Select Zone" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
                    {LOCATIONS.map((location) => (
                      <SelectItem key={location} value={location} className="py-3">{location.toUpperCase()}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.location && (
                  <p className="text-xs font-bold text-rose-500 uppercase tracking-widest mt-2 ml-1">{errors.location.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trainer Assignment */}
        <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 rounded-[2.5rem] shadow-sm transition-colors overflow-hidden">
          <CardHeader className="p-10 pb-4">
            <CardTitle className="text-sm font-bold uppercase tracking-tight text-slate-400 dark:text-navy-600">FACULTY LEADS</CardTitle>
          </CardHeader>
          <CardContent className="p-10 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label htmlFor="trainerId" className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-navy-500">
                  Prime Instructor <span className="text-rose-500">*</span>
                </Label>
                <Select onValueChange={(value) => setValue('trainerId', value)} value={watch('trainerId')}>
                  <SelectTrigger className={cn(
                    "h-14 bg-slate-50 dark:bg-navy-950/50 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold uppercase",
                    errors.trainerId && "border-rose-500 ring-rose-500/10"
                  )}>
                    <SelectValue placeholder="Assign Commander" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
                    {trainers.map((trainer) => (
                      <SelectItem key={trainer.id} value={trainer.id} className="py-3">{trainer.name.toUpperCase()}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.trainerId && (
                  <p className="text-xs font-bold text-rose-500 uppercase tracking-widest mt-2 ml-1">{errors.trainerId.message}</p>
                )}
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-300 dark:text-navy-800">Auxiliary Leads Offline</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* simplified to match backend model */}
      </form>
    </div>
  );
}
