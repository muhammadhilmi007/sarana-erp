import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useToast } from '../../hooks/use-toast';
import MainLayout from '../../components/templates/MainLayout';
import { Button } from '../../components/atoms/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/atoms/Card';
import { Alert, AlertDescription, AlertTitle } from '../../components/atoms/Alert';
import { Shield, ShieldAlert, ShieldCheck, Info } from 'lucide-react';
import MFASetup from '../../components/molecules/MFA/MFASetup';
import AuthGuard from '../../components/molecules/AuthGuard';
import { authService } from '../../services/authService';

/**
 * MFA Management Page
 * Allows users to enable, disable, and manage their MFA settings
 */
const MFAPage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const user = useSelector((state) => state.auth.user);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);
  const [lastUsed, setLastUsed] = useState(null);

  // Fetch MFA status on component mount
  useEffect(() => {
    const fetchMFAStatus = async () => {
      try {
        setIsLoading(true);
        // In a real implementation, this would call the API to get MFA status
        const response = await authService.getMFAStatus();
        setMfaEnabled(response.enabled);
        if (response.lastUsed) {
          setLastUsed(new Date(response.lastUsed));
        }
        setIsLoading(false);
      } catch (error) {
        toast({
          title: t('mfa.errorFetching'),
          description: t('mfa.errorFetchingDescription'),
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    };

    fetchMFAStatus();
  }, [t, toast]);

  // Handle disabling MFA
  const handleDisableMFA = async () => {
    try {
      setIsLoading(true);
      // In a real implementation, this would call the API to disable MFA
      await authService.disableMFA();
      setMfaEnabled(false);
      toast({
        title: t('mfa.disabled'),
        description: t('mfa.disabledDescription'),
      });
      setIsLoading(false);
    } catch (error) {
      toast({
        title: t('mfa.errorDisabling'),
        description: t('mfa.errorDisablingDescription'),
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  // Handle MFA setup completion
  const handleSetupComplete = () => {
    setShowSetup(false);
    setMfaEnabled(true);
  };

  // Handle regenerating backup codes
  const handleRegenerateBackupCodes = async () => {
    try {
      setIsLoading(true);
      // In a real implementation, this would call the API to regenerate backup codes
      const response = await authService.regenerateBackupCodes();
      toast({
        title: t('mfa.backupCodesRegenerated'),
        description: t('mfa.backupCodesRegeneratedDescription'),
      });
      setIsLoading(false);
      
      // Show the backup codes in a modal or alert
      // This is a simplified implementation
      alert(t('mfa.newBackupCodes') + ':\n' + response.codes.join('\n'));
    } catch (error) {
      toast({
        title: t('mfa.errorRegenerating'),
        description: t('mfa.errorRegeneratingDescription'),
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  return (
    <AuthGuard>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">{t('mfa.title')}</h1>
        
        {showSetup ? (
          <MFASetup onComplete={() => setShowSetup(false)} />
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2">
              {/* MFA Status Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {mfaEnabled ? (
                      <>
                        <ShieldCheck className="h-5 w-5 text-green-500" />
                        {t('mfa.enabled')}
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="h-5 w-5 text-amber-500" />
                        {t('mfa.disabled')}
                      </>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {mfaEnabled
                      ? t('mfa.enabledDescription')
                      : t('mfa.disabledDescription')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {mfaEnabled && lastUsed && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      {t('mfa.lastUsed', {
                        date: lastUsed.toLocaleDateString(),
                        time: lastUsed.toLocaleTimeString(),
                      })}
                    </p>
                  )}

                  {!mfaEnabled && (
                    <Alert className="mb-4">
                      <Info className="h-4 w-4" />
                      <AlertTitle>{t('mfa.recommendation')}</AlertTitle>
                      <AlertDescription>
                        {t('mfa.recommendationDescription')}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
                <CardFooter>
                  {mfaEnabled ? (
                    <Button
                      variant="destructive"
                      onClick={handleDisableMFA}
                      disabled={isLoading}
                    >
                      {isLoading ? t('common.loading') : t('mfa.disable')}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setShowSetup(true)}
                      disabled={isLoading}
                    >
                      {isLoading ? t('common.loading') : t('mfa.enable')}
                    </Button>
                  )}
                </CardFooter>
              </Card>

              {/* Backup Codes Card */}
              {mfaEnabled && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-blue-500" />
                      {t('mfa.backupCodes')}
                    </CardTitle>
                    <CardDescription>
                      {t('mfa.backupCodesManagement')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      {t('mfa.backupCodesExplanation')}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      onClick={handleRegenerateBackupCodes}
                      disabled={isLoading}
                    >
                      {isLoading
                        ? t('common.loading')
                        : t('mfa.regenerateBackupCodes')}
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </div>

            {/* MFA Information */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">{t('mfa.whatIs')}</h2>
              <div className="prose dark:prose-invert max-w-none">
                <p>{t('mfa.explanation1')}</p>
                <p>{t('mfa.explanation2')}</p>
                <h3>{t('mfa.benefits')}</h3>
                <ul>
                  <li>{t('mfa.benefit1')}</li>
                  <li>{t('mfa.benefit2')}</li>
                  <li>{t('mfa.benefit3')}</li>
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
    </AuthGuard>
  );
};

// Define the layout for this page
MFAPage.getLayout = (page) => <MainLayout>{page}</MainLayout>;

export default MFAPage;
