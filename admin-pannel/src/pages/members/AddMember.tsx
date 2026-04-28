import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Upload, Check, Loader2, UserPlus, Info, PhoneCall, ShieldCheck, HeartPulse } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { memberService } from '@/services/memberService';

// Form schema updated to match backend expectations
const memberFormSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
  membershipPlan: z.string().min(1, 'Please select a membership plan'),
  height: z.string().optional(),
  weight: z.string().optional(),
  targetWeight: z.string().optional(),
  fitnessGoals: z.string().optional(),
  medicalConditions: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactRelationship: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
});

type MemberFormValues = z.infer<typeof memberFormSchema>;

const steps = [
  { id: 1, name: 'Personal', icon: Info },
  { id: 2, name: 'Communication', icon: PhoneCall },
  { id: 3, name: 'Membership', icon: ShieldCheck },
  { id: 4, name: 'Health Lab', icon: HeartPulse },
];

export function AddMember() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: 'prefer_not_to_say',
      membershipPlan: 'standard',
      height: '',
      weight: '',
      targetWeight: '',
      fitnessGoals: '',
      medicalConditions: '',
      emergencyContactName: '',
      emergencyContactRelationship: '',
      emergencyContactPhone: '',
    },
  });

  const onSubmit = async (data: MemberFormValues) => {
    try {
      setIsSubmitting(true);
      const response = await memberService.createMember(data);
      if (response.success) {
        toast({
          title: 'Member Added',
          description: `${data.firstName} ${data.lastName} has been enrolled successfully.`,
        });
        navigate('/members');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast({
        title: 'Enrollment Failed',
        description: error.response?.data?.message || 'Failed to create new member.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const nextStep = (e: React.MouseEvent) => {
    e.preventDefault();
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/members')}
          className="h-12 w-12 rounded-2xl border-slate-200 dark:border-navy-800 text-slate-400 dark:text-navy-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-100 dark:hover:border-navy-700 hover:bg-indigo-50 dark:hover:bg-navy-800 transition-all shadow-sm"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Enroll <span className="text-indigo-600 dark:text-indigo-400">Member</span>
          </h1>
          <p className="text-slate-500 dark:text-navy-500 font-medium mt-1 uppercase text-xs tracking-widest transition-colors">
            New Membership Onboarding Process
          </p>
        </div>
      </div>

      {/* Steps Progress */}
      <div className="bg-white dark:bg-navy-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-navy-800 shadow-sm transition-colors">
        <div className="flex justify-between items-center max-w-3xl mx-auto px-4 relative">
          {/* Background line */}
          <div className="absolute top-[21px] left-0 right-0 h-0.5 bg-slate-100 dark:bg-navy-800 -z-0 mx-10 transition-colors" />

          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center">
                <div
                  className={cn(
                    'w-11 h-11 rounded-2xl flex items-center justify-center border-2 transition-all duration-500',
                    isCompleted
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-navy-950/20'
                      : isActive
                        ? 'bg-white dark:bg-navy-900 border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-xl shadow-indigo-50 dark:shadow-navy-950/40 scale-110'
                        : 'bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-700 text-slate-300 dark:text-navy-700'
                  )}
                >
                  {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <div className="mt-3 text-center">
                  <p className={cn(
                    'text-xs font-bold uppercase tracking-widest transition-colors',
                    isActive || isCompleted ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-navy-600'
                  )}>
                    {step.name}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Card */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 shadow-sm rounded-[3rem] overflow-hidden transition-colors">
            <CardHeader className="bg-slate-50/50 dark:bg-navy-950/50 p-10 pb-6 border-b border-slate-100 dark:border-navy-800 transition-colors">
              <div className="flex items-center gap-4 mb-2">
                <div className="h-10 w-10 rounded-xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 transition-all">
                  {steps[currentStep - 1].id}
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight transition-colors">
                    {steps[currentStep - 1].name} <span className="text-slate-400 dark:text-navy-600 not-italic">Information</span>
                  </CardTitle>
                  <CardDescription className="text-slate-500 dark:text-navy-500 font-bold text-xs uppercase tracking-widest transition-colors">
                    Step {currentStep} of {steps.length}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-10">
              {/* Step 1: Personal Info */}
              {currentStep === 1 && (
                <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
                  <div className="flex flex-col items-center gap-6">
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-[2rem] bg-slate-50 dark:bg-navy-950 border-4 border-white dark:border-navy-800 shadow-inner flex items-center justify-center overflow-hidden transition-all group-hover:shadow-indigo-50 dark:group-hover:shadow-indigo-500/10">
                        {profilePhoto ? (
                          <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <Upload className="h-8 w-8 text-slate-300 dark:text-navy-800 group-hover:text-indigo-400 transition-colors" />
                        )}
                      </div>
                      <label htmlFor="photo-upload" className="absolute -bottom-2 -right-2 cursor-pointer">
                        <input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                        <div className="h-10 w-10 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shadow-lg hover:bg-indigo-700 dark:hover:bg-indigo-400 transition-all hover:scale-105">
                          <Upload className="h-4 w-4" />
                        </div>
                      </label>
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-navy-600 transition-colors">Member Profile Photo</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 dark:text-navy-300 font-bold uppercase text-xs tracking-[0.15em] transition-colors">First Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="John" className="h-12 rounded-xl border-slate-200 dark:border-navy-800 bg-slate-50/30 dark:bg-navy-950/50 focus:bg-white dark:focus:bg-navy-950 dark:text-white transition-all text-sm font-bold placeholder:text-slate-400 dark:placeholder:text-navy-700" />
                          </FormControl>
                          <FormMessage className="text-xs font-bold" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 dark:text-navy-300 font-bold uppercase text-xs tracking-[0.15em] transition-colors">Last Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Doe" className="h-12 rounded-xl border-slate-200 dark:border-navy-800 bg-slate-50/30 dark:bg-navy-950/50 focus:bg-white dark:focus:bg-navy-950 dark:text-white transition-all text-sm font-bold placeholder:text-slate-400 dark:placeholder:text-navy-700" />
                          </FormControl>
                          <FormMessage className="text-xs font-bold" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 dark:text-navy-300 font-bold uppercase text-xs tracking-[0.15em] transition-colors">Date of Birth</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" className="h-12 rounded-xl border-slate-200 dark:border-navy-800 bg-slate-50/30 dark:bg-navy-950/50 focus:bg-white dark:focus:bg-navy-950 dark:text-white transition-all text-sm font-bold" />
                          </FormControl>
                          <FormMessage className="text-xs font-bold" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 dark:text-navy-300 font-bold uppercase text-xs tracking-[0.15em] transition-colors">Gender</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 rounded-xl border-slate-200 dark:border-navy-800 bg-slate-50/30 dark:bg-navy-950/50 focus:bg-white dark:focus:bg-navy-950 dark:text-white transition-all text-sm font-bold">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl border-slate-100 dark:border-navy-800 bg-white dark:bg-navy-950 shadow-xl dark:text-white">
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                              <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs font-bold" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Communication */}
              {currentStep === 2 && (
                <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 dark:text-navy-300 font-bold uppercase text-xs tracking-[0.15em] transition-colors">Email Address</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" placeholder="john.doe@matrix.com" className="h-12 rounded-xl border-slate-200 dark:border-navy-800 bg-slate-50/30 dark:bg-navy-950/50 focus:bg-white dark:focus:bg-navy-950 dark:text-white transition-all text-sm font-bold placeholder:text-slate-400 dark:placeholder:text-navy-700" />
                          </FormControl>
                          <FormMessage className="text-xs font-bold" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 dark:text-navy-300 font-bold uppercase text-xs tracking-[0.15em] transition-colors">Phone Number</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="+1 000 000 0000" className="h-12 rounded-xl border-slate-200 dark:border-navy-800 bg-slate-50/30 dark:bg-navy-950/50 focus:bg-white dark:focus:bg-navy-950 dark:text-white transition-all text-sm font-bold placeholder:text-slate-400 dark:placeholder:text-navy-700" />
                          </FormControl>
                          <FormMessage className="text-xs font-bold" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="border-t border-slate-100 dark:border-navy-800 pt-10 transition-colors">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 transition-colors">Emergency Contact</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <FormField
                        control={form.control}
                        name="emergencyContactName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-700 dark:text-navy-300 font-bold uppercase text-xs tracking-[0.15em] transition-colors">Contact Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Full legal name" className="h-12 rounded-xl border-slate-200 dark:border-navy-800 bg-slate-50/30 dark:bg-navy-950/50 dark:text-white font-bold placeholder:text-slate-400 dark:placeholder:text-navy-700" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="emergencyContactPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-700 dark:text-navy-300 font-bold uppercase text-xs tracking-[0.15em] transition-colors">Contact Phone</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Emergency number" className="h-12 rounded-xl border-slate-200 dark:border-navy-800 bg-slate-50/30 dark:bg-navy-950/50 dark:text-white font-bold placeholder:text-slate-400 dark:placeholder:text-navy-700" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="emergencyContactRelationship"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-700 dark:text-navy-300 font-bold uppercase text-xs tracking-[0.15em] transition-colors">Relationship</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Relationship status" className="h-12 rounded-xl border-slate-200 dark:border-navy-800 bg-slate-50/30 dark:bg-navy-950/50 dark:text-white font-bold placeholder:text-slate-400 dark:placeholder:text-navy-700" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Membership */}
              {currentStep === 3 && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                  <FormField
                    control={form.control}
                    name="membershipPlan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 dark:text-navy-300 font-bold uppercase text-xs tracking-[0.15em] transition-colors">Select Membership Plan</FormLabel>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {[
                            { id: 'standard', name: 'Standard', price: '49', features: ['Gym Access', 'Lockers'] },
                            { id: 'premium', name: 'Premium', price: '99', features: ['Pool Access', 'Classes', 'Sauna'] },
                            { id: 'vip', name: 'VIP System', price: '149', features: ['Personal Trainer', 'Diet Plan', 'All-Access'] }
                          ].map((plan) => (
                            <div
                              key={plan.id}
                              onClick={() => field.onChange(plan.id)}
                              className={cn(
                                "p-6 rounded-3xl border-2 transition-all cursor-pointer group",
                                field.value === plan.id
                                  ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50/20 dark:bg-indigo-500/10 shadow-lg shadow-indigo-50 dark:shadow-navy-950/40"
                                  : "border-slate-100 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-950 focus:border-slate-200 dark:hover:border-navy-700 transition-colors"
                              )}
                            >
                              <div className="flex justify-between items-start mb-4">
                                <CardTitle className="text-lg font-bold uppercase tracking-tight dark:text-white transition-colors">{plan.name}</CardTitle>
                                {field.value === plan.id && <Check className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />}
                              </div>
                              <p className="text-2xl font-bold text-slate-900 dark:text-white mb-6 transition-colors">LKR {plan.price}<span className="text-xs not-text-slate-400 dark:text-navy-500 font-bold tracking-widest ml-1">/MO</span></p>
                              <ul className="space-y-2">
                                {plan.features.map(f => (
                                  <li key={f} className="text-xs font-bold text-slate-500 dark:text-navy-400 flex items-center gap-2 transition-colors">
                                    <div className="h-1 w-1 rounded-full bg-slate-300 dark:bg-navy-800 transition-colors" /> {f}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 4: Health Info */}
              {currentStep === 4 && (
                <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FormField
                      control={form.control}
                      name="height"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 dark:text-navy-300 font-bold uppercase text-xs tracking-[0.15em] transition-colors">Height (cm)</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" placeholder="175" className="h-12 rounded-xl border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-950/50 dark:text-white font-bold placeholder:text-slate-400 dark:placeholder:text-navy-700" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 dark:text-navy-300 font-bold uppercase text-xs tracking-[0.15em] transition-colors">Weight (kg)</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" placeholder="75" className="h-12 rounded-xl border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-950/50 dark:text-white font-bold placeholder:text-slate-400 dark:placeholder:text-navy-700" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="targetWeight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 dark:text-navy-300 font-bold uppercase text-xs tracking-[0.15em] transition-colors">Target (kg)</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" placeholder="70" className="h-12 rounded-xl border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-950/50 dark:text-white font-bold placeholder:text-slate-400 dark:placeholder:text-navy-700" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="fitnessGoals"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 dark:text-navy-300 font-bold uppercase text-xs tracking-[0.15em] transition-colors">Fitness Goals</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="E.g., Weight loss, Muscle gain, Endurance" className="h-12 rounded-xl border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-950/50 dark:text-white font-bold placeholder:text-slate-400 dark:placeholder:text-navy-700" />
                        </FormControl>
                        <FormDescription className="text-xs font-bold text-slate-400 dark:text-navy-600 transition-colors">Comma separated objectives</FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="medicalConditions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 dark:text-navy-300 font-bold uppercase text-xs tracking-[0.15em] transition-colors">Medical Conditions</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="E.g., Asthma, Leg injury, Hypertension" className="h-12 rounded-xl border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-950/50 dark:text-white font-bold placeholder:text-slate-400 dark:placeholder:text-navy-700" />
                        </FormControl>
                        <FormDescription className="text-xs font-bold uppercase tracking-widest text-rose-400 dark:text-rose-500 transition-colors">Privacy ensured via encryption</FormDescription>
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </CardContent>

            {/* Navigation Footer */}
            <div className="bg-slate-50/80 dark:bg-navy-950/80 backdrop-blur-sm p-10 flex justify-between items-center border-t border-slate-100 dark:border-navy-800 transition-colors">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1 || isSubmitting}
                className="h-14 px-10 rounded-2xl border-slate-200 dark:border-navy-800 font-bold uppercase text-xs tracking-wider text-slate-400 dark:text-navy-500 hover:text-slate-600 dark:hover:text-navy-200 hover:bg-white dark:hover:bg-navy-900 disabled:opacity-30 dark:disabled:opacity-10 transition-all shadow-sm"
              >
                Previous Step
              </Button>

              {currentStep < steps.length ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="h-14 px-12 rounded-2xl bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 font-bold uppercase text-xs tracking-wider shadow-lg shadow-indigo-100 dark:shadow-navy-950/30 active:scale-95 transition-all text-white border-none"
                >
                  Next Step <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-14 px-12 rounded-2xl bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 font-bold uppercase text-xs tracking-wider shadow-lg shadow-indigo-200 dark:shadow-navy-950/40 active:scale-95 transition-all text-white border-none"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <UserPlus className="h-4 w-4 mr-2" />
                  )}
                  Finalize Enrollment
                </Button>
              )}
            </div>
          </Card>
        </form>
      </Form>
    </div>
  );
}
