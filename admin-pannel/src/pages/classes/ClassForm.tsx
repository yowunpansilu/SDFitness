import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

import { ArrowLeft, Save, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Form validation schema
const classSchema = z.object({
    // Class Details
    name: z.string().min(1, 'Class name is required'),
    type: z.string().optional(),
    level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    description: z.string().optional(),
    duration: z.number().optional(),

    // Schedule
    startDate: z.string().optional(),
    startTime: z.string().min(1, 'Start time is required'),
    endTime: z.string().min(1, 'End time is required'),
    recurrence: z.enum(['one-time', 'daily', 'weekly', 'monthly']).optional(),
    daysOfWeek: z.array(z.number()).optional(),
    endRecurrence: z.enum(['never', 'after', 'on-date']).optional(),
    occurrences: z.number().optional(),
    endDate: z.string().optional(),

    // Capacity & Location
    maxParticipants: z.number().min(1, 'Max participants must be at least 1'),
    location: z.string().optional(),

    // Trainer
    trainerId: z.string().min(1, 'Trainer is required'),
    backupTrainerId: z.string().optional(),

    // Requirements
    prerequisites: z.string().optional(),
    whatToBring: z.string().optional(),
    notes: z.string().optional(),
});

type ClassFormData = z.infer<typeof classSchema>;

import api from '@/lib/api/axios';

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

export function ClassForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const isEditMode = Boolean(id);
    const [trainers, setTrainers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(isEditMode);
    const [isSaving, setIsSaving] = useState(false);

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

    useEffect(() => {
        const fetchDropdowns = async () => {
            try {
                const res = await api.get('/trainers');
                setTrainers(res.data);
            } catch (error) {
                console.error('Failed to load trainers', error);
            }
        };

        const fetchClassData = async () => {
            if (!isEditMode) return;
            try {
                const res = await api.get(`/classes/${id}`);
                const data = res.data;
                const schedule = data.schedule || {};

                setValue('name', data.name || '');
                setValue('description', data.description || '');
                setValue('maxParticipants', data.capacity || 20);

                // Try to infer type from name prefix
                const typeMatch = CLASS_TYPES.find(t => data.name?.toLowerCase().includes(t.toLowerCase()));
                if (typeMatch) setValue('type', typeMatch);

                if (data.trainer) {
                    setValue('trainerId', typeof data.trainer === 'string' ? data.trainer : data.trainer._id);
                }

                if (schedule.dayOfWeek) {
                    setValue('recurrence', 'weekly');
                    const dayObj = DAYS_OF_WEEK.find(d => dayOfWeekToString(d.value) === schedule.dayOfWeek);
                    if (dayObj) setValue('daysOfWeek', [dayObj.value]);
                }
                if (schedule.startTime) setValue('startTime', schedule.startTime);
                if (schedule.endTime) setValue('endTime', schedule.endTime);

            } catch (error) {
                console.error('Failed to load class', error);
                toast({ title: 'Error', description: 'Failed to load class details', variant: 'destructive' });
            } finally {
                setIsLoading(false);
            }
        };

        fetchDropdowns().then(fetchClassData);
    }, [id, isEditMode, setValue]);

    const dayOfWeekToString = (val: number) => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[val === 7 ? 0 : val] || 'Monday';
    };

    const onSubmit = async (data: ClassFormData) => {
        setIsSaving(true);
        try {
            const payload = {
                name: data.name,
                description: data.description,
                trainer: data.trainerId,
                capacity: data.maxParticipants,
                schedule: {
                    dayOfWeek: data.daysOfWeek?.[0] ? dayOfWeekToString(data.daysOfWeek[0]) : 'Monday',
                    startTime: data.startTime,
                    endTime: data.endTime,
                }
            };

            if (isEditMode) {
                await api.put(`/classes/${id}`, payload);
            } else {
                await api.post('/classes', payload);
            }

            toast({
                title: isEditMode ? 'Class Updated' : 'Class Created',
                description: `${data.name} has been ${isEditMode ? 'updated' : 'scheduled'} successfully`,
            });
            navigate('/classes');
        } catch (error) {
            console.error('Save failed:', error);
            toast({
                title: 'Error',
                description: 'Failed to save class',
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };

    const toggleDay = (day: number) => {
        const current = selectedDays;
        const updated = current.includes(day)
            ? current.filter((d) => d !== day)
            : [...current, day];
        setValue('daysOfWeek', updated);
    };

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/admin/classes')}
                        className="text-gray-400 hover:text-white hover:bg-dark-800"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-white">
                            {isEditMode ? 'Edit Class' : 'Schedule New Class'}
                        </h1>
                        <p className="text-gray-400">
                            {isEditMode ? 'Update class details' : 'Create a new class schedule'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => navigate('/classes')}
                        className="bg-dark-800 border-dark-700 text-gray-300 hover:bg-dark-700"
                        disabled={isSaving}
                    >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit(onSubmit)}
                        disabled={isSaving || isLoading}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                        {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        {isEditMode ? 'Update Class' : 'Schedule Class'}
                    </Button>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Class Details */}
                <Card className="bg-dark-900/50 border-dark-800">
                    <CardHeader>
                        <CardTitle className="text-white">Class Details</CardTitle>
                        <CardDescription className="text-gray-400">
                            Basic information about the class
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <Label htmlFor="name" className="text-gray-300">
                                    Class Name <span className="text-red-400">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    {...register('name')}
                                    className="bg-dark-800 border-dark-700 text-white"
                                    placeholder="HIIT Bootcamp"
                                />
                                {errors.name && (
                                    <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="type" className="text-gray-300">
                                    Type <span className="text-red-400">*</span>
                                </Label>
                                <Select onValueChange={(value) => setValue('type', value)}>
                                    <SelectTrigger className="bg-dark-800 border-dark-700 text-white">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CLASS_TYPES.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.type && (
                                    <p className="text-xs text-red-400 mt-1">{errors.type.message}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="level" className="text-gray-300">
                                    Level <span className="text-red-400">*</span>
                                </Label>
                                <Select onValueChange={(value) => setValue('level', value as any)}>
                                    <SelectTrigger className="bg-dark-800 border-dark-700 text-white">
                                        <SelectValue placeholder="Select level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="beginner">Beginner</SelectItem>
                                        <SelectItem value="intermediate">Intermediate</SelectItem>
                                        <SelectItem value="advanced">Advanced</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="duration" className="text-gray-300">
                                    Duration (minutes) <span className="text-red-400">*</span>
                                </Label>
                                <Input
                                    id="duration"
                                    type="number"
                                    {...register('duration', { valueAsNumber: true })}
                                    className="bg-dark-800 border-dark-700 text-white"
                                    placeholder="60"
                                />
                                {errors.duration && (
                                    <p className="text-xs text-red-400 mt-1">{errors.duration.message}</p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <Label htmlFor="description" className="text-gray-300">
                                    Description <span className="text-red-400">*</span>
                                </Label>
                                <Textarea
                                    id="description"
                                    {...register('description')}
                                    className="bg-dark-800 border-dark-700 text-white"
                                    placeholder="Describe what participants will do in this class..."
                                    rows={3}
                                />
                                {errors.description && (
                                    <p className="text-xs text-red-400 mt-1">{errors.description.message}</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Schedule */}
                <Card className="bg-dark-900/50 border-dark-800">
                    <CardHeader>
                        <CardTitle className="text-white">Schedule</CardTitle>
                        <CardDescription className="text-gray-400">
                            When and how often the class occurs
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="startDate" className="text-gray-300">
                                    Start Date <span className="text-red-400">*</span>
                                </Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    {...register('startDate')}
                                    className="bg-dark-800 border-dark-700 text-white"
                                />
                                {errors.startDate && (
                                    <p className="text-xs text-red-400 mt-1">{errors.startDate.message}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="startTime" className="text-gray-300">
                                    Start Time <span className="text-red-400">*</span>
                                </Label>
                                <Input
                                    id="startTime"
                                    type="time"
                                    {...register('startTime')}
                                    className="bg-dark-800 border-dark-700 text-white"
                                />
                                {errors.startTime && (
                                    <p className="text-xs text-red-400 mt-1">{errors.startTime.message}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="endTime" className="text-gray-300">
                                    End Time <span className="text-red-400">*</span>
                                </Label>
                                <Input
                                    id="endTime"
                                    type="time"
                                    {...register('endTime')}
                                    className="bg-dark-800 border-dark-700 text-white"
                                />
                                {errors.endTime && (
                                    <p className="text-xs text-red-400 mt-1">{errors.endTime.message}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <Label className="text-gray-300">
                                Recurrence <span className="text-red-400">*</span>
                            </Label>
                            <Select onValueChange={(value) => setValue('recurrence', value as any)}>
                                <SelectTrigger className="bg-dark-800 border-dark-700 text-white">
                                    <SelectValue placeholder="Select recurrence" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="one-time">One-time Class</SelectItem>
                                    <SelectItem value="daily">Daily</SelectItem>
                                    <SelectItem value="weekly">Weekly</SelectItem>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {recurrence === 'weekly' && (
                            <div>
                                <Label className="text-gray-300">Days of Week</Label>
                                <div className="flex gap-2 mt-2">
                                    {DAYS_OF_WEEK.map((day) => (
                                        <div
                                            key={day.value}
                                            className={`flex-1 p-3 rounded-lg border cursor-pointer text-center transition-colors ${selectedDays.includes(day.value)
                                                ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                                                : 'bg-dark-800/50 border-dark-700 text-gray-400 hover:border-purple-500/30'
                                                }`}
                                            onClick={() => toggleDay(day.value)}
                                        >
                                            {day.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {recurrence !== 'one-time' && (
                            <>
                                <div>
                                    <Label className="text-gray-300">End Recurrence</Label>
                                    <Select onValueChange={(value) => setValue('endRecurrence', value as any)}>
                                        <SelectTrigger className="bg-dark-800 border-dark-700 text-white">
                                            <SelectValue placeholder="Select when to end" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="never">Never</SelectItem>
                                            <SelectItem value="after">After X occurrences</SelectItem>
                                            <SelectItem value="on-date">On a specific date</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {endRecurrence === 'after' && (
                                    <div>
                                        <Label htmlFor="occurrences" className="text-gray-300">
                                            Number of Occurrences
                                        </Label>
                                        <Input
                                            id="occurrences"
                                            type="number"
                                            {...register('occurrences', { valueAsNumber: true })}
                                            className="bg-dark-800 border-dark-700 text-white"
                                            placeholder="10"
                                        />
                                    </div>
                                )}

                                {endRecurrence === 'on-date' && (
                                    <div>
                                        <Label htmlFor="endDate" className="text-gray-300">
                                            End Date
                                        </Label>
                                        <Input
                                            id="endDate"
                                            type="date"
                                            {...register('endDate')}
                                            className="bg-dark-800 border-dark-700 text-white"
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Capacity & Location */}
                <Card className="bg-dark-900/50 border-dark-800">
                    <CardHeader>
                        <CardTitle className="text-white">Capacity & Location</CardTitle>
                        <CardDescription className="text-gray-400">
                            Where the class takes place and participant limits
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="maxParticipants" className="text-gray-300">
                                    Max Participants <span className="text-red-400">*</span>
                                </Label>
                                <Input
                                    id="maxParticipants"
                                    type="number"
                                    {...register('maxParticipants', { valueAsNumber: true })}
                                    className="bg-dark-800 border-dark-700 text-white"
                                    placeholder="20"
                                />
                                {errors.maxParticipants && (
                                    <p className="text-xs text-red-400 mt-1">
                                        {errors.maxParticipants.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="location" className="text-gray-300">
                                    Location <span className="text-red-400">*</span>
                                </Label>
                                <Select onValueChange={(value) => setValue('location', value)}>
                                    <SelectTrigger className="bg-dark-800 border-dark-700 text-white">
                                        <SelectValue placeholder="Select location" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {LOCATIONS.map((location) => (
                                            <SelectItem key={location} value={location}>
                                                {location}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.location && (
                                    <p className="text-xs text-red-400 mt-1">{errors.location.message}</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Trainer Assignment */}
                <Card className="bg-dark-900/50 border-dark-800">
                    <CardHeader>
                        <CardTitle className="text-white">Trainer Assignment</CardTitle>
                        <CardDescription className="text-gray-400">
                            Assign trainers to lead the class
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="trainerId" className="text-gray-300">
                                    Primary Trainer <span className="text-red-400">*</span>
                                </Label>
                                <Select value={watch('trainerId')} onValueChange={(value) => setValue('trainerId', value)}>
                                    <SelectTrigger className="bg-dark-800 border-dark-700 text-white">
                                        <SelectValue placeholder="Select trainer" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {trainers.map((trainer: any) => (
                                            <SelectItem key={trainer._id} value={trainer._id}>
                                                {trainer.user?.firstName || ''} {trainer.user?.lastName || ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.trainerId && (
                                    <p className="text-xs text-red-400 mt-1">{errors.trainerId.message}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="backupTrainerId" className="text-gray-300">
                                    Backup Trainer
                                </Label>
                                <Select value={watch('backupTrainerId')} onValueChange={(value) => setValue('backupTrainerId', value)}>
                                    <SelectTrigger className="bg-dark-800 border-dark-700 text-white">
                                        <SelectValue placeholder="Select backup trainer" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {trainers.map((trainer: any) => (
                                            <SelectItem key={trainer._id} value={trainer._id}>
                                                {trainer.user?.firstName || ''} {trainer.user?.lastName || ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Requirements & Notes */}
                <Card className="bg-dark-900/50 border-dark-800">
                    <CardHeader>
                        <CardTitle className="text-white">Requirements & Notes</CardTitle>
                        <CardDescription className="text-gray-400">
                            Additional information for participants
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="prerequisites" className="text-gray-300">
                                Prerequisites
                            </Label>
                            <Input
                                id="prerequisites"
                                {...register('prerequisites')}
                                className="bg-dark-800 border-dark-700 text-white"
                                placeholder="Basic fitness level required"
                            />
                        </div>

                        <div>
                            <Label htmlFor="whatToBring" className="text-gray-300">
                                What to Bring
                            </Label>
                            <Input
                                id="whatToBring"
                                {...register('whatToBring')}
                                className="bg-dark-800 border-dark-700 text-white"
                                placeholder="Yoga mat, water bottle, towel"
                            />
                        </div>

                        <div>
                            <Label htmlFor="notes" className="text-gray-300">
                                Special Notes
                            </Label>
                            <Textarea
                                id="notes"
                                {...register('notes')}
                                className="bg-dark-800 border-dark-700 text-white"
                                placeholder="Any additional information..."
                                rows={3}
                            />
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
