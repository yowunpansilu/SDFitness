import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
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
import { ArrowLeft, Save, X, Plus, Trash2, Upload, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api/axios';

// Form validation schema
const trainerSchema = z.object({
  // User/Personal Information
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  email: z.string().trim().email('Invalid email address'),
  phone: z.string()
    .trim()
    .min(10, 'Secure line must be at least 10 digits')
    .refine(val => /^[0-9+ -]{10,}$/.test(val), 'Invalid phone format'),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  photo: z.string().optional(),

  // Professional Details
  bio: z.string().trim().min(10, 'Bio must be at least 10 characters'),
  experienceYears: z.number().min(0, 'Experience cannot be negative'),
  hourlyRate: z.number().positive('Hourly rate must be positive'),

  // Employment
  joinDate: z.string().min(1, 'Join date is required'),
  employmentStatus: z.enum(['full-time', 'part-time', 'contract']),
  commissionRate: z.number().min(0).max(100).optional(),
  availableHoursPerWeek: z.number().min(0).max(168).optional(),

  // Emergency Contact
  emergencyContactName: z.string().trim().min(1, 'Emergency contact name is required'),
  emergencyContactRelationship: z.string().trim().optional(),
  emergencyContactPhone: z.string()
    .trim()
    .min(10, 'Phone must be at least 10 digits')
    .refine(val => /^[0-9+ -]{10,}$/.test(val), 'Invalid phone format'),
});

type TrainerFormData = z.infer<typeof trainerSchema>;

interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
}


