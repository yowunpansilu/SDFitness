import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, X, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api/axios';

const SPECIALIZATIONS = [
    'HIIT', 'Yoga', 'CrossFit', 'Boxing', 'Pilates',
    'Strength Training', 'Cardio', 'Spinning', 'Zumba', 'Functional Training',
];

export function TrainerForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const isEditMode = Boolean(id);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        bio: '',
        experienceYears: '',
        specializations: [] as string[],
    });

    const updateField = (field: string, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const toggleSpecialization = (spec: string) => {
        setForm(prev => ({
            ...prev,
            specializations: prev.specializations.includes(spec)
                ? prev.specializations.filter(s => s !== spec)
                : [...prev.specializations, spec],
        }));
    };

    const handleSubmit = async () => {
        if (!form.firstName || !form.lastName || !form.email) {
            toast({ title: 'Error', description: 'Please fill in required fields (name, email)', variant: 'destructive' });
            return;
        }
        if (form.specializations.length === 0) {
            toast({ title: 'Error', description: 'Select at least one specialization', variant: 'destructive' });
            return;
        }

        setSaving(true);
        try {
            const payload = {
                firstName: form.firstName,
                lastName: form.lastName,
                email: form.email,
                phone: form.phone,
                bio: form.bio,
                experienceYears: parseInt(form.experienceYears) || 0,
                specialization: form.specializations,
            };

            if (isEditMode) {
                await api.put(`/trainers/${id}`, payload);
            } else {
                await api.post('/trainers', payload);
            }

            toast({
                title: isEditMode ? 'Trainer Updated' : 'Trainer Created',
                description: `${form.firstName} ${form.lastName} has been ${isEditMode ? 'updated' : 'added'} successfully`,
            });
            navigate('/trainers');
        } catch (err: any) {
            toast({
                title: 'Error',
                description: err.response?.data?.error || 'Failed to save trainer',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/trainers')}
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-800"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {isEditMode ? 'Edit Trainer' : 'Add New Trainer'}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            {isEditMode ? 'Update trainer information' : 'Create a new trainer profile'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => navigate('/trainers')}
                        className="bg-white dark:bg-dark-800 border-gray-200 dark:border-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700"
                    >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                        {saving ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4 mr-2" />
                        )}
                        {isEditMode ? 'Update Trainer' : 'Create Trainer'}
                    </Button>
                </div>
            </div>

            {/* Personal Information */}
            <Card className="bg-white dark:bg-dark-900/50 border-gray-200 dark:border-dark-800">
                <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Personal Information</CardTitle>
                    <CardDescription className="text-gray-500 dark:text-gray-400">
                        Basic personal details of the trainer
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="firstName" className="text-gray-700 dark:text-gray-300">
                                First Name <span className="text-red-500 dark:text-red-400">*</span>
                            </Label>
                            <Input
                                id="firstName"
                                value={form.firstName}
                                onChange={(e) => updateField('firstName', e.target.value)}
                                className="bg-white dark:bg-dark-800 border-gray-200 dark:border-dark-700 text-gray-900 dark:text-white"
                                placeholder="John"
                            />
                        </div>
                        <div>
                            <Label htmlFor="lastName" className="text-gray-700 dark:text-gray-300">
                                Last Name <span className="text-red-500 dark:text-red-400">*</span>
                            </Label>
                            <Input
                                id="lastName"
                                value={form.lastName}
                                onChange={(e) => updateField('lastName', e.target.value)}
                                className="bg-white dark:bg-dark-800 border-gray-200 dark:border-dark-700 text-gray-900 dark:text-white"
                                placeholder="Doe"
                            />
                        </div>
                        <div>
                            <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                                Email <span className="text-red-500 dark:text-red-400">*</span>
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={form.email}
                                onChange={(e) => updateField('email', e.target.value)}
                                className="bg-white dark:bg-dark-800 border-gray-200 dark:border-dark-700 text-gray-900 dark:text-white"
                                placeholder="john@sdfitness.com"
                            />
                        </div>
                        <div>
                            <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300">
                                Phone
                            </Label>
                            <Input
                                id="phone"
                                value={form.phone}
                                onChange={(e) => updateField('phone', e.target.value)}
                                className="bg-white dark:bg-dark-800 border-gray-200 dark:border-dark-700 text-gray-900 dark:text-white"
                                placeholder="0771234567"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Professional Details */}
            <Card className="bg-white dark:bg-dark-900/50 border-gray-200 dark:border-dark-800">
                <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Professional Details</CardTitle>
                    <CardDescription className="text-gray-500 dark:text-gray-400">
                        Training specializations and experience
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label className="text-gray-700 dark:text-gray-300">
                            Specializations <span className="text-red-500 dark:text-red-400">*</span>
                        </Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                            {SPECIALIZATIONS.map((spec) => (
                                <div
                                    key={spec}
                                    className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-all ${form.specializations.includes(spec)
                                            ? 'bg-purple-500/10 dark:bg-purple-500/20 border-purple-200 dark:border-purple-500/50 text-purple-700 dark:text-purple-300'
                                            : 'bg-white dark:bg-dark-800/50 border-gray-200 dark:border-dark-700 text-gray-700 dark:text-gray-300 hover:border-purple-500/30'
                                        }`}
                                    onClick={() => toggleSpecialization(spec)}
                                >
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${form.specializations.includes(spec)
                                            ? 'bg-purple-500 border-purple-500'
                                            : 'border-gray-300 dark:border-gray-600'
                                        }`}>
                                        {form.specializations.includes(spec) && (
                                            <span className="text-white text-xs">✓</span>
                                        )}
                                    </div>
                                    <label className="text-sm cursor-pointer">
                                        {spec}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="bio" className="text-gray-700 dark:text-gray-300">
                            Bio
                        </Label>
                        <Textarea
                            id="bio"
                            value={form.bio}
                            onChange={(e) => updateField('bio', e.target.value)}
                            className="bg-white dark:bg-dark-800 border-gray-200 dark:border-dark-700 text-gray-900 dark:text-white"
                            placeholder="Tell us about your experience and training philosophy..."
                            rows={4}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="experienceYears" className="text-gray-700 dark:text-gray-300">
                                Years of Experience
                            </Label>
                            <Input
                                id="experienceYears"
                                type="number"
                                value={form.experienceYears}
                                onChange={(e) => updateField('experienceYears', e.target.value)}
                                className="bg-white dark:bg-dark-800 border-gray-200 dark:border-dark-700 text-gray-900 dark:text-white"
                                placeholder="5"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
