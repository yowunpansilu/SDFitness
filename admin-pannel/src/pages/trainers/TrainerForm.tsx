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
            <h1 className="text-4xl font-black italic tracking-tight text-slate-900 dark:text-white transition-colors">
              {isEditMode ? 'EDIT' : 'ADD NEW'} <span className="text-indigo-600 dark:text-indigo-400">TRAINER</span>
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-navy-600 mt-1">
              {isEditMode ? 'Update Secure Profile' : 'Initialize Performance Faculty'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/trainers')}
            className="px-6 py-6 border-slate-200 dark:border-navy-800 text-slate-600 dark:text-navy-400 hover:bg-slate-50 dark:hover:bg-navy-800 font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all"
          >
            <X className="h-4 w-4 mr-2" />
            Abort
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            className="px-8 py-6 bg-slate-900 dark:bg-indigo-600 hover:bg-black dark:hover:bg-indigo-700 text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-500/20 transition-all flex items-center gap-3"
          >
            <Save className="h-4 w-4" />
            {isEditMode ? 'Update Matrix' : 'Initialize Faculty'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Personal Information */}
        <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 rounded-[2.5rem] shadow-sm overflow-hidden transition-colors">
          <CardHeader className="p-10 pb-4">
            <CardTitle className="text-sm font-black uppercase tracking-[0.25em] text-slate-400 dark:text-navy-600 italic">Identity Protocol</CardTitle>
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
                  className="cursor-pointer inline-flex items-center gap-3 px-8 py-4 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white font-black uppercase text-[10px] tracking-widest rounded-2xl hover:border-indigo-500 transition-all shadow-sm"
                >
                  <Upload className="h-4 w-4 text-indigo-500" />
                  Sync Visual ID
                </Label>
                <input
                  id="photo"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
                <p className="text-[10px] font-bold text-slate-400 dark:text-navy-600 mt-4 uppercase tracking-widest">JPG, PNG or RAW Matrix (max 2MB)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label htmlFor="fullName" className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-navy-500 ml-1">
                  Faculty Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  {...register('fullName')}
                  className="h-14 bg-slate-50 dark:bg-navy-950 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all px-6 font-bold"
                  placeholder="John Matrix"
                />
                {errors.fullName && (
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-2 ml-1">{errors.fullName.message}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-navy-500 ml-1">
                  Neural COMMS <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  className="h-14 bg-slate-50 dark:bg-navy-950 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all px-6 font-bold"
                  placeholder="comm@sdfitness.matrix"
                />
                {errors.email && (
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-2 ml-1">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-navy-500 ml-1">
                  Secure Line <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  className="h-14 bg-slate-50 dark:bg-navy-950 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all px-6 font-bold"
                  placeholder="000 000 0000"
                />
                {errors.phone && (
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-2 ml-1">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="dateOfBirth" className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-navy-500 ml-1">
                  Initialization Date
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  {...register('dateOfBirth')}
                  className="h-14 bg-slate-50 dark:bg-navy-950 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-indigo-500/20 transition-all px-6 font-bold"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="gender" className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-navy-500 ml-1">
                  Biological Marker
                </Label>
                <Select onValueChange={(value) => setValue('gender', value as any)}>
                  <SelectTrigger className="h-14 bg-slate-50 dark:bg-navy-950 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-2xl transition-all px-6 font-bold">
                    <SelectValue placeholder="Identify Gender" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 rounded-2xl font-bold">
                    <SelectItem value="male">Male Prime</SelectItem>
                    <SelectItem value="female">Female Prime</SelectItem>
                    <SelectItem value="other">Other Spec</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Details */}
        <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 rounded-[2.5rem] shadow-sm overflow-hidden transition-colors">
          <CardHeader className="p-10 pb-4">
            <CardTitle className="text-sm font-black uppercase tracking-[0.25em] text-slate-400 dark:text-navy-600 italic">Performance Faculty Matrix</CardTitle>
          </CardHeader>
          <CardContent className="p-10 pt-0 space-y-10">
            <div>
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-navy-500 ml-1 mb-4 block">
                CORE SPECIALIZATIONS <span className="text-rose-500">*</span>
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {SPECIALIZATIONS.map((spec) => (
                  <div
                    key={spec}
                    className={cn(
                      "flex items-center space-x-3 p-4 rounded-2xl border-2 transition-all cursor-pointer group",
                      selectedSpecializations.includes(spec)
                        ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 shadow-lg shadow-indigo-50 dark:shadow-navy-950/40"
                        : "border-slate-50 dark:border-navy-950 bg-slate-50 dark:bg-navy-950 hover:border-slate-200 dark:hover:border-navy-800"
                    )}
                    onClick={() => toggleSpecialization(spec)}
                  >
                    <Checkbox
                      checked={selectedSpecializations.includes(spec)}
                      onCheckedChange={() => toggleSpecialization(spec)}
                      className="border-slate-300 dark:border-navy-700 data-[state=checked]:bg-indigo-600 dark:data-[state=checked]:bg-indigo-500"
                    />
                    <label className="text-[10px] font-black uppercase tracking-tighter text-slate-700 dark:text-navy-300 cursor-pointer group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {spec}
                    </label>
                  </div>
                ))}
              </div>
              {errors.specializations && (
                <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-4 ml-1">{errors.specializations.message}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="bio" className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-navy-500 ml-1">
                Faculty Manifesto
              </Label>
              <Textarea
                id="bio"
                {...register('bio')}
                className="bg-slate-50 dark:bg-navy-950 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-[2rem] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all p-8 font-medium leading-relaxed"
                placeholder="Log performance philosophy and training protocols..."
                rows={5}
              />
              {errors.bio && (
                <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-2 ml-1">{errors.bio.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label htmlFor="yearsOfExperience" className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-navy-500 ml-1">
                  Active Years
                </Label>
                <Input
                  id="yearsOfExperience"
                  type="number"
                  {...register('yearsOfExperience', { valueAsNumber: true })}
                  className="h-14 bg-slate-50 dark:bg-navy-950 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-2xl px-6 font-bold"
                  placeholder="0"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="hourlyRate" className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-navy-500 ml-1">
                  Matrix Energy Rate ($) <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  step="0.01"
                  {...register('hourlyRate', { valueAsNumber: true })}
                  className="h-14 bg-slate-50 dark:bg-navy-950 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-2xl px-6 font-bold focus:border-emerald-500 transition-all"
                  placeholder="0.00"
                />
                {errors.hourlyRate && (
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-2 ml-1">{errors.hourlyRate.message}</p>
                )}
              </div>
            </div>

            {/* Certifications */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-navy-500 ml-1 italic italic">Validated Credentials</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCertification}
                  className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 text-slate-600 dark:text-navy-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-black uppercase text-[9px] tracking-widest rounded-xl transition-all"
                >
                  <Plus className="h-3 w-3 mr-2" />
                  Add Protocol
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
                      placeholder="Protocol Name"
                      className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white rounded-xl px-4 font-bold text-sm h-11"
                    />
                    <Input
                      value={cert.issuer}
                      onChange={(e) =>
                        updateCertification(cert.id, 'issuer', e.target.value)
                      }
                      placeholder="Issuing Organ"
                      className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white rounded-xl px-4 font-bold text-sm h-11"
                    />
                    <Input
                      type="date"
                      value={cert.issueDate}
                      onChange={(e) =>
                        updateCertification(cert.id, 'issueDate', e.target.value)
                      }
                      className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white rounded-xl px-4 font-bold text-sm h-11"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => removeCertification(cert.id)}
                      className="h-11 text-rose-500 hover:text-white hover:bg-rose-500 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Wipe
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employment */}
        <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 rounded-[2.5rem] shadow-sm overflow-hidden transition-colors">
          <CardHeader className="p-10 pb-4">
            <CardTitle className="text-sm font-black uppercase tracking-[0.25em] text-slate-400 dark:text-navy-600 italic">Operational Logistics</CardTitle>
          </CardHeader>
          <CardContent className="p-10 pt-0 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label htmlFor="joinDate" className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-navy-500 ml-1">
                  Activation Date <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="joinDate"
                  type="date"
                  {...register('joinDate')}
                  className="h-14 bg-slate-50 dark:bg-navy-950 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-2xl px-6 font-bold"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="employmentStatus" className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-navy-500 ml-1">
                  Matrix Status <span className="text-rose-500">*</span>
                </Label>
                <Select
                  onValueChange={(value) =>
                    setValue('employmentStatus', value as any)
                  }
                >
                  <SelectTrigger className="h-14 bg-slate-50 dark:bg-navy-950 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-2xl px-6 font-bold transition-all">
                    <SelectValue placeholder="Protocol Assignment" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 rounded-2xl font-bold">
                    <SelectItem value="full-time">High Capacity (Full-Time)</SelectItem>
                    <SelectItem value="part-time">Standard Capacity (Part-Time)</SelectItem>
                    <SelectItem value="contract">Mercenary Elite (Contract)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="commissionRate" className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-navy-500 ml-1">
                  Commission Matrix (%)
                </Label>
                <Input
                  id="commissionRate"
                  type="number"
                  step="0.01"
                  {...register('commissionRate', { valueAsNumber: true })}
                  className="h-14 bg-slate-50 dark:bg-navy-950 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-2xl px-6 font-bold"
                  placeholder="10.00"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="availableHoursPerWeek" className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-navy-500 ml-1">
                  Cycle Capacity (Hrs/Wk)
                </Label>
                <Input
                  id="availableHoursPerWeek"
                  type="number"
                  {...register('availableHoursPerWeek', { valueAsNumber: true })}
                  className="h-14 bg-slate-50 dark:bg-navy-950 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-2xl px-6 font-bold"
                  placeholder="40"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card className="bg-slate-900 dark:bg-indigo-600 border-none rounded-[2.5rem] shadow-2xl overflow-hidden transition-all">
          <CardHeader className="p-10 pb-4">
            <CardTitle className="text-sm font-black uppercase tracking-[0.25em] text-indigo-400 dark:text-indigo-200 italic">Emergency Override Protocol</CardTitle>
          </CardHeader>
          <CardContent className="p-10 pt-0 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <Label htmlFor="emergencyContactName" className="text-[10px] font-black uppercase tracking-widest text-indigo-400 dark:text-indigo-200 ml-1">
                  Contact Matrix <span className="text-rose-400">*</span>
                </Label>
                <Input
                  id="emergencyContactName"
                  {...register('emergencyContactName')}
                  className="h-14 bg-white/10 border-white/10 text-white rounded-2xl px-6 font-bold placeholder:text-white/40 focus:bg-white/20 transition-all border-none"
                  placeholder="Guardian Unit"
                />
                {errors.emergencyContactName && (
                  <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mt-2 ml-1">
                    {errors.emergencyContactName.message}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="emergencyContactRelationship" className="text-[10px] font-black uppercase tracking-widest text-indigo-400 dark:text-indigo-200 ml-1">
                  Bond Type
                </Label>
                <Input
                  id="emergencyContactRelationship"
                  {...register('emergencyContactRelationship')}
                  className="h-14 bg-white/10 border-white/10 text-white rounded-2xl px-6 font-bold placeholder:text-white/40 focus:bg-white/20 transition-all border-none"
                  placeholder="Kinship Class"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="emergencyContactPhone" className="text-[10px] font-black uppercase tracking-widest text-indigo-400 dark:text-indigo-200 ml-1">
                  Emergency Line <span className="text-rose-400">*</span>
                </Label>
                <Input
                  id="emergencyContactPhone"
                  {...register('emergencyContactPhone')}
                  className="h-14 bg-white/10 border-white/10 text-white rounded-2xl px-6 font-bold placeholder:text-white/40 focus:bg-white/20 transition-all border-none"
                  placeholder="SOS Comm"
                />
                {errors.emergencyContactPhone && (
                  <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mt-2 ml-1">
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
