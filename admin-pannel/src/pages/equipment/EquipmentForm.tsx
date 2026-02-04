import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    ArrowLeft,
    Save,
    Wrench,
    Calendar,
    MapPin,
    Package,
    FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const equipmentSchema = z.object({
    name: z.string().min(2, 'Equipment name must be at least 2 characters'),
    category: z.enum(['cardio', 'strength', 'free_weights', 'functional', 'other']),
    brand: z.string().min(1, 'Brand is required'),
    model: z.string().min(1, 'Model is required'),
    serialNumber: z.string().min(1, 'Serial number is required'),
    purchaseDate: z.string().min(1, 'Purchase date is required'),
    location: z.string().min(1, 'Location is required'),
    status: z.enum(['working', 'maintenance', 'broken', 'retired']),
    lastMaintenance: z.string().optional(),
    nextMaintenance: z.string().optional(),
    notes: z.string().optional(),
});

type EquipmentFormData = z.infer<typeof equipmentSchema>;

const categories = [
    { value: 'cardio', label: 'Cardio' },
    { value: 'strength', label: 'Strength' },
    { value: 'free_weights', label: 'Free Weights' },
    { value: 'functional', label: 'Functional' },
    { value: 'other', label: 'Other' },
];

const statuses = [
    { value: 'working', label: '✅ Working', color: 'text-green-400' },
    { value: 'maintenance', label: '🔧 Maintenance', color: 'text-yellow-400' },
    { value: 'broken', label: '❌ Broken', color: 'text-red-400' },
    { value: 'retired', label: '🚫 Retired', color: 'text-gray-400' },
];

export function EquipmentForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = Boolean(id);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
    } = useForm<EquipmentFormData>({
        resolver: zodResolver(equipmentSchema),
        defaultValues: {
            category: 'cardio',
            status: 'working',
            purchaseDate: new Date().toISOString().split('T')[0],
        },
    });

    const onSubmit = async (data: EquipmentFormData) => {
        try {
            console.log('Equipment data:', data);
            navigate('/equipment');
        } catch (error) {
            console.error('Error saving equipment:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/equipment')}
                    className="text-gray-400 hover:text-white"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    {isEditing ? 'Edit Equipment' : 'Add New Equipment'}
                </h1>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Basic Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="name" className="text-gray-300">
                                Equipment Name *
                            </Label>
                            <Input
                                id="name"
                                {...register('name')}
                                className="bg-dark-800/50 border-dark-700 text-white"
                                placeholder="e.g., Treadmill Pro X5"
                            />
                            {errors.name && (
                                <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="category" className="text-gray-300">
                                    Category *
                                </Label>
                                <Controller
                                    name="category"
                                    control={control}
                                    render={({ field }) => (
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger className="bg-dark-800/50 border-dark-700 text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-dark-900 border-dark-700">
                                                {categories.map((cat) => (
                                                    <SelectItem key={cat.value} value={cat.value}>
                                                        {cat.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.category && (
                                    <p className="text-red-400 text-sm mt-1">{errors.category.message}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="status" className="text-gray-300">
                                    Status *
                                </Label>
                                <Controller
                                    name="status"
                                    control={control}
                                    render={({ field }) => (
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger className="bg-dark-800/50 border-dark-700 text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-dark-900 border-dark-700">
                                                {statuses.map((status) => (
                                                    <SelectItem key={status.value} value={status.value}>
                                                        <span className={status.color}>{status.label}</span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.status && (
                                    <p className="text-red-400 text-sm mt-1">{errors.status.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="brand" className="text-gray-300">
                                    Brand *
                                </Label>
                                <Input
                                    id="brand"
                                    {...register('brand')}
                                    className="bg-dark-800/50 border-dark-700 text-white"
                                    placeholder="e.g., RunMaster"
                                />
                                {errors.brand && (
                                    <p className="text-red-400 text-sm mt-1">{errors.brand.message}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="model" className="text-gray-300">
                                    Model *
                                </Label>
                                <Input
                                    id="model"
                                    {...register('model')}
                                    className="bg-dark-800/50 border-dark-700 text-white"
                                    placeholder="e.g., X5-2024"
                                />
                                {errors.model && (
                                    <p className="text-red-400 text-sm mt-1">{errors.model.message}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="serialNumber" className="text-gray-300">
                                    Serial Number *
                                </Label>
                                <Input
                                    id="serialNumber"
                                    {...register('serialNumber')}
                                    className="bg-dark-800/50 border-dark-700 text-white font-mono"
                                    placeholder="e.g., RM-TM-001234"
                                />
                                {errors.serialNumber && (
                                    <p className="text-red-400 text-sm mt-1">{errors.serialNumber.message}</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Location & Dates */}
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Location & Dates
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="location" className="text-gray-300">
                                Location *
                            </Label>
                            <Input
                                id="location"
                                {...register('location')}
                                className="bg-dark-800/50 border-dark-700 text-white"
                                placeholder="e.g., Cardio Zone A, Strength Zone B"
                            />
                            {errors.location && (
                                <p className="text-red-400 text-sm mt-1">{errors.location.message}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="purchaseDate" className="text-gray-300 flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Purchase Date *
                                </Label>
                                <Input
                                    id="purchaseDate"
                                    type="date"
                                    {...register('purchaseDate')}
                                    className="bg-dark-800/50 border-dark-700 text-white"
                                />
                                {errors.purchaseDate && (
                                    <p className="text-red-400 text-sm mt-1">{errors.purchaseDate.message}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="lastMaintenance" className="text-gray-300">
                                    Last Maintenance
                                </Label>
                                <Input
                                    id="lastMaintenance"
                                    type="date"
                                    {...register('lastMaintenance')}
                                    className="bg-dark-800/50 border-dark-700 text-white"
                                />
                            </div>

                            <div>
                                <Label htmlFor="nextMaintenance" className="text-gray-300 flex items-center gap-2">
                                    <Wrench className="h-4 w-4" />
                                    Next Maintenance
                                </Label>
                                <Input
                                    id="nextMaintenance"
                                    type="date"
                                    {...register('nextMaintenance')}
                                    className="bg-dark-800/50 border-dark-700 text-white"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Additional Notes */}
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Additional Notes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Label htmlFor="notes" className="text-gray-300">
                            Notes
                        </Label>
                        <Textarea
                            id="notes"
                            {...register('notes')}
                            className="bg-dark-800/50 border-dark-700 text-white min-h-[100px]"
                            placeholder="Any additional information about this equipment..."
                        />
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/equipment')}
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
                        {isSubmitting ? 'Saving...' : isEditing ? 'Update Equipment' : 'Add Equipment'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
