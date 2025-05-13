import React, { useState } from 'react';
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
 * Forgot Password page component
 */
const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState(null);
  
  // Validation schema
  const forgotPasswordSchema = z.object({
    email: z.string().email(t('validation.invalidEmail')),
  });
  
  // Form methods
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });
  
  // Handle form submission
  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // In a real implementation, this would call an API endpoint
      // For now, we'll simulate a successful request
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message
      setIsSubmitted(true);
    } catch (error) {
      console.error('Password reset request failed:', error);
      setError(error.message || t('auth.forgotPasswordError'));
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
            {t('auth.checkYourEmail')}
          </Typography>
          
          <Typography variant="body1" color="light" className="mb-6">
            {t('auth.passwordResetEmailSent')}
          </Typography>
          
          <Button 
            variant="primary" 
            onClick={() => router.push('/auth/login')}
            className="mx-auto"
          >
            {t('auth.backToLogin')}
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full">
      <div className="mb-8">
        <Typography variant="h3" className="mb-2">
          {t('auth.forgotPassword')}
        </Typography>
        <Typography variant="body1" color="light">
          {t('auth.forgotPasswordInstructions')}
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
            id="email"
            name="email"
            type="email"
            label={t('auth.email')}
            placeholder="your.email@example.com"
            required
            fullWidth
            {...register('email')}
            error={errors.email?.message}
          />
        </div>
        
        <div>
          <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>
            {t('auth.sendResetLink')}
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
ForgotPasswordPage.getLayout = (page) => {
  // We need to use a static title here since we don't have access to the t function
  // The actual title will be translated in the component
  return (
    <AuthLayout title="Forgot Password - Samudra Paket ERP">
      {page}
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
