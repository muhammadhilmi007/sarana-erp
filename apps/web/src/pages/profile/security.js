import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import MainLayout from '../../components/templates/MainLayout';
import Typography from '../../components/atoms/Typography';
import Button from '../../components/atoms/Button';
import AuthGuard from '../../components/molecules/AuthGuard';
import PasswordChangeForm from '../../components/molecules/PasswordChangeForm';
import { secureStorage } from '../../lib/utils/secureStorage';
import { useToast } from '../../hooks/use-toast';

/**
 * Security settings page component
 */
const SecurityPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { toast } = useToast();
  const [loginHistory, setLoginHistory] = useState([]);
  const [devices, setDevices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load login history and devices
  useEffect(() => {
    const loadSecurityData = async () => {
      try {
        setIsLoading(true);
        
        // In a real implementation, this would call an API endpoint
        // For now, we'll use mock data
        
        // Get login history from storage
        const history = secureStorage.getLoginHistory() || [];
        
        // If no history, create sample data
        if (history.length === 0) {
          const sampleHistory = [
            {
              id: '1',
              timestamp: Date.now(),
              device: 'Chrome on Windows',
              location: 'Jakarta, Indonesia',
              ipAddress: '192.168.1.1',
              status: 'success',
            },
            {
              id: '2',
              timestamp: Date.now() - 86400000, // 1 day ago
              device: 'Safari on iPhone',
              location: 'Jakarta, Indonesia',
              ipAddress: '192.168.1.2',
              status: 'success',
            },
            {
              id: '3',
              timestamp: Date.now() - 172800000, // 2 days ago
              device: 'Firefox on Windows',
              location: 'Bandung, Indonesia',
              ipAddress: '192.168.1.3',
              status: 'failed',
            },
          ];
          
          setLoginHistory(sampleHistory);
        } else {
          setLoginHistory(history);
        }
        
        // Sample devices data
        const sampleDevices = [
          {
            id: '1',
            name: 'Windows PC',
            browser: 'Chrome',
            os: 'Windows 10',
            lastActive: Date.now(),
            isCurrent: true,
          },
          {
            id: '2',
            name: 'iPhone',
            browser: 'Safari',
            os: 'iOS 15',
            lastActive: Date.now() - 86400000, // 1 day ago
            isCurrent: false,
          },
          {
            id: '3',
            name: 'MacBook Pro',
            browser: 'Firefox',
            os: 'macOS',
            lastActive: Date.now() - 604800000, // 7 days ago
            isCurrent: false,
          },
        ];
        
        setDevices(sampleDevices);
      } catch (error) {
        console.error('Error loading security data:', error);
        toast({
          title: t('profile.loadError'),
          description: t('profile.loadErrorMessage'),
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSecurityData();
  }, [t, toast]);

  // Handle device removal
  const handleRemoveDevice = (deviceId) => {
    // In a real implementation, this would call an API endpoint
    // For now, we'll just remove it from the local state
    setDevices(devices.filter(device => device.id !== deviceId));
    
    toast({
      title: t('profile.deviceRemoved'),
      description: t('profile.deviceRemovedMessage'),
      variant: 'success',
    });
  };

  // Handle clearing login history
  const handleClearHistory = () => {
    // In a real implementation, this would call an API endpoint
    // For now, we'll just clear the local state
    setLoginHistory([]);
    secureStorage.clearLoginHistory();
    
    toast({
      title: t('profile.historyCleared'),
      description: t('profile.historyClearedMessage'),
      variant: 'success',
    });
  };

  // Format date
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <Typography variant="h2" className="mb-2">
          {t('profile.securitySettings')}
        </Typography>
        <Typography variant="body1" color="light">
          {t('profile.securitySettingsDescription')}
        </Typography>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Password Change Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <Typography variant="h4" className="mb-4">
                {t('profile.changePassword')}
              </Typography>
              <PasswordChangeForm />
            </div>
          </div>

          {/* Login History Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <Typography variant="h4">
                  {t('profile.loginHistory')}
                </Typography>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleClearHistory}
                  disabled={loginHistory.length === 0}
                >
                  {t('profile.clearHistory')}
                </Button>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-t-2 border-b-2 border-primary-500 rounded-full animate-spin"></div>
                </div>
              ) : loginHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Typography variant="body1" color="light">
                    {t('profile.noLoginHistory')}
                  </Typography>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('profile.date')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('profile.device')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('profile.location')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('profile.status')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {loginHistory.map((login) => (
                        <tr key={login.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {formatDate(login.timestamp)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {login.device}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {login.location}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              login.status === 'success' 
                                ? 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-400' 
                                : 'bg-danger-100 text-danger-800 dark:bg-danger-900/30 dark:text-danger-400'
                            }`}>
                              {login.status === 'success' ? t('profile.successful') : t('profile.failed')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Devices Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <Typography variant="h4" className="mb-4">
                {t('profile.devices')}
              </Typography>
              
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-t-2 border-b-2 border-primary-500 rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {devices.map((device) => (
                    <div 
                      key={device.id} 
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center">
                            <Typography variant="body1" className="font-medium">
                              {device.name}
                            </Typography>
                            {device.isCurrent && (
                              <span className="ml-2 px-2 py-0.5 text-xs bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400 rounded-full">
                                {t('profile.currentDevice')}
                              </span>
                            )}
                          </div>
                          <Typography variant="body2" color="light">
                            {device.browser} {t('common.on')} {device.os}
                          </Typography>
                          <Typography variant="caption" color="light">
                            {t('profile.lastActive')}: {formatDate(device.lastActive)}
                          </Typography>
                        </div>
                        {!device.isCurrent && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleRemoveDevice(device.id)}
                            className="text-danger-500 hover:text-danger-600 dark:text-danger-400 dark:hover:text-danger-300"
                          >
                            {t('profile.removeDevice')}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Security Alerts Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <Typography variant="h4" className="mb-4">
                {t('profile.securityAlerts')}
              </Typography>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Typography variant="body1" className="font-medium">
                      {t('profile.loginAlerts')}
                    </Typography>
                    <Typography variant="body2" color="light">
                      {t('profile.loginAlertsDescription')}
                    </Typography>
                  </div>
                  <div className="relative inline-block w-12 h-6 rounded-full bg-gray-200 dark:bg-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      id="loginAlerts"
                      className="sr-only"
                      defaultChecked
                    />
                    <span className="block w-6 h-6 rounded-full bg-white dark:bg-primary-500 shadow-md transform translate-x-6 transition-transform duration-200 ease-in-out"></span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Typography variant="body1" className="font-medium">
                      {t('profile.newDeviceAlerts')}
                    </Typography>
                    <Typography variant="body2" color="light">
                      {t('profile.newDeviceAlertsDescription')}
                    </Typography>
                  </div>
                  <div className="relative inline-block w-12 h-6 rounded-full bg-gray-200 dark:bg-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      id="newDeviceAlerts"
                      className="sr-only"
                      defaultChecked
                    />
                    <span className="block w-6 h-6 rounded-full bg-white dark:bg-primary-500 shadow-md transform translate-x-6 transition-transform duration-200 ease-in-out"></span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Typography variant="body1" className="font-medium">
                      {t('profile.passwordChangeAlerts')}
                    </Typography>
                    <Typography variant="body2" color="light">
                      {t('profile.passwordChangeAlertsDescription')}
                    </Typography>
                  </div>
                  <div className="relative inline-block w-12 h-6 rounded-full bg-gray-200 dark:bg-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      id="passwordChangeAlerts"
                      className="sr-only"
                      defaultChecked
                    />
                    <span className="block w-6 h-6 rounded-full bg-white dark:bg-primary-500 shadow-md transform translate-x-6 transition-transform duration-200 ease-in-out"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Define layout for this page
SecurityPage.getLayout = (page) => (
  <AuthGuard>
    <MainLayout title="Security Settings - Samudra Paket ERP">
      {page}
    </MainLayout>
  </AuthGuard>
);

export default SecurityPage;
