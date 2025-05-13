import React from 'react';
import { useTranslation } from 'react-i18next';
import Typography from '../atoms/Typography';
import Button from '../atoms/Button';

/**
 * Login history table component
 * @param {Object} props - Component props
 * @param {Array} props.loginHistory - Array of login history items
 * @param {Function} props.onClearHistory - Function to clear login history
 * @param {boolean} props.isLoading - Loading state
 */
const LoginHistoryTable = ({ loginHistory = [], onClearHistory, isLoading = false }) => {
  const { t } = useTranslation();

  // Format date
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Typography variant="h4">
          {t('profile.loginHistory')}
        </Typography>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onClearHistory}
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
  );
};

export default LoginHistoryTable;
