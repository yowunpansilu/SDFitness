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
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save, X, Plus, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

// Form validation schema
const trainerSchema = z.object({
    // Personal Information
    fullName: z.string().min(1, 'Full name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().regex(/^[0-9]{10}$/, 'Phone must be 10 digits'),
    dateOfBirth: z.string().optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    photo: z.string().optional(),

    // Professional Details
    specializations: z.array(z.string()).min(1, 'Select at least one specialization'),
    bio: z.string().min(10, 'Bio must be at least 10 characters').optional(),
    yearsOfExperience: z.number().min(0).optional(),
    hourlyRate: z.number().positive('Rate must be positive'),

    // Employment
    joinDate: z.string(),
    employmentStatus: z.enum(['full-time', 'part-time', 'contract']),
    commissionRate: z.number().min(0).max(100).optional(),
    availableHoursPerWeek: z.number().min(0).max(168).optional(),

    // Emergency Contact
    emergencyContactName: z.string().min(1, 'Emergency contact name is required'),
    emergencyContactRelationship: z.string().optional(),
    emergencyContactPhone: z.string().regex(/^[0-9]{10}$/, 'Phone must be 10 digits'),
});

type TrainerFormData = z.infer<typeof trainerSchema>;

interface Certification {
    id: string;
    name: string;
    issuer: string;
    issueDate: string;
}

const SPECIALIZATIONS = [
    'HIIT',
    'Yoga',
    'CrossFit',
    'Boxing',
    'Pilates',
    'Strength Training',
    'Cardio',
    'Spinning',
    'Zumba',
    'Functional Training',
];

export function TrainerForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const isEditMode = Boolean(id);

    const [certifications, setCertifications] = useState<Certification[]>([]);
    const [photoPreview, setPhotoPreview] = useState<string>('');

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<TrainerFormData>({
        resolver: zodResolver(trainerSchema),
        defaultValues: {
            fullName: '',
            email: '',
            phone: '',
            specializations: [],
            hourlyRate: 0,
            joinDate: new Date().toISOString().split('T')[0],
            employmentStatus: 'full-time',
            emergencyContactName: '',
            emergencyContactPhone: '',
        },
    });

    const selectedSpecializations = watch('specializations') || [];

    const onSubmit = (data: TrainerFormData) => {
        console.log('Form submitted:', data);
        console.log('Certifications:', certifications);

        toast({
            title: isEditMode ? 'Trainer Updated' : 'Trainer Created',
            description: `${data.fullName} has been ${isEditMode ? 'updated' : 'added'} successfully`,
        });

        navigate('/admin/trainers');
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
                setValue('photo', reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const toggleSpecialization = (spec: string) => {
        const current = selectedSpecializations;
        const updated = current.includes(spec)
            ? current.filter((s) => s !== spec)
            : [...current, spec];
        setValue('specializations', updated);
    };

    const addCertification = () => {
        setCertifications([
            ...certifications,
            {
                id: Date.now().toString(),
                name: '',
                issuer: '',
                issueDate: '',
            },
        ]);
    };

    const updateCertification = (id: string, field: keyof Certification, value: string) => {
        setCertifications(
            certifications.map((cert) =>
                cert.id === id ? { ...cert, [field]: value } : cert
            )
        );
    };

    const removeCertification = (id: string) => {
        setCertifications(certifications.filter((cert) => cert.id !== id));
    };

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/admin/trainers')}
                        className="text-muted-foreground hover:text-foreground hover:bg-card"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            {isEditMode ? 'Edit Trainer' : 'Add New Trainer'}
                        </h1>
                        <p className="text-muted-foreground">
                            {isEditMode ? 'Update trainer information' : 'Create a new trainer profile'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => navigate('/admin/trainers')}
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
                        {isEditMode ? 'Update Trainer' : 'Create Trainer'}
                    </Button>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Personal Information */}
                <Card className="bg-background/50 border-border">
                    <CardHeader>
                        <CardTitle className="text-foreground">Personal Information</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Basic personal details of the trainer
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Photo Upload */}
                        <div className="flex items-center gap-6">
                            <div className="flex-shrink-0">
                                <div className="w-24 h-24 rounded-full bg-card border-2 border-border overflow-hidden flex items-center justify-center">
                                    {photoPreview ? (
                                        <img
                                            src={photoPreview}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <Upload className="h-8 w-8 text-muted-foreground" />
                                    )}
                                </div>
                            </div>
                            <div>
                                <Label
                                    htmlFor="photo"
                                    className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-card border border-border text-muted-foreground rounded-md hover:bg-muted"
                                >
                                    <Upload className="h-4 w-4" />
                                    Upload Photo
                                </Label>
                                <input
                                    id="photo"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handlePhotoUpload}
                                />
                                <p className="text-xs text-muted-foreground mt-1">JPG, PNG or WebP (max 2MB)</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="fullName" className="text-muted-foreground">
                                    Full Name <span className="text-red-400">*</span>
                                </Label>
                                <Input
                                    id="fullName"
                                    {...register('fullName')}
                                    className="bg-card border-border text-foreground"
                                    placeholder="John Doe"
                                />
                                {errors.fullName && (
                                    <p className="text-xs text-red-400 mt-1">{errors.fullName.message}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="email" className="text-muted-foreground">
                                    Email <span className="text-red-400">*</span>
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    {...register('email')}
                                    className="bg-card border-border text-foreground"
                                    placeholder="john@example.com"
                                />
                                {errors.email && (
                                    <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="phone" className="text-muted-foreground">
                                    Phone <span className="text-red-400">*</span>
                                </Label>
                                <Input
                                    id="phone"
                                    {...register('phone')}
                                    className="bg-card border-border text-foreground"
                                    placeholder="1234567890"
                                />
                                {errors.phone && (
                                    <p className="text-xs text-red-400 mt-1">{errors.phone.message}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="dateOfBirth" className="text-muted-foreground">
                                    Date of Birth
                                </Label>
                                <Input
                                    id="dateOfBirth"
                                    type="date"
                                    {...register('dateOfBirth')}
                                    className="bg-card border-border text-foreground"
                                />
                            </div>

                            <div>
                                <Label htmlFor="gender" className="text-muted-foreground">
                                    Gender
                                </Label>
                                <Select onValueChange={(value) => setValue('gender', value as any)}>
                                    <SelectTrigger className="bg-card border-border text-foreground">
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Professional Details */}
                <Card className="bg-background/50 border-border">
                    <CardHeader>
                        <CardTitle className="text-foreground">Professional Details</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Training specializations and experience
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label className="text-muted-foreground">
                                Specializations <span className="text-red-400">*</span>
                            </Label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                                {SPECIALIZATIONS.map((spec) => (
                                    <div
                                        key={spec}
                                        className="flex items-center space-x-2 p-3 rounded-lg bg-card/50 border border-border hover:border-purple-500/30 cursor-pointer"
                                        onClick={() => toggleSpecialization(spec)}
                                    >
                                        <Checkbox
                                            checked={selectedSpecializations.includes(spec)}
                                            onCheckedChange={() => toggleSpecialization(spec)}
                                        />
                                        <label className="text-sm text-muted-foreground cursor-pointer">
                                            {spec}
                                        </label>
                                    </div>
                                ))}
                            </div>
                            {errors.specializations && (
                                <p className="text-xs text-red-400 mt-1">{errors.specializations.message}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="bio" className="text-muted-foreground">
                                Bio
                            </Label>
                            <Textarea
                                id="bio"
                                {...register('bio')}
                                className="bg-card border-border text-foreground"
                                placeholder="Tell us about your experience and training philosophy..."
                                rows={4}
                            />
                            {errors.bio && (
                                <p className="text-xs text-red-400 mt-1">{errors.bio.message}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="yearsOfExperience" className="text-muted-foreground">
                                    Years of Experience
                                </Label>
                                <Input
                                    id="yearsOfExperience"
                                    type="number"
                                    {...register('yearsOfExperience', { valueAsNumber: true })}
                                    className="bg-card border-border text-foreground"
                                    placeholder="5"
                                />
                            </div>

                            <div>
                                <Label htmlFor="hourlyRate" className="text-muted-foreground">
                                    Hourly Rate ($) <span className="text-red-400">*</span>
                                </Label>
                                <Input
                                    id="hourlyRate"
                                    type="number"
                                    step="0.01"
                                    {...register('hourlyRate', { valueAsNumber: true })}
                                    className="bg-card border-border text-foreground"
                                    placeholder="50.00"
                                />
                                {errors.hourlyRate && (
                                    <p className="text-xs text-red-400 mt-1">{errors.hourlyRate.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Certifications */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <Label className="text-muted-foreground">Certifications</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addCertification}
                                    className="bg-card border-border text-muted-foreground hover:bg-muted"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Certification
                                </Button>
                            </div>
                            <div className="space-y-3">
                                {certifications.map((cert) => (
                                    <div
                                        key={cert.id}
                                        className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 rounded-lg bg-card/50 border border-border"
                                    >
                                        <Input
                                            value={cert.name}
                                            onChange={(e) =>
                                                updateCertification(cert.id, 'name', e.target.value)
                                            }
                                            placeholder="Certification name"
                                            className="bg-card border-border text-foreground"
                                        />
                                        <Input
                                            value={cert.issuer}
                                            onChange={(e) =>
                                                updateCertification(cert.id, 'issuer', e.target.value)
                                            }
                                            placeholder="Issuing organization"
                                            className="bg-card border-border text-foreground"
                                        />
                                        <Input
                                            type="date"
                                            value={cert.issueDate}
                                            onChange={(e) =>
                                                updateCertification(cert.id, 'issueDate', e.target.value)
                                            }
                                            className="bg-card border-border text-foreground"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeCertification(cert.id)}
                                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Employment */}
                <Card className="bg-background/50 border-border">
                    <CardHeader>
                        <CardTitle className="text-foreground">Employment Details</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Work schedule and compensation
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="joinDate" className="text-muted-foreground">
                                    Join Date <span className="text-red-400">*</span>
                                </Label>
                                <Input
                                    id="joinDate"
                                    type="date"
                                    {...register('joinDate')}
                                    className="bg-card border-border text-foreground"
                                />
                            </div>

                            <div>
                                <Label htmlFor="employmentStatus" className="text-muted-foreground">
                                    Employment Status <span className="text-red-400">*</span>
                                </Label>
                                <Select
                                    onValueChange={(value) =>
                                        setValue('employmentStatus', value as any)
                                    }
                                >
                                    <SelectTrigger className="bg-card border-border text-foreground">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="full-time">Full-time</SelectItem>
                                        <SelectItem value="part-time">Part-time</SelectItem>
                                        <SelectItem value="contract">Contract</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="commissionRate" className="text-muted-foreground">
                                    Commission Rate (%)
                                </Label>
                                <Input
                                    id="commissionRate"
                                    type="number"
                                    step="0.01"
                                    {...register('commissionRate', { valueAsNumber: true })}
                                    className="bg-card border-border text-foreground"
                                    placeholder="10.00"
                                />
                            </div>

                            <div>
                                <Label htmlFor="availableHoursPerWeek" className="text-muted-foreground">
                                    Available Hours/Week
                                </Label>
                                <Input
                                    id="availableHoursPerWeek"
                                    type="number"
                                    {...register('availableHoursPerWeek', { valueAsNumber: true })}
                                    className="bg-card border-border text-foreground"
                                    placeholder="40"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Emergency Contact */}
                <Card className="bg-background/50 border-border">
                    <CardHeader>
                        <CardTitle className="text-foreground">Emergency Contact</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Emergency contact information
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="emergencyContactName" className="text-muted-foreground">
                                    Contact Name <span className="text-red-400">*</span>
                                </Label>
                                <Input
                                    id="emergencyContactName"
                                    {...register('emergencyContactName')}
                                    className="bg-card border-border text-foreground"
                                    placeholder="Jane Doe"
                                />
                                {errors.emergencyContactName && (
                                    <p className="text-xs text-red-400 mt-1">
                                        {errors.emergencyContactName.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="emergencyContactRelationship" className="text-muted-foreground">
                                    Relationship
                                </Label>
                                <Input
                                    id="emergencyContactRelationship"
                                    {...register('emergencyContactRelationship')}
                                    className="bg-card border-border text-foreground"
                                    placeholder="Spouse, Parent, etc."
                                />
                            </div>

                            <div>
                                <Label htmlFor="emergencyContactPhone" className="text-muted-foreground">
                                    Contact Phone <span className="text-red-400">*</span>
                                </Label>
                                <Input
                                    id="emergencyContactPhone"
                                    {...register('emergencyContactPhone')}
                                    className="bg-card border-border text-foreground"
                                    placeholder="1234567890"
                                />
                                {errors.emergencyContactPhone && (
                                    <p className="text-xs text-red-400 mt-1">
                                        {errors.emergencyContactPhone.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
