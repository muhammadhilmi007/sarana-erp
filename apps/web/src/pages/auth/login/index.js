import React, { useState } from 'react';
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
import MFAVerification from '../../../components/molecules/MFA/MFAVerification';
import { login, verifyMFA, cancelMFA, selectAuthLoading, selectAuthError, selectMFARequired, selectMFAToken } from '../../../store/slices/authSlice';
import { useToast } from '../../../hooks/use-toast';

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
});

/**
 * Login page component
 */
const LoginPage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const dispatch = useDispatch();
  const router = useRouter();
  const isLoading = useSelector(selectAuthLoading);
  const authError = useSelector(selectAuthError);
  const mfaRequired = useSelector(selectMFARequired);
  const mfaToken = useSelector(selectMFAToken);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  
  // Form methods
  const methods = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });
  
  // Handle form submission
  const onSubmit = async (data) => {
    try {
      // Save email for potential MFA verification
      setEmail(data.email);
      
      // Dispatch login action
      const response = await dispatch(login(data)).unwrap();
      
      // If MFA is not required, redirect to dashboard
      if (!response.requireMFA) {
        router.push('/dashboard');
      }
      // If MFA is required, the state will be updated by the reducer
      // and the MFA verification component will be shown
    } catch (error) {
      console.error('Login failed:', error);
      toast({
        title: t('auth.loginFailed'),
        description: t('auth.loginFailedDescription'),
        variant: 'destructive',
      });
    }
  };
  
  // Handle MFA verification success
  const handleMFASuccess = async (code, isBackupCode = false) => {
    try {
      // Get form values for rememberMe
      const { rememberMe } = methods.getValues();
      
      // Dispatch MFA verification action
      await dispatch(verifyMFA({
        mfaToken,
        code,
        email,
        rememberMe,
        isBackupCode
      })).unwrap();
      
      // Redirect to dashboard on success
      router.push('/dashboard');
    } catch (error) {
      console.error('MFA verification failed:', error);
      toast({
        title: t('auth.mfaVerificationFailed'),
        description: t('auth.mfaVerificationFailedDescription'),
        variant: 'destructive',
      });
    }
  };
  
  // Handle MFA verification cancel
  const handleMFACancel = () => {
    // Dispatch cancelMFA action
    dispatch(cancelMFA());
  };
  
  return (
    <div className="w-full">
      {mfaRequired ? (
        // Show MFA verification when required
        <MFAVerification
          email={email}
          mfaToken={mfaToken}
          onSuccess={handleMFASuccess}
          onCancel={handleMFACancel}
        />
      ) : (
        // Show login form
        <>
          <div className="mb-8">
            <Typography variant="h3" className="mb-2">
              {t('auth.signIn')}
            </Typography>
            <Typography variant="body1" color="light">
              {t('auth.signInDescription')}
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
                  id="email"
                  name="email"
                  type="email"
                  label={t('auth.emailAddress')}
                  placeholder="your.email@example.com"
                  required
                  fullWidth
                  {...methods.register('email')}
                  error={methods.formState.errors.email?.message}
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
                      aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
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
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
                    {...methods.register('rememberMe')}
                  />
                  <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    {t('auth.rememberMe')}
                  </label>
                </div>
                
                <div>
                  <Link href="/auth/forgot-password" className="text-sm text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300">
                    {t('auth.forgotPassword')}
                  </Link>
                </div>
              </div>
              
              <div>
                <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>
                  {t('auth.signIn')}
                </Button>
              </div>
            </form>
          </FormProvider>
          
          <div className="mt-8 text-center">
            <Typography variant="body2" color="light">
              {t('auth.noAccount')}{' '}
              <Link href="/auth/register" className="text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300">
                {t('auth.signUp')}
              </Link>
            </Typography>
          </div>
        </>
      )}
    </div>
  );
};

// Define layout for this page
LoginPage.getLayout = (page) => (
  <AuthLayout title="Sign In - Samudra Paket ERP">
    {page}
  </AuthLayout>
);

export default LoginPage;
