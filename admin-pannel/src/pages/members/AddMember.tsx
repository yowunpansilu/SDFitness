import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Upload, Check } from 'lucide-react';
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

// Form schema
const memberFormSchema = z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    dateOfBirth: z.string().min(1, 'Date of birth is required'),
    gender: z.enum(['male', 'female', 'other']),
    address: z.string().min(5, 'Address must be at least 5 characters'),
    emergencyContactName: z.string().min(2, 'Emergency contact name is required'),
    emergencyContactPhone: z.string().min(10, 'Emergency contact phone is required'),
    emergencyContactRelationship: z.string().min(2, 'Relationship is required'),
    membershipPlan: z.string().min(1, 'Please select a membership plan'),
    trainer: z.string().optional(),
    height: z.string().optional(),
    weight: z.string().optional(),
    targetWeight: z.string().optional(),
    fitnessGoals: z.string().optional(),
    medicalConditions: z.string().optional(),
});

type MemberFormValues = z.infer<typeof memberFormSchema>;

const steps = [
    { id: 1, name: 'Personal Info', description: 'Basic member information' },
    { id: 2, name: 'Contact Details', description: 'Contact and emergency info' },
    { id: 3, name: 'Membership', description: 'Plan and trainer assignment' },
    { id: 4, name: 'Health Info', description: 'Fitness goals and metrics' },
];

