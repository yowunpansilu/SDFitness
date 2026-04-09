import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User as UserIcon, Phone, Zap } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/authStore';
import type { User, Member } from '@/lib/stores/authStore';
import api from '@/lib/api/axios';
import { AxiosError } from 'axios';

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
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  });

  const { login } = useAuthStore();
  const navigate = useNavigate();

  const validateStep = () => {
    setErrorMsg('');
    if (currentStep === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.password) {
        setErrorMsg('Please fill out all fields.');
        return false;
      }
      if (formData.password.length < 6) {
        setErrorMsg('Password must be at least 6 characters.');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;

    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post<RegisterResponse>('/auth/register', {
        step1Data: formData,
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
    } finally {
      setIsLoading(false);
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
        <h1 className="auth-headline">Join SDFitness</h1>
        <p className="auth-subline">Start your transformation today</p>
      </div>

      <div className="auth-card">
        <form onSubmit={handleSubmit} className="auth-form">
          {errorMsg && (
            <div className="p-3 bg-red-50 text-brand text-sm rounded-xl font-medium text-center">
              {errorMsg}
            </div>
          )}

          {currentStep === 1 && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div className="flex gap-4">
                <div className="input-wrap flex-1">
                  <UserIcon className="input-icon" size={20} />
                  <input
                    type="text"
                    placeholder="First Name"
                    className="input-field"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div className="input-wrap flex-1">
                  <input
                    type="text"
                    placeholder="Last Name"
                    className="input-field pl-4"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div className="input-wrap">
                <Mail className="input-icon" size={20} />
                <input
                  type="email"
                  placeholder="Email Address"
                  className="input-field"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="input-wrap">
                <Phone className="input-icon" size={20} />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  className="input-field"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="input-password-wrap">
                <div className="input-wrap mb-0 cursor-text">
                  <Lock className="input-icon" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    className="input-field"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
                <button
                  type="button"
                  className="input-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
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
            <button type="submit" className="btn-brand flex-[2]" disabled={isLoading}>
              {isLoading ? 'Loading...' : currentStep === 1 ? 'Continue' : 'Create Account'}
            </button>
          </div>
        </form>

        {currentStep === 1 && (
          <div className="auth-footer mt-8">
            <span className="auth-footer__text">Already have an account?</span>
            <span className="auth-footer__link" onClick={() => navigate('/login')}>Sign In</span>
          </div>
        )}
      </div>
    </div>
  );
}
