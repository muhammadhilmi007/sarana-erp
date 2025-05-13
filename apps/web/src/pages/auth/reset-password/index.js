import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import AuthLayout from '../../../components/templates/AuthLayout';
import Typography from '../../../components/atoms/Typography';
import Button from '../../../components/atoms/Button';
import Input from '../../../components/atoms/Input';

/**
 * Password Reset page component
 */
const PasswordResetPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { token } = router.query;
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: '',
  });
  
  // Validation schema
  const passwordResetSchema = z.object({
    password: z.string()
      .min(8, t('validation.passwordMinLength'))
      .refine(
        (password) => /[A-Z]/.test(password),
        { message: t('validation.passwordUppercase') }
      )
      .refine(
        (password) => /[a-z]/.test(password),
        { message: t('validation.passwordLowercase') }
      )
      .refine(
        (password) => /[0-9]/.test(password),
        { message: t('validation.passwordNumber') }
      )
      .refine(
        (password) => /[^A-Za-z0-9]/.test(password),
        { message: t('validation.passwordSpecial') }
      ),
    confirmPassword: z.string(),
  }).refine(
    (data) => data.password === data.confirmPassword,
    {
      message: t('validation.passwordsDoNotMatch'),
      path: ['confirmPassword'],
    }
  );
  
  // Form methods
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });
  
  // Watch password field for strength calculation
  const password = watch('password', '');
  
  // Calculate password strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength({ score: 0, feedback: '' });
      return;
    }
    
    // Simple password strength calculation
    let score = 0;
    let feedback = '';
    
    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    // Character variety checks
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    // Provide feedback based on score
    if (score <= 2) {
      feedback = t('validation.passwordWeak');
    } else if (score <= 4) {
      feedback = t('validation.passwordMedium');
    } else {
      feedback = t('validation.passwordStrong');
    }
    
    setPasswordStrength({ score: Math.min(score, 5), feedback });
  }, [password, t]);
  
  // Verify token is present
  useEffect(() => {
    if (router.isReady && !token) {
      router.push('/auth/forgot-password');
    }
  }, [router, token]);
  
  // Handle form submission
  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // In a real implementation, this would call an API endpoint with the token and new password
      // For now, we'll simulate a successful request
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message
      setIsSubmitted(true);
    } catch (error) {
      console.error('Password reset failed:', error);
      setError(error.message || t('auth.resetPasswordError'));
    } finally {
      setIsLoading(false);
    }
  };
  
  // If the form was submitted successfully, show a success message
  if (isSubmitted) {
    return (
      <div className="w-full">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-success-100 dark:bg-success-900/30 flex items-center justify-center text-success-600 dark:text-success-400">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          
          <Typography variant="h3" className="mb-2">
            {t('auth.passwordResetSuccess')}
          </Typography>
          
          <Typography variant="body1" color="light" className="mb-6">
            {t('auth.passwordResetSuccessMessage')}
          </Typography>
          
          <Button 
            variant="primary" 
            onClick={() => router.push('/auth/login')}
            className="mx-auto"
          >
            {t('auth.signIn')}
          </Button>
        </div>
      </div>
    );
  }
  
  // If token is not yet available, show loading state
  if (!token) {
    return (
      <div className="w-full flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  // Render password strength indicator
  const renderPasswordStrengthIndicator = () => {
    const { score, feedback } = passwordStrength;
    
    // Don't show indicator if password is empty
    if (!password) return null;
    
    // Calculate width and color based on score
    const width = `${(score / 5) * 100}%`;
    let color = 'bg-danger-500';
    
    if (score >= 4) {
      color = 'bg-success-500';
    } else if (score >= 3) {
      color = 'bg-warning-500';
    } else if (score >= 2) {
      color = 'bg-orange-500';
    }
    
    return (
      <div className="mt-2">
        <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`h-full ${color} rounded-full transition-all duration-300`} 
            style={{ width }}
          ></div>
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {feedback}
        </p>
      </div>
    );
  };
  
  return (
    <div className="w-full">
      <div className="mb-8">
        <Typography variant="h3" className="mb-2">
          {t('auth.resetPassword')}
        </Typography>
        <Typography variant="body1" color="light">
          {t('auth.resetPasswordInstructions')}
        </Typography>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-md text-danger-700 dark:text-danger-300">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            label={t('auth.newPassword')}
            placeholder="••••••••"
            required
            fullWidth
            {...register('password')}
            error={errors.password?.message}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-500"
                tabIndex="-1"
                aria-label={showPassword ? t('common.hidePassword') : t('common.showPassword')}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            }
          />
          {renderPasswordStrengthIndicator()}
        </div>
        
        <div>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            label={t('auth.confirmPassword')}
            placeholder="••••••••"
            required
            fullWidth
            {...register('confirmPassword')}
            error={errors.confirmPassword?.message}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-gray-500"
                tabIndex="-1"
                aria-label={showConfirmPassword ? t('common.hidePassword') : t('common.showPassword')}
              >
                {showConfirmPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            }
          />
        </div>
        
        <div>
          <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>
            {t('auth.resetPassword')}
          </Button>
        </div>
      </form>
      
      <div className="mt-8 text-center">
        <Typography variant="body2" color="light">
          {t('auth.rememberedPassword')}{' '}
          <Link href="/auth/login" className="text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300">
            {t('auth.signIn')}
          </Link>
        </Typography>
      </div>
    </div>
  );
};

// Define layout for this page
PasswordResetPage.getLayout = (page) => {
  return (
    <AuthLayout title="Reset Password - Samudra Paket ERP">
      {page}
    </AuthLayout>
  );
};

export default PasswordResetPage;