export function TrainerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditMode = Boolean(id);

  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<TrainerFormData>({
    resolver: zodResolver(trainerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      hourlyRate: 0,
      joinDate: new Date().toISOString().split('T')[0],
      employmentStatus: 'full-time',
      emergencyContactName: '',
      emergencyContactPhone: '',
      experienceYears: 0,
      bio: '',
    },
  });

  useEffect(() => {
    if (isEditMode && id) {
      const fetchTrainer = async () => {
        try {
          const response = await api.get(`/trainers/${id}`);
          const t = response.data;
          reset({
            firstName: t.userId?.firstName || '',
            lastName: t.userId?.lastName || '',
            email: t.userId?.email || '',
            phone: t.userId?.phone || '',
            bio: t.bio || '',
            experienceYears: t.experienceYears || 0,
            hourlyRate: t.hourlyRate || 0,
            joinDate: (t.joinDate || t.createdAt)?.split('T')[0],
            employmentStatus: t.employmentStatus || 'full-time',
            commissionRate: t.commissionRate || 0,
            availableHoursPerWeek: t.availableHoursPerWeek || 40,
            emergencyContactName: t.emergencyContact?.name || '',
            emergencyContactRelationship: t.emergencyContact?.relationship || '',
            emergencyContactPhone: t.emergencyContact?.phone || '',
          });
          if (t.certifications) {
            setCertifications(t.certifications.map((c: { name: string, issuer: string, issueDate?: string }, index: number) => ({
              id: index.toString(),
              name: c.name,
              issuer: c.issuer,
              issueDate: c.issueDate?.split('T')[0] || '',
            })));
          }
          if (t.userId?.avatar) {
            setPhotoPreview(t.userId.avatar);
          }
        } catch {
          toast({
            title: 'Error',
            description: 'Could not retrieve trainer profile.',
            variant: 'destructive',
          });
        } finally {
          setIsLoading(false);
        }
      };
      fetchTrainer();
    }
  }, [id, isEditMode, reset, toast]);

  const onSubmit = async (data: TrainerFormData) => {
    setIsSyncing(true);
    try {
      const payload = {
        ...data,
        certifications: certifications.map(({ name, issuer, issueDate }) => ({ name, issuer, issueDate })),
        emergencyContact: {
          name: data.emergencyContactName,
          relationship: data.emergencyContactRelationship,
          phone: data.emergencyContactPhone,
        }
      };

      if (isEditMode) {
        await api.put(`/trainers/${id}`, payload);
      } else {
        await api.post('/trainers', payload);
      }

      toast({
        title: isEditMode ? 'Profile Updated' : 'Trainer Added',
        description: `${data.firstName} ${data.lastName} successfully saved.`,
      });
      navigate('/trainers');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.error || 'Failed to save trainer data.',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPhotoPreview(base64);
        setValue('photo', base64);
      };
      reader.readAsDataURL(file);
    }
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
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/trainers')}
            className="h-12 w-12 rounded-2xl text-slate-400 dark:text-navy-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-navy-800/50 transition-all"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white transition-colors">
                {isEditMode ? 'Edit' : 'Add'} <span className="text-indigo-600 dark:text-indigo-400">Trainer</span>
              </h1>
              <p className="text-sm font-medium text-slate-400 dark:text-navy-600 mt-1">
                {isEditMode ? 'Update trainer information' : 'Register a new trainer'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/trainers')}
            className="px-6 py-6 border-slate-200 dark:border-navy-800 text-slate-600 dark:text-navy-400 hover:bg-slate-50 dark:hover:bg-navy-800 text-sm font-medium rounded-2xl transition-all"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={isSyncing}
            className="px-8 py-6 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-2xl shadow-xl shadow-indigo-500/20 transition-all flex items-center gap-3 disabled:opacity-50"
          >
            {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isEditMode ? 'Save Changes' : 'Save Trainer'}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-40 space-y-4">
          <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
          <p className="text-sm font-medium text-slate-400 dark:text-navy-600">Loading trainer data...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Personal Information */}
          <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 rounded-3xl shadow-sm overflow-hidden transition-colors">
            <CardHeader className="p-10 pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-tight text-slate-400 dark:text-navy-600">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="p-10 pt-0 space-y-8">
              {/* Photo Upload */}
              <div className="flex flex-col md:flex-row items-center gap-10 p-8 rounded-3xl bg-slate-50 dark:bg-navy-950/50 border border-slate-100 dark:border-navy-800 transition-colors">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-[2rem] bg-white dark:bg-navy-950 border-4 border-white dark:border-navy-900 shadow-2xl overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Upload className="h-10 w-10 text-slate-300 dark:text-navy-800" />
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-2 rounded-xl shadow-lg">
                    <Plus className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <Label
                    htmlFor="photo"
                    className="cursor-pointer inline-flex items-center gap-3 px-8 py-4 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white text-sm font-medium rounded-2xl hover:border-indigo-500 transition-all shadow-sm"
                  >
                    <Upload className="h-4 w-4 text-indigo-500" />
                    Upload Photo
                  </Label>
                  <input
                    id="photo"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                  <p className="text-sm font-normal text-slate-500 dark:text-slate-400 mt-2 text-slate-400 dark:text-navy-600 mt-4 uppercase tracking-widest">JPG, PNG or GIF (max 2MB)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="firstName" className="text-base font-semibold text-slate-700 dark:text-navy-400 ml-1">
                    First Name <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    {...register('firstName')}
                    className={cn(
                      "h-12 bg-slate-50 dark:bg-navy-950 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-2xl transition-all px-4 text-sm font-medium focus:ring-2",
                      errors.firstName ? "border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.1)] ring-rose-500/10" : "focus:ring-indigo-500/20 focus:border-indigo-500"
                    )}
                    placeholder="John"
                  />
                  {errors.firstName && (
                    <p className="text-xs font-medium text-rose-500 mt-1 ml-1">{errors.firstName.message}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="lastName" className="text-base font-semibold text-slate-700 dark:text-navy-400 ml-1">
                    Last Name <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    {...register('lastName')}
                    className={cn(
                      "h-12 bg-slate-50 dark:bg-navy-950 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-2xl transition-all px-4 text-sm font-medium focus:ring-2",
                      errors.lastName ? "border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.1)] ring-rose-500/10" : "focus:ring-indigo-500/20 focus:border-indigo-500"
                    )}
                    placeholder="Doe"
                  />
                  {errors.lastName && (
                    <p className="text-xs font-medium text-rose-500 mt-1 ml-1">{errors.lastName.message}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="email" className="text-base font-semibold text-slate-700 dark:text-navy-400 ml-1">
                    Email Address <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    readOnly={isEditMode}
                    {...register('email')}
                    className={cn(
                      "h-12 bg-slate-50 dark:bg-navy-950 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-2xl transition-all px-4 text-sm font-medium focus:ring-2",
                      errors.email ? "border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.1)] ring-rose-500/10" : "focus:ring-indigo-500/20 focus:border-indigo-500",
                      isEditMode && "opacity-50 cursor-not-allowed"
                    )}
                    placeholder="trainer@sdfitness.com"
                  />
                  {errors.email && (
                    <p className="text-xs font-medium text-rose-500 mt-1 ml-1">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="phone" className="text-base font-semibold text-slate-700 dark:text-navy-400 ml-1">
                    Phone Number <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    {...register('phone')}
                    className={cn(
                      "h-12 bg-slate-50 dark:bg-navy-950 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-2xl transition-all px-4 text-sm font-medium focus:ring-2",
                      errors.phone ? "border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.1)] ring-rose-500/10" : "focus:ring-indigo-500/20 focus:border-indigo-500"
                    )}
                    placeholder="000 000 0000"
                  />
                  {errors.phone && (
                    <p className="text-xs font-medium text-rose-500 mt-1 ml-1">{errors.phone.message}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="dateOfBirth" className="text-sm font-medium text-slate-500 dark:text-navy-500 ml-1">
                    Date of Birth
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    {...register('dateOfBirth')}
                    className="h-12 bg-slate-50 dark:bg-navy-950 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-indigo-500/20 transition-all px-4 text-sm font-medium"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="gender" className="text-sm font-medium text-slate-500 dark:text-navy-500 ml-1">
                    Gender
                  </Label>
                  <Select onValueChange={(value) => setValue('gender', value as "male" | "female" | "other")}>
                    <SelectTrigger className="h-12 bg-slate-50 dark:bg-navy-950 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-2xl transition-all px-4 text-sm font-medium">
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 rounded-2xl font-bold">
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
          <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 rounded-3xl shadow-sm overflow-hidden transition-colors">
            <CardHeader className="p-10 pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-tight text-slate-400 dark:text-navy-600">Professional Details</CardTitle>
            </CardHeader>
            <CardContent className="p-10 pt-0 space-y-10">
              <div className="space-y-3">
                <Label htmlFor="bio" className="text-base font-semibold text-slate-700 dark:text-navy-400 ml-1">
                  Professional Bio
                </Label>
                <Textarea
                  id="bio"
                  {...register('bio')}
                  className={cn(
                    "bg-slate-50 dark:bg-navy-950 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-[2rem] transition-all p-8 font-medium leading-relaxed focus:ring-2",
                    errors.bio ? "border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.1)] ring-rose-500/10" : "focus:ring-indigo-500/20 focus:border-indigo-500"
                  )}
                  placeholder="Tell us about your professional background and training style..."
                  rows={5}
                />
                {errors.bio && (
                  <p className="text-xs font-medium text-rose-500 mt-1 ml-1">{errors.bio.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="experienceYears" className="text-sm font-medium text-slate-500 dark:text-navy-500 ml-1">
                    Years of Experience
                  </Label>
                  <Input
                    id="experienceYears"
                    type="number"
                    {...register('experienceYears', { valueAsNumber: true })}
                    className={cn(
                      "h-12 bg-slate-50 dark:bg-navy-950 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-2xl px-4 text-sm font-medium focus:ring-2",
                      errors.experienceYears ? "border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.1)]" : "focus:ring-indigo-500/20"
                    )}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="hourlyRate" className="text-base font-semibold text-slate-700 dark:text-navy-400 ml-1">
                    Hourly Rate (LKR) <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    step="0.01"
                    {...register('hourlyRate', { valueAsNumber: true })}
                    className={cn(
                      "h-12 bg-slate-50 dark:bg-navy-950 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-2xl px-4 text-sm font-medium transition-all focus:ring-2",
                      errors.hourlyRate ? "border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.1)] ring-rose-500/10" : "focus:border-emerald-500 focus:ring-emerald-500/10"
                    )}
                    placeholder="0.00"
                  />
                  {errors.hourlyRate && (
                    <p className="text-xs font-medium text-rose-500 mt-1 ml-1">{errors.hourlyRate.message}</p>
                  )}
                </div>
              </div>

              {/* Certifications */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <Label className="text-sm font-medium text-slate-500 dark:text-navy-500 ml-1">Certifications</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCertification}
                    className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 text-slate-600 dark:text-navy-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-semibold rounded-xl transition-all"
                  >
                    <Plus className="h-3 w-3 mr-2" />
                    Add Certification
                  </Button>
                </div>
                <div className="space-y-4">
                  {certifications.map((cert) => (
                    <div
                      key={cert.id}
                      className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 rounded-3xl bg-slate-50 dark:bg-navy-950/50 border border-slate-100 dark:border-navy-800 transition-all animate-in slide-in-from-left-2"
                    >
                      <Input
                        value={cert.name}
                        onChange={(e) =>
                          updateCertification(cert.id, 'name', e.target.value)
                        }
                        placeholder="Certification Name"
                        className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white rounded-xl px-4 text-sm font-medium h-11"
                      />
                      <Input
                        value={cert.issuer}
                        onChange={(e) =>
                          updateCertification(cert.id, 'issuer', e.target.value)
                        }
                        placeholder="Issuing Organization"
                        className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white rounded-xl px-4 text-sm font-medium h-11"
                      />
                      <Input
                        type="date"
                        value={cert.issueDate}
                        onChange={(e) =>
                          updateCertification(cert.id, 'issueDate', e.target.value)
                        }
                        className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white rounded-xl px-4 text-sm font-medium h-11"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => removeCertification(cert.id)}
                        className="h-11 text-rose-500 hover:text-white hover:bg-rose-500 rounded-xl transition-all text-sm font-medium"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Employment */}
          <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 rounded-3xl shadow-sm overflow-hidden transition-colors">
            <CardHeader className="p-10 pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-tight text-slate-400 dark:text-navy-600">Employment Details</CardTitle>
            </CardHeader>
            <CardContent className="p-10 pt-0 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="joinDate" className="text-sm font-medium text-slate-500 dark:text-navy-500 ml-1">
                    Join Date <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="joinDate"
                    type="date"
                    {...register('joinDate')}
                    className="h-12 bg-slate-50 dark:bg-navy-950 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-2xl px-4 text-sm font-medium"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="employmentStatus" className="text-sm font-medium text-slate-500 dark:text-navy-500 ml-1">
                    Employment Status <span className="text-rose-500">*</span>
                  </Label>
                  <Select
                    value={watch('employmentStatus')}
                    onValueChange={(value) =>
                      setValue('employmentStatus', value as "full-time" | "part-time" | "contract")
                    }
                  >
                    <SelectTrigger className={cn(
                      "h-12 bg-slate-50 dark:bg-navy-950 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-2xl px-4 text-sm font-medium transition-all",
                      errors.employmentStatus && "border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.1)]"
                    )}>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 rounded-2xl font-bold">
                      <SelectItem value="full-time">Full-Time</SelectItem>
                      <SelectItem value="part-time">Part-Time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.employmentStatus && (
                    <p className="text-xs font-medium text-rose-500 mt-1 ml-1">{errors.employmentStatus.message}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="commissionRate" className="text-sm font-medium text-slate-500 dark:text-navy-500 ml-1">
                    Commission Rate (%)
                  </Label>
                  <Input
                    id="commissionRate"
                    type="number"
                    step="0.01"
                    {...register('commissionRate', { valueAsNumber: true })}
                    className="h-12 bg-slate-50 dark:bg-navy-950 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-2xl px-4 text-sm font-medium"
                    placeholder="10.00"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="availableHoursPerWeek" className="text-sm font-medium text-slate-500 dark:text-navy-500 ml-1">
                    Available Hours (Weekly)
                  </Label>
                  <Input
                    id="availableHoursPerWeek"
                    type="number"
                    {...register('availableHoursPerWeek', { valueAsNumber: true })}
                    className="h-12 bg-slate-50 dark:bg-navy-950 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-2xl px-4 text-sm font-medium"
                    placeholder="40"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card className="bg-slate-900 dark:bg-indigo-600 border-none rounded-3xl shadow-2xl overflow-hidden transition-all">
            <CardHeader className="p-10 pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-tight text-indigo-400 dark:text-indigo-200">Emergency Contact</CardTitle>
            </CardHeader>
            <CardContent className="p-10 pt-0 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="emergencyContactName" className="text-sm font-medium text-indigo-400 dark:text-indigo-200 ml-1">
                    Contact Name <span className="text-rose-400">*</span>
                  </Label>
                  <Input
                    id="emergencyContactName"
                    {...register('emergencyContactName')}
                    className={cn(
                      "h-12 bg-white/10 border-white/10 text-white rounded-2xl px-4 text-sm font-medium placeholder:text-white/40 focus:bg-white/20 transition-all border-none",
                      errors.emergencyContactName && "bg-rose-500/20 ring-1 ring-rose-500/50"
                    )}
                    placeholder="Jane Doe"
                  />
                  {errors.emergencyContactName && (
                    <p className="text-xs font-medium text-rose-500 mt-1 ml-1">
                      {errors.emergencyContactName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="emergencyContactRelationship" className="text-sm font-medium text-indigo-400 dark:text-indigo-200 ml-1">
                    Relationship
                  </Label>
                  <Input
                    id="emergencyContactRelationship"
                    {...register('emergencyContactRelationship')}
                    className="h-12 bg-white/10 border-white/10 text-white rounded-2xl px-4 text-sm font-medium placeholder:text-white/40 focus:bg-white/20 transition-all border-none"
                    placeholder="Spouse"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="emergencyContactPhone" className="text-sm font-medium text-indigo-400 dark:text-indigo-200 ml-1">
                    Phone Number <span className="text-rose-400">*</span>
                  </Label>
                  <Input
                    id="emergencyContactPhone"
                    {...register('emergencyContactPhone')}
                    className={cn(
                      "h-12 bg-white/10 border-white/10 text-white rounded-2xl px-4 text-sm font-medium placeholder:text-white/40 focus:bg-white/20 transition-all border-none",
                      errors.emergencyContactPhone && "bg-rose-500/20 ring-1 ring-rose-500/50"
                    )}
                    placeholder="000 000 0000"
                  />
                  {errors.emergencyContactPhone && (
                    <p className="text-xs font-medium text-rose-500 mt-1 ml-1">
                      {errors.emergencyContactPhone.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      )}
    </div>
  );
}
