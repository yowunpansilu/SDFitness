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
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/admin/classes')}
                        className="text-muted-foreground hover:text-foreground hover:bg-card"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            {isEditMode ? 'Edit Class' : 'Schedule New Class'}
                        </h1>
                        <p className="text-muted-foreground">
                            {isEditMode ? 'Update class details' : 'Create a new class schedule'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => navigate('/admin/classes')}
                        className="bg-card border-border text-muted-foreground hover:bg-muted"
                    >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit(onSubmit)}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                        <Save className="h-4 w-4 mr-2" />
                        {isEditMode ? 'Update Class' : 'Schedule Class'}
                    </Button>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Class Details */}
                <Card className="bg-background/50 border-border">
                    <CardHeader>
                        <CardTitle className="text-foreground">Class Details</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Basic information about the class
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <Label htmlFor="name" className="text-muted-foreground">
                                    Class Name <span className="text-red-400">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    {...register('name')}
                                    className="bg-card border-border text-foreground"
                                    placeholder="HIIT Bootcamp"
                                />
                                {errors.name && (
                                    <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="type" className="text-muted-foreground">
                                    Type <span className="text-red-400">*</span>
                                </Label>
                                <Select onValueChange={(value) => setValue('type', value)}>
                                    <SelectTrigger className="bg-card border-border text-foreground">
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
                                <Label htmlFor="level" className="text-muted-foreground">
                                    Level <span className="text-red-400">*</span>
                                </Label>
                                <Select onValueChange={(value) => setValue('level', value as any)}>
                                    <SelectTrigger className="bg-card border-border text-foreground">
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
                                <Label htmlFor="duration" className="text-muted-foreground">
                                    Duration (minutes) <span className="text-red-400">*</span>
                                </Label>
                                <Input
                                    id="duration"
                                    type="number"
                                    {...register('duration', { valueAsNumber: true })}
                                    className="bg-card border-border text-foreground"
                                    placeholder="60"
                                />
                                {errors.duration && (
                                    <p className="text-xs text-red-400 mt-1">{errors.duration.message}</p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <Label htmlFor="description" className="text-muted-foreground">
                                    Description <span className="text-red-400">*</span>
                                </Label>
                                <Textarea
                                    id="description"
                                    {...register('description')}
                                    className="bg-card border-border text-foreground"
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
                <Card className="bg-background/50 border-border">
                    <CardHeader>
                        <CardTitle className="text-foreground">Schedule</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            When and how often the class occurs
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="startDate" className="text-muted-foreground">
                                    Start Date <span className="text-red-400">*</span>
                                </Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    {...register('startDate')}
                                    className="bg-card border-border text-foreground"
                                />
                                {errors.startDate && (
                                    <p className="text-xs text-red-400 mt-1">{errors.startDate.message}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="startTime" className="text-muted-foreground">
                                    Start Time <span className="text-red-400">*</span>
                                </Label>
                                <Input
                                    id="startTime"
                                    type="time"
                                    {...register('startTime')}
                                    className="bg-card border-border text-foreground"
                                />
                                {errors.startTime && (
                                    <p className="text-xs text-red-400 mt-1">{errors.startTime.message}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="endTime" className="text-muted-foreground">
                                    End Time <span className="text-red-400">*</span>
                                </Label>
                                <Input
                                    id="endTime"
                                    type="time"
                                    {...register('endTime')}
                                    className="bg-card border-border text-foreground"
                                />
                                {errors.endTime && (
                                    <p className="text-xs text-red-400 mt-1">{errors.endTime.message}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <Label className="text-muted-foreground">
                                Recurrence <span className="text-red-400">*</span>
                            </Label>
                            <Select onValueChange={(value) => setValue('recurrence', value as any)}>
                                <SelectTrigger className="bg-card border-border text-foreground">
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
                                <Label className="text-muted-foreground">Days of Week</Label>
                                <div className="flex gap-2 mt-2">
                                    {DAYS_OF_WEEK.map((day) => (
                                        <div
                                            key={day.value}
                                            className={`flex-1 p-3 rounded-lg border cursor-pointer text-center transition-colors ${selectedDays.includes(day.value)
                                                ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                                                : 'bg-card/50 border-border text-muted-foreground hover:border-purple-500/30'
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
                                    <Label className="text-muted-foreground">End Recurrence</Label>
                                    <Select onValueChange={(value) => setValue('endRecurrence', value as any)}>
                                        <SelectTrigger className="bg-card border-border text-foreground">
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
                                        <Label htmlFor="occurrences" className="text-muted-foreground">
                                            Number of Occurrences
                                        </Label>
                                        <Input
                                            id="occurrences"
                                            type="number"
                                            {...register('occurrences', { valueAsNumber: true })}
                                            className="bg-card border-border text-foreground"
                                            placeholder="10"
                                        />
                                    </div>
                                )}

                                {endRecurrence === 'on-date' && (
                                    <div>
                                        <Label htmlFor="endDate" className="text-muted-foreground">
                                            End Date
                                        </Label>
                                        <Input
                                            id="endDate"
                                            type="date"
                                            {...register('endDate')}
                                            className="bg-card border-border text-foreground"
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Capacity & Location */}
                <Card className="bg-background/50 border-border">
                    <CardHeader>
                        <CardTitle className="text-foreground">Capacity & Location</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Where the class takes place and participant limits
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="maxParticipants" className="text-muted-foreground">
                                    Max Participants <span className="text-red-400">*</span>
                                </Label>
                                <Input
                                    id="maxParticipants"
                                    type="number"
                                    {...register('maxParticipants', { valueAsNumber: true })}
                                    className="bg-card border-border text-foreground"
                                    placeholder="20"
                                />
                                {errors.maxParticipants && (
                                    <p className="text-xs text-red-400 mt-1">
                                        {errors.maxParticipants.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="location" className="text-muted-foreground">
                                    Location <span className="text-red-400">*</span>
                                </Label>
                                <Select onValueChange={(value) => setValue('location', value)}>
                                    <SelectTrigger className="bg-card border-border text-foreground">
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
                <Card className="bg-background/50 border-border">
                    <CardHeader>
                        <CardTitle className="text-foreground">Trainer Assignment</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Assign trainers to lead the class
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="trainerId" className="text-muted-foreground">
                                    Primary Trainer <span className="text-red-400">*</span>
                                </Label>
                                <Select onValueChange={(value) => setValue('trainerId', value)}>
                                    <SelectTrigger className="bg-card border-border text-foreground">
                                        <SelectValue placeholder="Select trainer" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TRAINERS.map((trainer) => (
                                            <SelectItem key={trainer.id} value={trainer.id}>
                                                {trainer.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.trainerId && (
                                    <p className="text-xs text-red-400 mt-1">{errors.trainerId.message}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="backupTrainerId" className="text-muted-foreground">
                                    Backup Trainer
                                </Label>
                                <Select onValueChange={(value) => setValue('backupTrainerId', value)}>
                                    <SelectTrigger className="bg-card border-border text-foreground">
                                        <SelectValue placeholder="Select backup trainer" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TRAINERS.map((trainer) => (
                                            <SelectItem key={trainer.id} value={trainer.id}>
                                                {trainer.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Requirements & Notes */}
                <Card className="bg-background/50 border-border">
                    <CardHeader>
                        <CardTitle className="text-foreground">Requirements & Notes</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Additional information for participants
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="prerequisites" className="text-muted-foreground">
                                Prerequisites
                            </Label>
                            <Input
                                id="prerequisites"
                                {...register('prerequisites')}
                                className="bg-card border-border text-foreground"
                                placeholder="Basic fitness level required"
                            />
                        </div>

                        <div>
                            <Label htmlFor="whatToBring" className="text-muted-foreground">
                                What to Bring
                            </Label>
                            <Input
                                id="whatToBring"
                                {...register('whatToBring')}
                                className="bg-card border-border text-foreground"
                                placeholder="Yoga mat, water bottle, towel"
                            />
                        </div>

                        <div>
                            <Label htmlFor="notes" className="text-muted-foreground">
                                Special Notes
                            </Label>
                            <Textarea
                                id="notes"
                                {...register('notes')}
                                className="bg-card border-border text-foreground"
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
