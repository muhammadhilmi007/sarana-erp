import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '../../../hooks/use-toast';
import QRCode from '../QRCode';
import { Button } from '../../atoms/Button';
import { Input } from '../../atoms/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../atoms/Card';
import { Label } from '../../atoms/Label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../atoms/Tabs';
import { authService } from '../../../services/authService';

// Validation schema for the verification code
const verificationSchema = z.object({
  code: z.string().min(6, 'Code must be at least 6 digits').max(6, 'Code must be at most 6 digits'),
});

/**
 * MFA Setup component for enabling two-factor authentication
 */
const MFASetup = ({ onComplete }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [step, setStep] = useState('generate'); // generate, verify, backup
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(verificationSchema),
  });

  // Generate QR code for MFA setup
  const generateQRCode = async () => {
    try {
      setIsLoading(true);
      // In a real implementation, this would call the API to generate a secret
      const response = await authService.generateMFASecret();
      setQrCode(response.qrCodeUrl);
      setSecret(response.secret);
      setIsLoading(false);
    } catch (error) {
      toast({
        title: t('mfa.errorGenerating'),
        description: t('mfa.errorGeneratingDescription'),
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  // Verify the MFA code entered by the user
  const onVerify = async (data) => {
    try {
      setIsLoading(true);
      // In a real implementation, this would call the API to verify the code
      const response = await authService.verifyMFACode({
        secret,
        code: data.code,
      });

      if (response.success) {
        // Generate backup codes
        const backupResponse = await authService.generateBackupCodes();
        setBackupCodes(backupResponse.codes);
        setStep('backup');
        reset();
      } else {
        toast({
          title: t('mfa.invalidCode'),
          description: t('mfa.invalidCodeDescription'),
          variant: 'destructive',
        });
      }
      setIsLoading(false);
    } catch (error) {
      toast({
        title: t('mfa.errorVerifying'),
        description: t('mfa.errorVerifyingDescription'),
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  // Complete the MFA setup process
  const completeMFASetup = async () => {
    try {
      setIsLoading(true);
      // In a real implementation, this would call the API to enable MFA
      await authService.enableMFA();
      toast({
        title: t('mfa.setupComplete'),
        description: t('mfa.setupCompleteDescription'),
      });
      if (onComplete) {
        onComplete();
      }
      setIsLoading(false);
    } catch (error) {
      toast({
        title: t('mfa.errorEnabling'),
        description: t('mfa.errorEnablingDescription'),
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{t('mfa.setup')}</CardTitle>
        <CardDescription>{t('mfa.setupDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={step} onValueChange={setStep} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="generate" disabled={step !== 'generate'}>
              {t('mfa.generate')}
            </TabsTrigger>
            <TabsTrigger value="verify" disabled={step !== 'verify'}>
              {t('mfa.verify')}
            </TabsTrigger>
            <TabsTrigger value="backup" disabled={step !== 'backup'}>
              {t('mfa.backup')}
            </TabsTrigger>
          </TabsList>

          {/* Step 1: Generate QR Code */}
          <TabsContent value="generate">
            <div className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('mfa.scanQRCode')}
              </p>
              
              {qrCode ? (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <QRCode value={qrCode} size={200} />
                  <div className="text-center">
                    <p className="text-sm font-medium">{t('mfa.manualEntry')}</p>
                    <p className="font-mono text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1">
                      {secret}
                    </p>
                  </div>
                  <Button onClick={() => setStep('verify')} className="w-full">
                    {t('mfa.continue')}
                  </Button>
                </div>
              ) : (
                <Button onClick={generateQRCode} disabled={isLoading} className="w-full">
                  {isLoading ? t('common.loading') : t('mfa.generateQRCode')}
                </Button>
              )}
            </div>
          </TabsContent>

          {/* Step 2: Verify Code */}
          <TabsContent value="verify">
            <form onSubmit={handleSubmit(onVerify)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">{t('mfa.verificationCode')}</Label>
                <Input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="123456"
                  {...register('code')}
                  error={errors.code?.message}
                />
                {errors.code && (
                  <p className="text-sm text-red-500">{errors.code.message}</p>
                )}
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? t('common.loading') : t('mfa.verifyCode')}
              </Button>
            </form>
          </TabsContent>

          {/* Step 3: Backup Codes */}
          <TabsContent value="backup">
            <div className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('mfa.backupCodesDescription')}
              </p>
              
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="font-mono text-sm">
                      {code}
                    </div>
                  ))}
                </div>
              </div>
              
              <Button onClick={completeMFASetup} disabled={isLoading} className="w-full">
                {isLoading ? t('common.loading') : t('mfa.complete')}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onComplete}>
          {t('common.cancel')}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MFASetup;
