import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import MainLayout from '../../components/templates/MainLayout';
import Typography from '../../components/atoms/Typography';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import AuthGuard from '../../components/molecules/AuthGuard';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { useToast } from '../../hooks/use-toast';

/**
 * Profile management page component
 */
const ProfilePage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const router = useRouter();
  const { toast } = useToast();
  const currentUser = useSelector(selectCurrentUser);
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  // Validation schema for profile form
  const profileSchema = z.object({
    name: z.string().min(2, t('validation.nameMinLength')),
    email: z.string().email(t('validation.invalidEmail')),
    phone: z.string().optional(),
    position: z.string().optional(),
    department: z.string().optional(),
    bio: z.string().optional(),
  });

  // Form methods
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      position: '',
      department: '',
      bio: '',
    },
  });

  // Load user data into form
  useEffect(() => {
    if (currentUser) {
      reset({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        position: currentUser.position || '',
        department: currentUser.department || '',
        bio: currentUser.bio || '',
      });

      // Set avatar preview if available
      if (currentUser.avatar) {
        setAvatarPreview(currentUser.avatar);
      }
    }
  }, [currentUser, reset]);

  // Handle avatar file selection
  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: t('profile.avatarTooLarge'),
        description: t('profile.avatarSizeLimit'),
        variant: 'destructive',
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: t('profile.invalidFileType'),
        description: t('profile.imageFilesOnly'),
        variant: 'destructive',
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle profile form submission
  const onSubmitProfile = async (data) => {
    try {
      setIsLoading(true);

      // In a real implementation, this would call an API endpoint
      // For now, we'll simulate a successful update
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: t('profile.profileUpdated'),
        description: t('profile.profileUpdatedMessage'),
        variant: 'success',
      });
    } catch (error) {
      console.error('Profile update failed:', error);
      toast({
        title: t('profile.updateFailed'),
        description: error.message || t('profile.updateFailedMessage'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <Typography variant="h2" className="mb-2">
          {t('profile.title')}
        </Typography>
        <Typography variant="body1" color="light">
          {t('profile.subtitle')}
        </Typography>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        {/* Profile tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex">
            <button
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'profile'
                  ? 'border-b-2 border-primary-500 text-primary-500'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              {t('profile.profileInfo')}
            </button>
            <button
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'security'
                  ? 'border-b-2 border-primary-500 text-primary-500'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('security')}
            >
              {t('profile.security')}
            </button>
            <button
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'preferences'
                  ? 'border-b-2 border-primary-500 text-primary-500'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('preferences')}
            >
              {t('profile.preferences')}
            </button>
          </nav>
        </div>

        {/* Profile content */}
        <div className="p-6">
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Avatar section */}
              <div className="flex flex-col items-center">
                <div className="mb-4 relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt={t('profile.avatar')}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 bg-primary-500 text-white p-2 rounded-full cursor-pointer shadow-md hover:bg-primary-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
                <Typography variant="body2" className="text-center mb-2">
                  {t('profile.uploadAvatar')}
                </Typography>
                <Typography variant="caption" color="light" className="text-center mb-4">
                  {t('profile.avatarRequirements')}
                </Typography>
                {avatarPreview && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAvatarPreview(null)}
                    className="mt-2"
                  >
                    {t('profile.removeAvatar')}
                  </Button>
                )}
              </div>

              {/* Profile form */}
              <div className="md:col-span-2">
                <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        label={t('profile.fullName')}
                        required
                        fullWidth
                        {...register('name')}
                        error={errors.name?.message}
                      />
                    </div>
                    <div>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        label={t('profile.email')}
                        required
                        fullWidth
                        {...register('email')}
                        error={errors.email?.message}
                      />
                    </div>
                    <div>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        label={t('profile.phone')}
                        fullWidth
                        {...register('phone')}
                        error={errors.phone?.message}
                      />
                    </div>
                    <div>
                      <Input
                        id="position"
                        name="position"
                        type="text"
                        label={t('profile.position')}
                        fullWidth
                        {...register('position')}
                        error={errors.position?.message}
                      />
                    </div>
                    <div>
                      <Input
                        id="department"
                        name="department"
                        type="text"
                        label={t('profile.department')}
                        fullWidth
                        {...register('department')}
                        error={errors.department?.message}
                      />
                    </div>
                  </div>

                  <div>
                    <Input
                      id="bio"
                      name="bio"
                      type="textarea"
                      label={t('profile.bio')}
                      fullWidth
                      multiline
                      rows={4}
                      {...register('bio')}
                      error={errors.bio?.message}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" variant="primary" isLoading={isLoading}>
                      {t('profile.saveChanges')}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-8">
              <div>
                <Typography variant="h4" className="mb-4">
                  {t('profile.changePassword')}
                </Typography>
                <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
                  <form className="space-y-6">
                    <div>
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        label={t('profile.currentPassword')}
                        required
                        fullWidth
                      />
                    </div>
                    <div>
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        label={t('profile.newPassword')}
                        required
                        fullWidth
                      />
                    </div>
                    <div>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        label={t('profile.confirmPassword')}
                        required
                        fullWidth
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit" variant="primary">
                        {t('profile.updatePassword')}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>

              <div>
                <Typography variant="h4" className="mb-4">
                  {t('profile.loginHistory')}
                </Typography>
                <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
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
                            {t('profile.ipAddress')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {/* Sample login history data */}
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {new Date().toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            Chrome on Windows
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            Jakarta, Indonesia
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            192.168.1.1
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-8">
              <div>
                <Typography variant="h4" className="mb-4">
                  {t('profile.appPreferences')}
                </Typography>
                <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
                  <form className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Typography variant="body1" className="font-medium">
                          {t('profile.darkMode')}
                        </Typography>
                        <Typography variant="body2" color="light">
                          {t('profile.darkModeDescription')}
                        </Typography>
                      </div>
                      <div className="relative inline-block w-12 h-6 rounded-full bg-gray-200 dark:bg-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          id="darkMode"
                          className="sr-only"
                        />
                        <span className="block w-6 h-6 rounded-full bg-white dark:bg-primary-500 shadow-md transform transition-transform duration-200 ease-in-out"></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Typography variant="body1" className="font-medium">
                          {t('profile.emailNotifications')}
                        </Typography>
                        <Typography variant="body2" color="light">
                          {t('profile.emailNotificationsDescription')}
                        </Typography>
                      </div>
                      <div className="relative inline-block w-12 h-6 rounded-full bg-gray-200 dark:bg-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          id="emailNotifications"
                          className="sr-only"
                          defaultChecked
                        />
                        <span className="block w-6 h-6 rounded-full bg-white dark:bg-primary-500 shadow-md transform translate-x-6 transition-transform duration-200 ease-in-out"></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Typography variant="body1" className="font-medium">
                          {t('profile.language')}
                        </Typography>
                        <Typography variant="body2" color="light">
                          {t('profile.languageDescription')}
                        </Typography>
                      </div>
                      <select className="block w-40 pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white">
                        <option value="en">English</option>
                        <option value="id">Bahasa Indonesia</option>
                      </select>
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" variant="primary">
                        {t('profile.savePreferences')}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Define layout for this page
ProfilePage.getLayout = (page) => (
  <AuthGuard>
    <MainLayout title="Profile - Samudra Paket ERP">
      {page}
    </MainLayout>
  </AuthGuard>
);

export default ProfilePage;
