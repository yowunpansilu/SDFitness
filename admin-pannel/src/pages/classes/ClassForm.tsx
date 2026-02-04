import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    ArrowLeft,
    Save,
    Dumbbell,
    Clock,
    Users,
    MapPin,
    Calendar,
    Repeat,
    User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const classSchema = z.object({
    name: z.string().min(2, 'Class name must be at least 2 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    type: z.enum(['yoga', 'hiit', 'spin', 'strength', 'cardio', 'pilates']),
    trainerId: z.string().min(1, 'Please select a trainer'),
    location: z.string().min(1, 'Location is required'),
    capacity: z.string().min(1, 'Capacity is required'),
    duration: z.string().min(1, 'Duration is required'),
    startTime: z.string().min(1, 'Start time is required'),
    isRecurring: z.boolean(),
});

type ClassFormData = z.infer<typeof classSchema>;

const classTypes = [
    { value: 'yoga', label: 'Yoga', color: 'from-purple-500 to-pink-600' },
    { value: 'hiit', label: 'HIIT', color: 'from-orange-500 to-red-600' },
    { value: 'spin', label: 'Spin', color: 'from-blue-500 to-cyan-600' },
    { value: 'strength', label: 'Strength', color: 'from-amber-500 to-orange-600' },
    { value: 'cardio', label: 'Cardio', color: 'from-green-500 to-emerald-600' },
    { value: 'pilates', label: 'Pilates', color: 'from-indigo-500 to-purple-600' },
];

const mockTrainers = [
    { id: '1', name: 'Sarah Johnson' },
    { id: '2', name: 'Mike Ross' },
    { id: '3', name: 'Emma Wilson' },
    { id: '4', name: 'David Chen' },
];

const daysOfWeek = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' },
];

export function ClassForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = Boolean(id);

    const [selectedDays, setSelectedDays] = useState<string[]>([]);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
        watch,
        setValue,
    } = useForm<ClassFormData>({
        resolver: zodResolver(classSchema),
        defaultValues: {
            type: 'yoga',
            capacity: '20',
            duration: '60',
            isRecurring: false,
        },
    });

    const isRecurring = watch('isRecurring');

    const toggleDay = (day: string) => {
        setSelectedDays((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
        );
    };

    const onSubmit = async (data: ClassFormData) => {
        try {
            console.log('Class data:', {
                ...data,
                recurringDays: isRecurring ? selectedDays : [],
            });
            navigate('/classes');
        } catch (error) {
            console.error('Error saving class:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/classes')}
                    className="text-gray-400 hover:text-white"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    {isEditing ? 'Edit Class' : 'Add New Class'}
                </h1>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Dumbbell className="h-5 w-5" />
                            Basic Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="name" className="text-gray-300">
                                Class Name *
                            </Label>
                            <Input
                                id="name"
                                {...register('name')}
                                className="bg-dark-800/50 border-dark-700 text-white"
                                placeholder="e.g., Morning Yoga Flow"
                            />
                            {errors.name && (
                                <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="type" className="text-gray-300">
                                Class Type *
                            </Label>
                            <Controller
                                name="type"
                                control={control}
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className="bg-dark-800/50 border-dark-700 text-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-dark-900 border-dark-700">
                                            {classTypes.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className={`w-3 h-3 rounded-full bg-gradient-to-r ${type.color}`}
                                                        />
                                                        {type.label}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.type && (
                                <p className="text-red-400 text-sm mt-1">{errors.type.message}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="description" className="text-gray-300">
                                Description *
                            </Label>
                            <Textarea
                                id="description"
                                {...register('description')}
                                className="bg-dark-800/50 border-dark-700 text-white min-h-[100px]"
                                placeholder="Describe the class, what participants can expect, difficulty level, etc."
                            />
                            {errors.description && (
                                <p className="text-red-400 text-sm mt-1">{errors.description.message}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="trainerId" className="text-gray-300 flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Trainer *
                            </Label>
                            <Controller
                                name="trainerId"
                                control={control}
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className="bg-dark-800/50 border-dark-700 text-white">
                                            <SelectValue placeholder="Select a trainer" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-dark-900 border-dark-700">
                                            {mockTrainers.map((trainer) => (
                                                <SelectItem key={trainer.id} value={trainer.id}>
                                                    {trainer.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.trainerId && (
                                <p className="text-red-400 text-sm mt-1">{errors.trainerId.message}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Schedule & Capacity */}
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Schedule & Capacity
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="startTime" className="text-gray-300">
                                    Start Time *
                                </Label>
                                <Input
                                    id="startTime"
                                    type="time"
                                    {...register('startTime')}
                                    className="bg-dark-800/50 border-dark-700 text-white"
                                />
                                {errors.startTime && (
                                    <p className="text-red-400 text-sm mt-1">{errors.startTime.message}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="duration" className="text-gray-300">
                                    Duration (minutes) *
                                </Label>
                                <Input
                                    id="duration"
                                    type="number"
                                    {...register('duration')}
                                    className="bg-dark-800/50 border-dark-700 text-white"
                                    placeholder="60"
                                />
                                {errors.duration && (
                                    <p className="text-red-400 text-sm mt-1">{errors.duration.message}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="capacity" className="text-gray-300 flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    Capacity *
                                </Label>
                                <Input
                                    id="capacity"
                                    type="number"
                                    {...register('capacity')}
                                    className="bg-dark-800/50 border-dark-700 text-white"
                                    placeholder="20"
                                />
                                {errors.capacity && (
                                    <p className="text-red-400 text-sm mt-1">{errors.capacity.message}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="location" className="text-gray-300 flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                Location *
                            </Label>
                            <Input
                                id="location"
                                {...register('location')}
                                className="bg-dark-800/50 border-dark-700 text-white"
                                placeholder="e.g., Studio A, Gym Floor, Spin Room"
                            />
                            {errors.location && (
                                <p className="text-red-400 text-sm mt-1">{errors.location.message}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Recurring Schedule */}
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Repeat className="h-5 w-5" />
                            Recurring Schedule
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isRecurring"
                                checked={isRecurring}
                                onCheckedChange={(checked) =>
                                    setValue('isRecurring', checked as boolean)
                                }
                            />
                            <label
                                htmlFor="isRecurring"
                                className="text-sm text-gray-300 cursor-pointer"
                            >
                                This is a recurring class
                            </label>
                        </div>

                        {isRecurring && (
                            <div>
                                <Label className="text-gray-300 mb-3 block flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Select Days of Week
                                </Label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {daysOfWeek.map((day) => (
                                        <div
                                            key={day.value}
                                            className="flex items-center space-x-2"
                                        >
                                            <Checkbox
                                                id={day.value}
                                                checked={selectedDays.includes(day.value)}
                                                onCheckedChange={() => toggleDay(day.value)}
                                            />
                                            <label
                                                htmlFor={day.value}
                                                className="text-sm text-gray-300 cursor-pointer"
                                            >
                                                {day.label}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                {isRecurring && selectedDays.length === 0 && (
                                    <p className="text-amber-400 text-sm mt-2">
                                        Please select at least one day for recurring classes
                                    </p>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/classes')}
                        className="border-dark-700 text-gray-300 hover:bg-dark-800"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                    >
                        <Save className="h-4 w-4 mr-2" />
                        {isSubmitting ? 'Saving...' : isEditing ? 'Update Class' : 'Create Class'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