export function AddMember() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [currentStep, setCurrentStep] = useState(1);
    const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

    const form = useForm<MemberFormValues>({
        resolver: zodResolver(memberFormSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            dateOfBirth: '',
            gender: 'male',
            address: '',
            emergencyContactName: '',
            emergencyContactPhone: '',
            emergencyContactRelationship: '',
            membershipPlan: '',
            trainer: '',
            height: '',
            weight: '',
            targetWeight: '',
            fitnessGoals: '',
            medicalConditions: '',
        },
    });

    const onSubmit = (data: MemberFormValues) => {
        console.log(data);
        toast({
            title: 'Success!',
            description: 'Member added successfully.',
        });
        navigate('/members');
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

    const nextStep = () => {
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/members')}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-800"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Add New Member
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Fill in the member details</p>
                </div>
            </div>

            {/* Steps Progress */}
            <div className="flex justify-between items-center">
                {steps.map((step, index) => (
                    <div key={step.id} className="flex flex-1 items-center">
                        <div className="flex flex-col items-center flex-1">
                            <div
                                className={cn(
                                    'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                                    currentStep > step.id
                                        ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/20'
                                        : currentStep === step.id
                                            ? 'bg-purple-600 dark:bg-purple-500 border-purple-600 dark:border-purple-500 text-white shadow-lg shadow-purple-500/20'
                                            : 'bg-white dark:bg-dark-900 border-gray-200 dark:border-dark-700 text-gray-400 dark:text-gray-500'
                                )}
                            >
                                {currentStep > step.id ? <Check className="h-5 w-5" /> : step.id}
                            </div>
                            <div className="mt-2 text-center">
                                <p className={cn(
                                    'text-sm font-medium transition-colors',
                                    currentStep >= step.id ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
                                )}>
                                    {step.name}
                                </p>
                                <p className="text-xs text-gray-500 hidden sm:block">{step.description}</p>
                            </div>
                        </div>
                        {index < steps.length - 1 && (
                            <div
                                className={cn(
                                    'flex-1 h-0.5 mx-2 transition-all duration-300',
                                    currentStep > step.id ? 'bg-green-500' : 'bg-gray-200 dark:bg-dark-700'
                                )}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Form Card */}
            <Card className="bg-white dark:bg-dark-900/50 border-gray-200 dark:border-dark-800 backdrop-blur-sm shadow-sm">
                <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">{steps[currentStep - 1].name}</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                        {steps[currentStep - 1].description}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Step 1: Personal Info */}
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-32 h-32 rounded-full bg-gray-50 dark:bg-dark-800 border-2 border-gray-100 dark:border-dark-700 flex items-center justify-center overflow-hidden">
                                            {profilePhoto ? (
                                                <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <Upload className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                                            )}
                                        </div>
                                        <label htmlFor="photo-upload" className="cursor-pointer">
                                            <input
                                                id="photo-upload"
                                                type="file"
                                                accept="image/*"
                                                onChange={handlePhotoUpload}
                                                className="hidden"
                                            />
                                            <Button type="button" variant="outline" className="border-gray-200 dark:border-dark-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-dark-800" asChild>
                                                <span>Upload Photo</span>
                                            </Button>
                                        </label>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="firstName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-gray-700 dark:text-gray-300">First Name</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="John" className="bg-gray-50 dark:bg-dark-800/50 border-gray-200 dark:border-dark-700 text-gray-900 dark:text-white" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="lastName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-gray-700 dark:text-gray-300">Last Name</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="Doe" className="bg-gray-50 dark:bg-dark-800/50 border-gray-200 dark:border-dark-700 text-gray-900 dark:text-white" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="dateOfBirth"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-gray-700 dark:text-gray-300">Date of Birth</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} type="date" className="bg-gray-50 dark:bg-dark-800/50 border-gray-200 dark:border-dark-700 text-gray-900 dark:text-white" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="gender"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-gray-700 dark:text-gray-300">Gender</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="bg-gray-50 dark:bg-dark-800/50 border-gray-200 dark:border-dark-700 text-gray-900 dark:text-white">
                                                                <SelectValue placeholder="Select gender" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="bg-white dark:bg-dark-900 border-gray-200 dark:border-dark-700 text-gray-900 dark:text-white">
                                                            <SelectItem value="male">Male</SelectItem>
                                                            <SelectItem value="female">Female</SelectItem>
                                                            <SelectItem value="other">Other</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Contact Details */}
                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-gray-700 dark:text-gray-300">Email</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} type="email" placeholder="john.doe@example.com" className="bg-gray-50 dark:bg-dark-800/50 border-gray-200 dark:border-dark-700 text-gray-900 dark:text-white" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="phone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-gray-700 dark:text-gray-300">Phone</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="+1 234 567 8900" className="bg-gray-50 dark:bg-dark-800/50 border-gray-200 dark:border-dark-700 text-gray-900 dark:text-white" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="address"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-gray-700 dark:text-gray-300">Address</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="123 Main St, City, State ZIP" className="bg-gray-50 dark:bg-dark-800/50 border-gray-200 dark:border-dark-700 text-gray-900 dark:text-white" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="border-t border-gray-200 dark:border-dark-700 pt-6 mt-6">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Emergency Contact</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <FormField
                                                control={form.control}
                                                name="emergencyContactName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-gray-700 dark:text-gray-300">Name</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} placeholder="Jane Doe" className="bg-gray-50 dark:bg-dark-800/50 border-gray-200 dark:border-dark-700 text-gray-900 dark:text-white" />
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
                                                        <FormLabel className="text-gray-700 dark:text-gray-300">Phone</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} placeholder="+1 234 567 8901" className="bg-gray-50 dark:bg-dark-800/50 border-gray-200 dark:border-dark-700 text-gray-900 dark:text-white" />
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
                                                        <FormLabel className="text-gray-700 dark:text-gray-300">Relationship</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} placeholder="Spouse" className="bg-gray-50 dark:bg-dark-800/50 border-gray-200 dark:border-dark-700 text-gray-900 dark:text-white" />
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
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="membershipPlan"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-gray-700 dark:text-gray-300">Membership Plan</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="bg-gray-50 dark:bg-dark-800/50 border-gray-200 dark:border-dark-700 text-gray-900 dark:text-white">
                                                                <SelectValue placeholder="Select plan" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="bg-white dark:bg-dark-900 border-gray-200 dark:border-dark-700 text-gray-900 dark:text-white">
                                                            <SelectItem value="basic">Basic - $49/month</SelectItem>
                                                            <SelectItem value="premium">Premium - $99/month</SelectItem>
                                                            <SelectItem value="vip">VIP - $149/month</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="trainer"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-gray-700 dark:text-gray-300">Assign Trainer (Optional)</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="bg-gray-50 dark:bg-dark-800/50 border-gray-200 dark:border-dark-700 text-gray-900 dark:text-white">
                                                                <SelectValue placeholder="Select trainer" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="bg-white dark:bg-dark-900 border-gray-200 dark:border-dark-700 text-gray-900 dark:text-white">
                                                            <SelectItem value="sarah">Sarah Johnson - Strength Training</SelectItem>
                                                            <SelectItem value="mike">Mike Ross - HIIT & Cardio</SelectItem>
                                                            <SelectItem value="emma">Emma Wilson - Yoga & Flexibility</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormDescription className="text-gray-500 dark:text-gray-400">
                                                        Assign a personal trainer to this member
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Health Info */}
                            {currentStep === 4 && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="height"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-gray-700 dark:text-gray-300">Height (cm)</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} type="number" placeholder="175" className="bg-gray-50 dark:bg-dark-800/50 border-gray-200 dark:border-dark-700 text-gray-900 dark:text-white" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="weight"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-gray-700 dark:text-gray-300">Current Weight (kg)</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} type="number" placeholder="75" className="bg-gray-50 dark:bg-dark-800/50 border-gray-200 dark:border-dark-700 text-gray-900 dark:text-white" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="targetWeight"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-gray-700 dark:text-gray-300">Target Weight (kg)</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} type="number" placeholder="70" className="bg-gray-50 dark:bg-dark-800/50 border-gray-200 dark:border-dark-700 text-gray-900 dark:text-white" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="fitnessGoals"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-gray-700 dark:text-gray-300">Fitness Goals</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Weight loss, muscle gain, endurance..." className="bg-gray-50 dark:bg-dark-800/50 border-gray-200 dark:border-dark-700 text-gray-900 dark:text-white" />
                                                </FormControl>
                                                <FormDescription className="text-gray-500 dark:text-gray-400">
                                                    Describe the member's fitness objectives
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="medicalConditions"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-gray-700 dark:text-gray-300">Medical Conditions (Optional)</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Any medical conditions or injuries..." className="bg-gray-50 dark:bg-dark-800/50 border-gray-200 dark:border-dark-700 text-gray-900 dark:text-white" />
                                                </FormControl>
                                                <FormDescription className="text-gray-500 dark:text-gray-400">
                                                    Any health conditions trainers should be aware of
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-dark-700">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={prevStep}
                                    disabled={currentStep === 1}
                                    className="border-gray-200 dark:border-dark-700 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-dark-800"
                                >
                                    Previous
                                </Button>
                                {currentStep < steps.length ? (
                                    <Button
                                        type="button"
                                        onClick={nextStep}
                                        className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                                    >
                                        Next Step
                                    </Button>
                                ) : (
                                    <Button
                                        type="submit"
                                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                                    >
                                        <Check className="h-4 w-4 mr-2" />
                                        Complete & Add Member
                                    </Button>
                                )}
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
