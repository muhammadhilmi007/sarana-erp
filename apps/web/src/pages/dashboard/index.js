import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import MainLayout from '../../components/templates/MainLayout';
import Typography from '../../components/atoms/Typography';
import { selectCurrentUser } from '../../store/slices/authSlice';

/**
 * Dashboard page component
 */
const DashboardPage = () => {
  // Use state to track client-side rendering
  const [isClient, setIsClient] = useState(false);
  
  // Safe access to Redux store
  let user = null;
  try {
    if (typeof window !== 'undefined') {
      user = useSelector(selectCurrentUser);
    }
  } catch (error) {
    console.error('Error accessing user data from Redux store:', error);
  }
  
  // Effect to mark when we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  return (
    <div className="py-6">
      {/* Page header */}
      <div className="mb-8">
        <Typography variant="h3" className="mb-2">
          Dashboard
        </Typography>
        <Typography variant="body1" color="light">
          Welcome back, {user?.name || 'User'}
        </Typography>
      </div>
      
      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Stat card 1 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <Typography variant="subtitle2" color="light">
              Pending Pickups
            </Typography>
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <Typography variant="h4">
            24
          </Typography>
          <Typography variant="caption" color="light">
            <span className="text-success-500">↑ 12%</span> from last week
          </Typography>
        </div>
        
        {/* Stat card 2 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <Typography variant="subtitle2" color="light">
              Active Shipments
            </Typography>
            <div className="w-10 h-10 bg-secondary-100 dark:bg-secondary-900 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-secondary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <Typography variant="h4">
            156
          </Typography>
          <Typography variant="caption" color="light">
            <span className="text-success-500">↑ 8%</span> from last week
          </Typography>
        </div>
        
        {/* Stat card 3 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <Typography variant="subtitle2" color="light">
              Delivered Today
            </Typography>
            <div className="w-10 h-10 bg-success-100 dark:bg-success-900 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <Typography variant="h4">
            42
          </Typography>
          <Typography variant="caption" color="light">
            <span className="text-danger-500">↓ 5%</span> from yesterday
          </Typography>
        </div>
        
        {/* Stat card 4 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <Typography variant="subtitle2" color="light">
              Issues Reported
            </Typography>
            <div className="w-10 h-10 bg-danger-100 dark:bg-danger-900 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-danger-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <Typography variant="h4">
            7
          </Typography>
          <Typography variant="caption" color="light">
            <span className="text-success-500">↓ 12%</span> from last week
          </Typography>
        </div>
      </div>
      
      {/* Recent activity and upcoming tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <Typography variant="h5" className="mb-4">
            Recent Activity
          </Typography>
          
          <div className="space-y-4">
            {/* Activity item 1 */}
            <div className="flex">
              <div className="flex-shrink-0 mr-3">
                <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white">
                  JD
                </div>
              </div>
              <div>
                <Typography variant="subtitle2">
                  John Doe
                </Typography>
                <Typography variant="body2" color="light">
                  Created a new shipment #SHP-12345
                </Typography>
                <Typography variant="caption" color="light">
                  2 hours ago
                </Typography>
              </div>
            </div>
            
            {/* Activity item 2 */}
            <div className="flex">
              <div className="flex-shrink-0 mr-3">
                <div className="w-8 h-8 rounded-full bg-secondary-500 flex items-center justify-center text-white">
                  AS
                </div>
              </div>
              <div>
                <Typography variant="subtitle2">
                  Alice Smith
                </Typography>
                <Typography variant="body2" color="light">
                  Updated customer information for #CUS-5678
                </Typography>
                <Typography variant="caption" color="light">
                  3 hours ago
                </Typography>
              </div>
            </div>
            
            {/* Activity item 3 */}
            <div className="flex">
              <div className="flex-shrink-0 mr-3">
                <div className="w-8 h-8 rounded-full bg-success-500 flex items-center justify-center text-white">
                  RJ
                </div>
              </div>
              <div>
                <Typography variant="subtitle2">
                  Robert Johnson
                </Typography>
                <Typography variant="body2" color="light">
                  Completed delivery for shipment #SHP-9876
                </Typography>
                <Typography variant="caption" color="light">
                  5 hours ago
                </Typography>
              </div>
            </div>
            
            {/* Activity item 4 */}
            <div className="flex">
              <div className="flex-shrink-0 mr-3">
                <div className="w-8 h-8 rounded-full bg-warning-500 flex items-center justify-center text-white">
                  EW
                </div>
              </div>
              <div>
                <Typography variant="subtitle2">
                  Emily Wilson
                </Typography>
                <Typography variant="body2" color="light">
                  Scheduled a pickup for tomorrow at 10:00 AM
                </Typography>
                <Typography variant="caption" color="light">
                  6 hours ago
                </Typography>
              </div>
            </div>
          </div>
          
          <button className="mt-4 text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium">
            View all activity
          </button>
        </div>
        
        {/* Upcoming tasks */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <Typography variant="h5" className="mb-4">
            Upcoming Tasks
          </Typography>
          
          <div className="space-y-4">
            {/* Task item 1 */}
            <div className="flex items-start">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
              />
              <div className="ml-3">
                <Typography variant="subtitle2">
                  Schedule pickups for new orders
                </Typography>
                <Typography variant="body2" color="light">
                  Due today at 12:00 PM
                </Typography>
              </div>
            </div>
            
            {/* Task item 2 */}
            <div className="flex items-start">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
              />
              <div className="ml-3">
                <Typography variant="subtitle2">
                  Review pending shipments
                </Typography>
                <Typography variant="body2" color="light">
                  Due today at 2:00 PM
                </Typography>
              </div>
            </div>
            
            {/* Task item 3 */}
            <div className="flex items-start">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
              />
              <div className="ml-3">
                <Typography variant="subtitle2">
                  Follow up on delayed deliveries
                </Typography>
                <Typography variant="body2" color="light">
                  Due today at 4:00 PM
                </Typography>
              </div>
            </div>
            
            {/* Task item 4 */}
            <div className="flex items-start">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
              />
              <div className="ml-3">
                <Typography variant="subtitle2">
                  Generate weekly report
                </Typography>
                <Typography variant="body2" color="light">
                  Due tomorrow at 9:00 AM
                </Typography>
              </div>
            </div>
            
            {/* Task item 5 */}
            <div className="flex items-start">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
              />
              <div className="ml-3">
                <Typography variant="subtitle2">
                  Team meeting
                </Typography>
                <Typography variant="body2" color="light">
                  Tomorrow at 11:00 AM
                </Typography>
              </div>
            </div>
          </div>
          
          <button className="mt-4 text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium">
            View all tasks
          </button>
        </div>
      </div>
    </div>
  );
};

// Define layout for this page
DashboardPage.getLayout = (page) => (
  <MainLayout title="Dashboard - Samudra Paket ERP">
    {page}
  </MainLayout>
);

export default DashboardPage;
