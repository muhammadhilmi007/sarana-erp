import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { z } from 'zod';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import AuthLayout from '../../../components/templates/AuthLayout';
import Typography from '../../../components/atoms/Typography';
import Button from '../../../components/atoms/Button';
import Input from '../../../components/atoms/Input';
import { register as registerUser, selectAuthLoading, selectAuthError } from '../../../store/slices/authSlice';

/**
 * Register page component
 */
const RegisterPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const router = useRouter();
  const isLoading = useSelector(selectAuthLoading);
  const authError = useSelector(selectAuthError);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: '',
  });
  
  // Validation schema
  const registerSchema = z.object({
    name: z.string().min(2, t('validation.nameMinLength')),
    email: z.string().email(t('validation.invalidEmail')),
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
    companyName: z.string().min(2, t('validation.companyNameMinLength')),
    agreeToTerms: z.boolean().refine(val => val === true, {
      message: t('validation.agreeToTerms'),
    }),
  }).refine(data => data.password === data.confirmPassword, {
    message: t('validation.passwordsDoNotMatch'),
    path: ['confirmPassword'],
  });

  // Form methods
  const methods = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      companyName: '',
      agreeToTerms: false,
    },
  });
  
  // Watch password field for strength calculation
  const password = methods.watch('password', '');
  
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
  
  // Handle form submission
  const onSubmit = async (data) => {
    try {
      await dispatch(registerUser(data)).unwrap();
      router.push('/dashboard');
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };
  
  return (
    <div className="w-full">
      <div className="mb-8">
        <Typography variant="h3" className="mb-2">
          {t('auth.createAccount')}
        </Typography>
        <Typography variant="body1" color="light">
          {t('auth.registerInstructions')}
        </Typography>
      </div>
      
      {authError && (
        <div className="mb-6 p-4 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-md text-danger-700 dark:text-danger-300">
          {authError}
        </div>
      )}
      
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Input
              id="name"
              name="name"
              type="text"
              label={t('auth.fullName')}
              placeholder={t('auth.fullNamePlaceholder')}
              required
              fullWidth
              {...methods.register('name')}
              error={methods.formState.errors.name?.message}
            />
          </div>
          
          <div>
            <Input
              id="email"
              name="email"
              type="email"
              label={t('auth.email')}
              placeholder={t('auth.emailPlaceholder')}
              required
              fullWidth
              {...methods.register('email')}
              error={methods.formState.errors.email?.message}
            />
          </div>
          
          <div>
            <Input
              id="companyName"
              name="companyName"
              type="text"
              label={t('auth.companyName')}
              placeholder={t('auth.companyNamePlaceholder')}
              required
              fullWidth
              {...methods.register('companyName')}
              error={methods.formState.errors.companyName?.message}
            />
          </div>
          
          <div>
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              label={t('auth.password')}
              placeholder="••••••••"
              required
              fullWidth
              {...methods.register('password')}
              error={methods.formState.errors.password?.message}
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
              helperText={t('validation.passwordRequirements')}
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
              {...methods.register('confirmPassword')}
              error={methods.formState.errors.confirmPassword?.message}
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
          
          <div className="flex items-center">
            <input
              id="agreeToTerms"
              name="agreeToTerms"
              type="checkbox"
              className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
              {...methods.register('agreeToTerms')}
            />
            <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              {t('auth.agreeToTermsText')}{' '}
              <Link href="/terms" className="text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300">
                {t('auth.termsOfService')}
              </Link>{' '}
              {t('common.and')}{' '}
              <Link href="/privacy" className="text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300">
                {t('auth.privacyPolicy')}
              </Link>
            </label>
          </div>
          {methods.formState.errors.agreeToTerms && (
            <p className="mt-1 text-sm text-danger-500" role="alert">
              {methods.formState.errors.agreeToTerms.message}
            </p>
          )}
          
          <div>
            <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>
              {t('auth.createAccount')}
            </Button>
          </div>
        </form>
      </FormProvider>
      
      <div className="mt-8 text-center">
        <Typography variant="body2" color="light">
          {t('auth.alreadyHaveAccount')}{' '}
          <Link href="/auth/login" className="text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300">
            {t('auth.signIn')}
          </Link>
        </Typography>
      </div>
    </div>
  );
};

// Define layout for this page
RegisterPage.getLayout = (page) => (
  <AuthLayout title="Create Account - Samudra Paket ERP">
    {page}
  </AuthLayout>
);

export default RegisterPage;
