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
import { ArrowLeft, Save, X, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

// Form validation schema
const equipmentSchema = z.object({
    // Equipment Information
    name: z.string().min(1, 'Equipment name is required'),
    category: z.string().min(1, 'Category is required'),
    brand: z.string().optional(),
    model: z.string().optional(),
    serialNumber: z.string().min(1, 'Serial number is required'),
    status: z.enum(['available', 'in-use', 'maintenance', 'broken']),

    // Purchase Details
    purchaseDate: z.string().optional(),
    purchasePrice: z.number().min(0).optional(),
    supplierName: z.string().optional(),
    warrantyMonths: z.number().min(0).optional(),

    // Location & Specifications
    location: z.string().min(1, 'Location is required'),
    weightCapacity: z.string().optional(),
    dimensions: z.string().optional(),

    // Maintenance
    maintenanceFrequency: z.enum(['weekly', 'monthly', 'quarterly', 'yearly']).optional(),
    lastMaintenanceDate: z.string().optional(),
    maintenanceNotes: z.string().optional(),
});

type EquipmentFormData = z.infer<typeof equipmentSchema>;

interface Specification {
    id: string;
    key: string;
    value: string;
}

const CATEGORIES = ['Cardio', 'Strength', 'Free Weights', 'Machines', 'Accessories', 'Other'];
const LOCATIONS = ['Cardio Zone', 'Weight Room', 'Studio A', 'Studio B', 'Main Hall', 'Storage'];

export function EquipmentForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const isEditMode = Boolean(id);

    const [specifications, setSpecifications] = useState<Specification[]>([]);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<EquipmentFormData>({
        resolver: zodResolver(equipmentSchema),
        defaultValues: {
            name: '',
            category: '',
            serialNumber: '',
            status: 'available',
            location: '',
        },
    });

    const warrantyMonths = watch('warrantyMonths');
    const purchaseDate = watch('purchaseDate');

    const onSubmit = (data: EquipmentFormData) => {
        console.log('Form submitted:', data);
        console.log('Specifications:', specifications);

        toast({
            title: isEditMode ? 'Equipment Updated' : 'Equipment Added',
            description: `${data.name} has been ${isEditMode ? 'updated' : 'added'} successfully`,
        });

        navigate('/admin/equipment');
    };

    const addSpecification = () => {
        setSpecifications([
            ...specifications,
            {
                id: Date.now().toString(),
                key: '',
                value: '',
            },
        ]);
    };

    const updateSpecification = (id: string, field: keyof Specification, value: string) => {
        setSpecifications(
            specifications.map((spec) =>
                spec.id === id ? { ...spec, [field]: value } : spec
            )
        );
    };

    const removeSpecification = (id: string) => {
        setSpecifications(specifications.filter((spec) => spec.id !== id));
    };

    // Calculate warranty expiry
    const warrantyExpiry =
        purchaseDate && warrantyMonths
            ? new Date(
                new Date(purchaseDate).setMonth(
                    new Date(purchaseDate).getMonth() + warrantyMonths
                )
            )
                .toISOString()
                .split('T')[0]
            : null;

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/admin/equipment')}
                        className="text-muted-foreground hover:text-foreground hover:bg-card"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            {isEditMode ? 'Edit Equipment' : 'Add New Equipment'}
                        </h1>
                        <p className="text-muted-foreground">
                            {isEditMode ? 'Update equipment information' : 'Add new equipment to inventory'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => navigate('/admin/equipment')}
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
                        {isEditMode ? 'Update Equipment' : 'Add Equipment'}
                    </Button>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Equipment Information */}
                <Card className="bg-background/50 border-border">
                    <CardHeader>
                        <CardTitle className="text-foreground">Equipment Information</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Basic details about the equipment
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <Label htmlFor="name" className="text-muted-foreground">
                                    Equipment Name <span className="text-red-400">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    {...register('name')}
                                    className="bg-card border-border text-foreground"
                                    placeholder="Treadmill Pro X3000"
                                />
                                {errors.name && (
                                    <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="category" className="text-muted-foreground">
                                    Category <span className="text-red-400">*</span>
                                </Label>
                                <Select onValueChange={(value) => setValue('category', value)}>
                                    <SelectTrigger className="bg-card border-border text-foreground">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIES.map((category) => (
                                            <SelectItem key={category} value={category}>
                                                {category}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.category && (
                                    <p className="text-xs text-red-400 mt-1">{errors.category.message}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="status" className="text-muted-foreground">
                                    Status <span className="text-red-400">*</span>
                                </Label>
                                <Select onValueChange={(value) => setValue('status', value as any)}>
                                    <SelectTrigger className="bg-card border-border text-foreground">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="available">Available</SelectItem>
                                        <SelectItem value="in-use">In Use</SelectItem>
                                        <SelectItem value="maintenance">Maintenance</SelectItem>
                                        <SelectItem value="broken">Broken</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="brand" className="text-muted-foreground">
                                    Brand
                                </Label>
                                <Input
                                    id="brand"
                                    {...register('brand')}
                                    className="bg-card border-border text-foreground"
                                    placeholder="FitTech"
                                />
                            </div>

                            <div>
                                <Label htmlFor="model" className="text-muted-foreground">
                                    Model
                                </Label>
                                <Input
                                    id="model"
                                    {...register('model')}
                                    className="bg-card border-border text-foreground"
                                    placeholder="X3000-PRO"
                                />
                            </div>

                            <div>
                                <Label htmlFor="serialNumber" className="text-muted-foreground">
                                    Serial Number <span className="text-red-400">*</span>
                                </Label>
                                <Input
                                    id="serialNumber"
                                    {...register('serialNumber')}
                                    className="bg-card border-border text-foreground font-mono"
                                    placeholder="FT-X3000-2025-1234"
                                />
                                {errors.serialNumber && (
                                    <p className="text-xs text-red-400 mt-1">{errors.serialNumber.message}</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Purchase Details */}
                <Card className="bg-background/50 border-border">
                    <CardHeader>
                        <CardTitle className="text-foreground">Purchase Details</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Purchase and warranty information
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="purchaseDate" className="text-muted-foreground">
                                    Purchase Date
                                </Label>
                                <Input
                                    id="purchaseDate"
                                    type="date"
                                    {...register('purchaseDate')}
                                    className="bg-card border-border text-foreground"
                                />
                            </div>

                            <div>
                                <Label htmlFor="purchasePrice" className="text-muted-foreground">
                                    Purchase Price ($)
                                </Label>
                                <Input
                                    id="purchasePrice"
                                    type="number"
                                    step="0.01"
                                    {...register('purchasePrice', { valueAsNumber: true })}
                                    className="bg-card border-border text-foreground"
                                    placeholder="3500.00"
                                />
                            </div>

                            <div>
                                <Label htmlFor="supplierName" className="text-muted-foreground">
                                    Supplier Name
                                </Label>
                                <Input
                                    id="supplierName"
                                    {...register('supplierName')}
                                    className="bg-card border-border text-foreground"
                                    placeholder="FitTech Suppliers Inc."
                                />
                            </div>

                            <div>
                                <Label htmlFor="warrantyMonths" className="text-muted-foreground">
                                    Warranty Duration (months)
                                </Label>
                                <Input
                                    id="warrantyMonths"
                                    type="number"
                                    {...register('warrantyMonths', { valueAsNumber: true })}
                                    className="bg-card border-border text-foreground"
                                    placeholder="36"
                                />
                            </div>
                        </div>

                        {warrantyExpiry && (
                            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                                <p className="text-sm text-green-400">
                                    Warranty expires on: <span className="font-semibold">{warrantyExpiry}</span>
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Location & Specifications */}
                <Card className="bg-background/50 border-border">
                    <CardHeader>
                        <CardTitle className="text-foreground">Location & Specifications</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Physical location and technical details
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                            <div>
                                <Label htmlFor="weightCapacity" className="text-muted-foreground">
                                    Weight Capacity
                                </Label>
                                <Input
                                    id="weightCapacity"
                                    {...register('weightCapacity')}
                                    className="bg-card border-border text-foreground"
                                    placeholder="350 lbs"
                                />
                            </div>

                            <div>
                                <Label htmlFor="dimensions" className="text-muted-foreground">
                                    Dimensions (L × W × H)
                                </Label>
                                <Input
                                    id="dimensions"
                                    {...register('dimensions')}
                                    className="bg-card border-border text-foreground"
                                    placeholder="60 × 20 × 50 inches"
                                />
                            </div>
                        </div>

                        {/* Technical Specifications */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <Label className="text-muted-foreground">Technical Specifications</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addSpecification}
                                    className="bg-card border-border text-muted-foreground hover:bg-muted"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Spec
                                </Button>
                            </div>
                            <div className="space-y-2">
                                {specifications.map((spec) => (
                                    <div
                                        key={spec.id}
                                        className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-card/50 border border-border"
                                    >
                                        <Input
                                            value={spec.key}
                                            onChange={(e) =>
                                                updateSpecification(spec.id, 'key', e.target.value)
                                            }
                                            placeholder="Specification name"
                                            className="bg-card border-border text-foreground"
                                        />
                                        <div className="flex gap-2">
                                            <Input
                                                value={spec.value}
                                                onChange={(e) =>
                                                    updateSpecification(spec.id, 'value', e.target.value)
                                                }
                                                placeholder="Value"
                                                className="bg-card border-border text-foreground"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeSpecification(spec.id)}
                                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Maintenance Schedule */}
                <Card className="bg-background/50 border-border">
                    <CardHeader>
                        <CardTitle className="text-foreground">Maintenance Schedule</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Regular maintenance configuration
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="maintenanceFrequency" className="text-muted-foreground">
                                    Maintenance Frequency
                                </Label>
                                <Select
                                    onValueChange={(value) =>
                                        setValue('maintenanceFrequency', value as any)
                                    }
                                >
                                    <SelectTrigger className="bg-card border-border text-foreground">
                                        <SelectValue placeholder="Select frequency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="weekly">Weekly</SelectItem>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                        <SelectItem value="quarterly">Quarterly</SelectItem>
                                        <SelectItem value="yearly">Yearly</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="lastMaintenanceDate" className="text-muted-foreground">
                                    Last Maintenance Date
                                </Label>
                                <Input
                                    id="lastMaintenanceDate"
                                    type="date"
                                    {...register('lastMaintenanceDate')}
                                    className="bg-card border-border text-foreground"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="maintenanceNotes" className="text-muted-foreground">
                                Maintenance Notes
                            </Label>
                            <Textarea
                                id="maintenanceNotes"
                                {...register('maintenanceNotes')}
                                className="bg-card border-border text-foreground"
                                placeholder="Any special maintenance instructions..."
                                rows={3}
                            />
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
