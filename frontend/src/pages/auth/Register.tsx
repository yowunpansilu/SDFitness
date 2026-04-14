import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User as UserIcon, Phone, Zap } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/authStore';
import type { User, Member } from '@/lib/stores/authStore';
import api from '@/lib/api/axios';
import { AxiosError } from 'axios';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const registerSchema = z.object({
  firstName: z.string().min(2, { message: 'First name is required' }),
  lastName: z.string().min(2, { message: 'Last name is required' }),
  email: z.string().email({ message: 'Valid email is required' }),
  phone: z.string().min(10, { message: 'Valid phone number is required' }),
  password: z.string().min(6, { message: 'Min 6 characters' }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

interface RegisterResponse {
  success: boolean;
  user: User;
  token: string;
  member?: Member;
  message?: string;
}

export function Register() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const handleNextStep = async (e: React.MouseEvent) => {
    e.preventDefault();
    const isValid = await trigger();
    if (isValid) {
      setCurrentStep(2);
    }
  };

  const onSubmit = async (data: RegisterFormValues) => {
    setErrorMsg('');
    try {
      const response = await api.post<RegisterResponse>('/auth/register', {
        step1Data: data,
        step2Data: { dateOfBirth: new Date(), gender: 'Other', height: '170', weight: '70', heightUnit: 'cm', weightUnit: 'kg' },
        step3Data: { fitnessGoals: ['General Fitness'], activityLevel: 'moderate', dietaryPreferences: [] }
      });
      const { user, token, member } = response.data;
      login(user, token, member);
      navigate('/home');
    } catch (error) {
      const axiosError = error as AxiosError<RegisterResponse>;
      const message = axiosError.response?.data?.message || axiosError.message || 'Registration failed';
      console.error('Registration failed', message);
      setErrorMsg(message);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="auth-page">
      <div className="auth-hero">
        <div className="auth-logo">
          <Zap size={32} strokeWidth={2.5} />
        </div>
        <h1 className="auth-headline">Join SDFitness Downtown</h1>
        <p className="auth-subline">Start your transformation today</p>
      </div>

      <div className="auth-card">
        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          {errorMsg && (
            <div className="p-3 bg-red-50 text-brand text-sm rounded-xl font-medium text-center mb-4">
              {errorMsg}
            </div>
          )}

          {currentStep === 1 && (
            <div className="flex flex-col gap-5 animate-fade-in pb-4">
              <div className="flex gap-4">
                <div className="input-wrap flex-1 mb-0 relative">
                  <UserIcon className="input-icon" size={20} />
                  <input
                    type="text"
                    placeholder="First Name"
                    className={`input-field ${errors.firstName ? 'border-red-500' : ''}`}
                    {...register('firstName')}
                  />
                  {errors.firstName && <span className="absolute -bottom-4 left-2 text-[10px] text-red-500 font-bold uppercase">{errors.firstName.message}</span>}
                </div>
                <div className="input-wrap flex-1 mb-0 relative">
                  <input
                    type="text"
                    placeholder="Last Name"
                    className={`input-field pl-4 ${errors.lastName ? 'border-red-500' : ''}`}
                    {...register('lastName')}
                  />
                  {errors.lastName && <span className="absolute -bottom-4 left-2 text-[10px] text-red-500 font-bold uppercase">{errors.lastName.message}</span>}
                </div>
              </div>

              <div className="input-wrap mb-0 relative">
                <Mail className="input-icon" size={20} />
                <input
                  type="email"
                  placeholder="Email Address"
                  className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                  {...register('email')}
                />
                {errors.email && <span className="absolute -bottom-4 left-2 text-[10px] text-red-500 font-bold uppercase">{errors.email.message}</span>}
              </div>

              <div className="input-wrap mb-0 relative">
                <Phone className="input-icon" size={20} />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  className={`input-field ${errors.phone ? 'border-red-500' : ''}`}
                  {...register('phone')}
                />
                {errors.phone && <span className="absolute -bottom-4 left-2 text-[10px] text-red-500 font-bold uppercase">{errors.phone.message}</span>}
              </div>

              <div className="input-password-wrap mb-0 relative">
                <div className="input-wrap mb-0 cursor-text">
                  <Lock className="input-icon" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    className={`input-field ${errors.password ? 'border-red-500' : ''}`}
                    {...register('password')}
                  />
                </div>
                <button
                  type="button"
                  className="input-eye-btn absolute right-3 top-1/2 -translate-y-1/2 z-10"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} className="text-ink-muted" /> : <Eye size={20} className="text-ink-muted" />}
                </button>
                {errors.password && <span className="absolute -bottom-4 left-2 text-[10px] text-red-500 font-bold uppercase">{errors.password.message}</span>}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="flex flex-col items-center justify-center py-6 animate-fade-in text-center">
              <div className="w-16 h-16 bg-surface-hover rounded-2xl flex items-center justify-center mb-4">
                <span className="text-2xl">💪</span>
              </div>
              <h2 className="font-headline font-bold text-xl text-ink-strong mb-2">Ready to crush it?</h2>
              <p className="text-sm text-ink-muted leading-relaxed max-w-[260px]">
                We'll ask for more specific health metrics in your profile later. Let's get you in!
              </p>
            </div>
          )}

          <div className="flex gap-3 mt-4">
            {currentStep > 1 && (
              <button type="button" onClick={handleBack} className="btn-outline flex-1">
                Back
              </button>
            )}
            {currentStep === 1 ? (
              <button type="button" onClick={handleNextStep} className="btn-brand flex-[2]">
                Continue
              </button>
            ) : (
              <button type="submit" className="btn-brand flex-[2]" disabled={isSubmitting}>
                {isSubmitting ? 'Loading...' : 'Create Account'}
              </button>
            )}
          </div>
        </form>

        {currentStep === 1 && (
          <div className="auth-footer mt-8 text-center">
            <span className="auth-footer__text text-ink-muted text-sm inline-block mr-1">Already have an account?</span>
            <span className="auth-footer__link text-brand font-bold text-sm cursor-pointer hover:underline" onClick={() => navigate('/login')}>Sign In</span>
          </div>
        )}
      </div>
    </div>
  );
}
