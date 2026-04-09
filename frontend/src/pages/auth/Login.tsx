import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Zap } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/authStore';
import type { User, Member } from '@/lib/stores/authStore';
import api from '@/lib/api/axios';
import { AxiosError } from 'axios';

interface LoginResponse {
  success: boolean;
  user: User;
  token: string;
  member?: Member;
  message?: string;
}

export function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const response = await api.post<LoginResponse>('/auth/login', {
        email: formData.email,
        password: formData.password
      });
      const { user, token, member } = response.data;
      login(user, token, member);
      navigate('/home');
    } catch (error) {
      const axiosError = error as AxiosError<LoginResponse>;
      const message = axiosError.response?.data?.message || axiosError.message || 'Login failed!';
      console.error('Login failed', message);
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Hero section */}
      <div className="auth-hero">
        <div className="auth-logo">
          <Zap size={32} strokeWidth={2.5} />
        </div>
        <h1 className="auth-headline">Welcome Back</h1>
        <p className="auth-subline">Sign in to continue your fitness journey</p>
      </div>

      {/* Form Card */}
      <div className="auth-card">
        <form onSubmit={handleSubmit} className="auth-form">
          {errorMsg && (
            <div className="p-3 bg-red-50 text-brand text-sm rounded-xl font-medium text-center">
              {errorMsg}
            </div>
          )}

          <div className="input-wrap">
            <Mail className="input-icon" size={20} />
            <input
              type="email"
              placeholder="Email Address"
              className="input-field"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
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
                required
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

          <div className="flex justify-end mt-1">
            <span className="text-sm font-semibold text-brand cursor-pointer hover:text-brand-dark transition-colors">
              Forgot password?
            </span>
          </div>

          <button type="submit" className="btn-brand mt-4" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-divider">
          <div className="auth-divider__line" />
          <span className="auth-divider__text">OR CONTINUE WITH</span>
          <div className="auth-divider__line" />
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <button type="button" className="btn-outline flex items-center justify-center gap-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#4285F4" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </button>
          <button type="button" className="btn-outline flex items-center justify-center gap-2">
            <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Facebook
          </button>
        </div>

        <div className="auth-footer">
          <span className="auth-footer__text">Don't have an account?</span>
          <span className="auth-footer__link" onClick={() => navigate('/register')}>Sign Up</span>
        </div>
      </div>
    </div>
  );
}
