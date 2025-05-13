import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '../atoms/Input';
import Button from '../atoms/Button';
import Typography from '../atoms/Typography';
import { useToast } from '../../hooks/use-toast';

/**
 * Password change form component
 * @param {Object} props - Component props
 * @param {Function} [props.onSuccess] - Callback function to call on successful password change
 */
const PasswordChangeForm = ({ onSuccess }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: '',
  });

  // Validation schema
  const passwordChangeSchema = z.object({
    currentPassword: z.string().min(1, t('validation.currentPasswordRequired')),
    newPassword: z.string()
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
  }).refine(data => data.newPassword === data.confirmPassword, {
    message: t('validation.passwordsDoNotMatch'),
    path: ['confirmPassword'],
  });

  // Form methods
  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Watch new password field for strength calculation
  const newPassword = watch('newPassword', '');

  // Calculate password strength
  useEffect(() => {
    if (!newPassword) {
      setPasswordStrength({ score: 0, feedback: '' });
      return;
    }
    
    // Simple password strength calculation
    let score = 0;
    let feedback = '';
    
    // Length check
    if (newPassword.length >= 8) score += 1;
    if (newPassword.length >= 12) score += 1;
    
    // Character variety checks
    if (/[A-Z]/.test(newPassword)) score += 1;
    if (/[a-z]/.test(newPassword)) score += 1;
    if (/[0-9]/.test(newPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 1;
    
    // Provide feedback based on score
    if (score <= 2) {
      feedback = t('validation.passwordWeak');
    } else if (score <= 4) {
      feedback = t('validation.passwordMedium');
    } else {
      feedback = t('validation.passwordStrong');
    }
    
    setPasswordStrength({ score: Math.min(score, 5), feedback });
  }, [newPassword, t]);

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      setIsLoading(true);

      // In a real implementation, this would call an API endpoint
      // For now, we'll simulate a successful password change
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Show success message
      toast({
        title: t('profile.passwordChanged'),
        description: t('profile.passwordChangedMessage'),
        variant: 'success',
      });

      // Reset form
      reset();

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Password change failed:', error);
      toast({
        title: t('profile.passwordChangeFailed'),
        description: error.message || t('profile.passwordChangeFailedMessage'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Render password strength indicator
  const renderPasswordStrengthIndicator = () => {
    const { score, feedback } = passwordStrength;
    
    // Don't show indicator if password is empty
    if (!newPassword) return null;
    
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Input
          id="currentPassword"
          name="currentPassword"
          type={showCurrentPassword ? 'text' : 'password'}
          label={t('profile.currentPassword')}
          required
          fullWidth
          {...register('currentPassword')}
          error={errors.currentPassword?.message}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="text-gray-500"
              tabIndex="-1"
              aria-label={showCurrentPassword ? t('common.hidePassword') : t('common.showPassword')}
            >
              {showCurrentPassword ? (
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
        <Input
          id="newPassword"
          name="newPassword"
          type={showNewPassword ? 'text' : 'password'}
          label={t('profile.newPassword')}
          required
          fullWidth
          {...register('newPassword')}
          error={errors.newPassword?.message}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="text-gray-500"
              tabIndex="-1"
              aria-label={showNewPassword ? t('common.hidePassword') : t('common.showPassword')}
            >
              {showNewPassword ? (
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
          label={t('profile.confirmPassword')}
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

      <div className="flex justify-end">
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {t('profile.updatePassword')}
        </Button>
      </div>
    </form>
  );
};

export default PasswordChangeForm;
