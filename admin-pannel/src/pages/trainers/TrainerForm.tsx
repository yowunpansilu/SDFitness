import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Save, User, Mail, Phone, Award, Calendar, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const trainerSchema = z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    hireDate: z.string().min(1, 'Hire date is required'),
    hourlyRate: z.string().min(1, 'Hourly rate is required'),
    status: z.enum(['active', 'inactive', 'on_leave']),
});

type TrainerFormData = z.infer<typeof trainerSchema>;

const specializationOptions = [
    'Strength Training', 'Cardio', 'HIIT', 'Yoga', 'Pilates', 'CrossFit',
    'Bodybuilding', 'Powerlifting', 'Weight Loss', 'Sports Performance',
];

const certificationOptions = [
    'NASM-CPT', 'ACE-CPT', 'ACSM-CPT', 'CSCS', 'CrossFit L1', 'CrossFit L2',
    'RYT-200', 'RYT-500', 'NSCA-CSCS', 'PES',
];

export function TrainerForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = Boolean(id);

    const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);
    const [selectedCertifications, setSelectedCertifications] = useState<string[]>([]);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setValue,
        watch,
    } = useForm<TrainerFormData>({
        resolver: zodResolver(trainerSchema),
        defaultValues: {
            status: 'active',
            hireDate: new Date().toISOString().split('T')[0],
        },
    });

    const toggleSpecialization = (spec: string) => {
        setSelectedSpecializations((prev) =>
            prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
        );
    };

    const toggleCertification = (cert: string) => {
        setSelectedCertifications((prev) =>
            prev.includes(cert) ? prev.filter((c) => c !== cert) : [...prev, cert]
        );
    };

    const onSubmit = async (data: TrainerFormData) => {
        try {
            console.log('Form data:', {
                ...data,
                specializations: selectedSpecializations,
                certifications: selectedCertifications,
            });
            navigate('/trainers');
        } catch (error) {
            console.error('Error saving trainer:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/trainers')}
                    className="text-gray-400 hover:text-white"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    {isEditing ? 'Edit Trainer' : 'Add New Trainer'}
                </h1>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Personal Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="firstName" className="text-gray-300">First Name *</Label>
                                <Input
                                    id="firstName"
                                    {...register('firstName')}
                                    className="bg-dark-800/50 border-dark-700 text-white"
                                />
                                {errors.firstName && (
                                    <p className="text-red-400 text-sm mt-1">{errors.firstName.message}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="lastName" className="text-gray-300">Last Name *</Label>
                                <Input
                                    id="lastName"
                                    {...register('lastName')}
                                    className="bg-dark-800/50 border-dark-700 text-white"
                                />
                                {errors.lastName && (
                                    <p className="text-red-400 text-sm mt-1">{errors.lastName.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="email" className="text-gray-300 flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    Email *
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    {...register('email')}
                                    className="bg-dark-800/50 border-dark-700 text-white"
                                />
                                {errors.email && (
                                    <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="phone" className="text-gray-300 flex items-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    Phone *
                                </Label>
                                <Input
                                    id="phone"
                                    {...register('phone')}
                                    className="bg-dark-800/50 border-dark-700 text-white"
                                />
                                {errors.phone && (
                                    <p className="text-red-400 text-sm mt-1">{errors.phone.message}</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Employment Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="hireDate" className="text-gray-300">Hire Date *</Label>
                                <Input
                                    id="hireDate"
                                    type="date"
                                    {...register('hireDate')}
                                    className="bg-dark-800/50 border-dark-700 text-white"
                                />
                                {errors.hireDate && (
                                    <p className="text-red-400 text-sm mt-1">{errors.hireDate.message}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="hourlyRate" className="text-gray-300 flex items-center gap-2">
                                    <DollarSign className="h-4 w-4" />
                                    Hourly Rate *
                                </Label>
                                <Input
                                    id="hourlyRate"
                                    type="number"
                                    step="0.01"
                                    {...register('hourlyRate')}
                                    className="bg-dark-800/50 border-dark-700 text-white"
                                    placeholder="50.00"
                                />
                                {errors.hourlyRate && (
                                    <p className="text-red-400 text-sm mt-1">{errors.hourlyRate.message}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="status" className="text-gray-300">Status *</Label>
                                <Select
                                    value={watch('status')}
                                    onValueChange={(value) => setValue('status', value as 'active' | 'inactive' | 'on_leave')}
                                >
                                    <SelectTrigger className="bg-dark-800/50 border-dark-700 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-dark-900 border-dark-700">
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="on_leave">On Leave</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Award className="h-5 w-5" />
                            Specializations & Certifications
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <Label className="text-gray-300 mb-3 block">Specializations</Label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {specializationOptions.map((spec) => (
                                    <div key={spec} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`spec-${spec}`}
                                            checked={selectedSpecializations.includes(spec)}
                                            onCheckedChange={() => toggleSpecialization(spec)}
                                        />
                                        <label
                                            htmlFor={`spec-${spec}`}
                                            className="text-sm text-gray-300 cursor-pointer"
                                        >
                                            {spec}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <Label className="text-gray-300 mb-3 block">Certifications</Label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {certificationOptions.map((cert) => (
                                    <div key={cert} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`cert-${cert}`}
                                            checked={selectedCertifications.includes(cert)}
                                            onCheckedChange={() => toggleCertification(cert)}
                                        />
                                        <label
                                            htmlFor={`cert-${cert}`}
                                            className="text-sm text-gray-300 cursor-pointer"
                                        >
                                            {cert}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/trainers')}
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
                        {isSubmitting ? 'Saving...' : isEditing ? 'Update Trainer' : 'Add Trainer'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
