'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';
import axios from 'axios';
import { Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';
import GoldCornerAccent from '../../components/ui/GoldCornerAccent';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setAuth, token } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (token) {
      router.push('/dashboard');
    }
  }, [token, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const response = await api.post('/auth/login', {
        username: data.username,
        password: data.password,
      });

      const { access_token, user } = response.data;
      setAuth(access_token, user);
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      if (axios.isAxiosError(error)) {
        if (error.response && error.response.data) {
          const resData = error.response.data as { message?: string };
          setApiError(resData.message || 'Invalid username or password');
        } else {
          setApiError('Unable to connect to authentication server. Is the backend running?');
        }
      } else {
        setApiError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-secondary">
      {/* Warm background accents — no blur/glassmorphism */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-accent/8 pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/6 pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-md card-base rounded-xl p-8 shadow-lg relative z-10">
        {/* Gold corner ornament — signature element (A4) */}
        <GoldCornerAccent position="top-right" size={56} />
        <GoldCornerAccent position="bottom-left" size={56} />

        <div className="text-center mb-8">
          {/* Brand monogram */}
          <div className="mx-auto w-14 h-14 rounded-full bg-primary flex items-center justify-center mb-4">
            <span className="text-primary-foreground font-display font-bold text-2xl">S</span>
          </div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">
            Seisuvai
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Catering Billing & Business Management
          </p>
        </div>

        {apiError && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Username Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-muted-foreground">
              Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground">
                <User size={18} />
              </span>
              <input
                type="text"
                placeholder="Enter your username"
                {...register('username')}
                className={`w-full pl-10 pr-4 py-3 min-h-[44px] rounded-lg border bg-card text-foreground transition-colors duration-200 outline-none text-sm focus:border-primary focus:ring-1 focus:ring-primary ${
                  errors.username ? 'border-destructive/50 focus:border-destructive focus:ring-destructive' : 'border-border'
                }`}
                disabled={isLoading}
              />
            </div>
            {errors.username && (
              <p className="mt-1 text-xs text-destructive">{errors.username.message}</p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-muted-foreground">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground">
                <Lock size={18} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                {...register('password')}
                className={`w-full pl-10 pr-10 py-3 min-h-[44px] rounded-lg border bg-card text-foreground transition-colors duration-200 outline-none text-sm focus:border-primary focus:ring-1 focus:ring-primary ${
                  errors.password ? 'border-destructive/50 focus:border-destructive focus:ring-destructive' : 'border-border'
                }`}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground cursor-pointer min-w-[44px] justify-center"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full flex items-center justify-center py-3 min-h-[44px] px-4 rounded-lg bg-primary hover:bg-accent text-primary-foreground font-semibold text-sm transition-colors duration-200 shadow-sm disabled:opacity-75 disabled:pointer-events-none cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 animate-spin" size={18} />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Removed demo credentials block per QA report */}
        <div className="mt-6 pt-4 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            Seisuvai Catering — Business Management System
          </p>
        </div>
      </div>
    </div>
  );
}
