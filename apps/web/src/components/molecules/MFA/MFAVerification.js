import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '../../../hooks/use-toast';
import Button from '../../atoms/Button';
import Input from '../../atoms/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../atoms/Card';
import { Label } from '../../atoms/Label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../atoms/Tabs';
import Typography from '../../atoms/Typography';

// Validation schema for the verification code
const verificationSchema = z.object({
  code: z.string().min(6, 'Code must be at least 6 digits').max(6, 'Code must be at most 6 digits'),
});

// Validation schema for the backup code
const backupSchema = z.object({
  backupCode: z.string().min(8, 'Backup code must be at least 8 characters'),
});

/**
 * MFA Verification component for verifying two-factor authentication during login
 */
const MFAVerification = ({ email, mfaToken, onSuccess, onCancel }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [method, setMethod] = useState('app'); // app, backup
  const [isLoading, setIsLoading] = useState(false);

  const {
    register: registerApp,
    handleSubmit: handleSubmitApp,
    formState: { errors: errorsApp },
    reset: resetApp,
  } = useForm({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      code: '',
    },
  });

  const {
    register: registerBackup,
    handleSubmit: handleSubmitBackup,
    formState: { errors: errorsBackup },
    reset: resetBackup,
  } = useForm({
    resolver: zodResolver(backupSchema),
    defaultValues: {
      backupCode: '',
    },
  });

  // Verify the MFA code entered by the user
  const onVerifyCode = async (data) => {
    try {
      setIsLoading(true);
      
      // Call the onSuccess callback with the code and isBackupCode=false
      if (onSuccess) {
        await onSuccess(data.code, false);
      }
      
      // Reset form after submission
      resetApp();
      setIsLoading(false);
    } catch (error) {
      console.error('Error verifying MFA code:', error);
      toast({
        title: t('mfa.errorVerifying'),
        description: error.message || t('mfa.errorVerifyingDescription'),
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  // Verify the backup code entered by the user
  const onVerifyBackupCode = async (data) => {
    try {
      setIsLoading(true);
      
      // Call the onSuccess callback with the backup code and isBackupCode=true
      if (onSuccess) {
        await onSuccess(data.backupCode, true);
      }
      
      // Reset form after submission
      resetBackup();
      setIsLoading(false);
    } catch (error) {
      console.error('Error verifying backup code:', error);
      toast({
        title: t('mfa.errorVerifying'),
        description: error.message || t('mfa.errorVerifyingDescription'),
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <Typography variant="h4" className="mb-2">
          {t('mfa.verification')}
        </Typography>
        <Typography variant="body2" color="light">
          {t('mfa.verificationDescription', { email: email })} 
        </Typography>
      </div>
      
      <div className="p-6">
        <Tabs value={method} onValueChange={setMethod} className="w-full">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="app">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                {t('mfa.authenticatorApp')}
              </div>
            </TabsTrigger>
            <TabsTrigger value="backup">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                {t('mfa.backupCode')}
              </div>
            </TabsTrigger>
          </TabsList>

          {/* Authenticator App Verification */}
          <TabsContent value="app">
            <div className="mb-4">
              <Typography variant="body2">
                {t('mfa.enterCodeFromApp')}
              </Typography>
            </div>
            <form onSubmit={handleSubmitApp(onVerifyCode)} className="space-y-4">
              <div className="space-y-2">
                <Input
                  id="code"
                  name="code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  label={t('mfa.verificationCode')}
                  placeholder="123456"
                  autoComplete="one-time-code"
                  required
                  fullWidth
                  {...registerApp('code')}
                  error={errorsApp.code?.message}
                />
              </div>
              <Button 
                type="submit" 
                variant="primary" 
                fullWidth 
                isLoading={isLoading}
              >
                {isLoading ? t('common.loading') : t('mfa.verifyCode')}
              </Button>
            </form>
          </TabsContent>

          {/* Backup Code Verification */}
          <TabsContent value="backup">
            <div className="mb-4">
              <Typography variant="body2">
                {t('mfa.useBackupCode')}
              </Typography>
            </div>
            <form onSubmit={handleSubmitBackup(onVerifyBackupCode)} className="space-y-4">
              <div className="space-y-2">
                <Input
                  id="backupCode"
                  name="backupCode"
                  type="text"
                  label={t('mfa.backupCode')}
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  required
                  fullWidth
                  {...registerBackup('backupCode')}
                  error={errorsBackup.backupCode?.message}
                />
              </div>
              <Button 
                type="submit" 
                variant="primary" 
                fullWidth 
                isLoading={isLoading}
              >
                {isLoading ? t('common.loading') : t('mfa.verifyBackupCode')}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={onCancel} fullWidth>
            {t('common.cancel')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MFAVerification;
