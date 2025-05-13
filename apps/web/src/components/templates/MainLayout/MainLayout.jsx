import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import Header from '../../organisms/Header';
import Sidebar from '../../organisms/Sidebar';
import Footer from '../../organisms/Footer';
import { selectSidebarOpen } from '../../../store/slices/uiSlice';

/**
 * Main layout template for the application
 */
const MainLayout = ({
  children,
  title = 'Samudra Paket ERP',
  description = 'Enterprise Resource Planning system for PT. Sarana Mudah Raya',
  keywords = 'logistics, shipping, ERP, inventory management',
  withHeader = true,
  withFooter = true,
  fullWidth = false,
}) => {
  const { t } = useTranslation();
  
  // Use state to track client-side rendering
  const [isClient, setIsClient] = useState(false);
  
  // Safe selector that won't break SSR
  let sidebarOpen = false;
  try {
    if (typeof window !== 'undefined') {
      // Only try to use the selector on the client side
      sidebarOpen = useSelector(selectSidebarOpen);
    }
  } catch (error) {
    console.error('Error accessing Redux store:', error);
    // Fallback to default value if there's an error
  }
  
  // Effect to mark when we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        {/* Only render header on client-side or with a fallback during SSR */}
        {withHeader && (isClient ? <Header /> : <div className="h-16 bg-white dark:bg-gray-800 shadow-sm"></div>)}

        <div className="flex flex-1">
          {/* Sidebar - only fully functional on client-side */}
          <div className={`
            fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 shadow-md transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:w-64
            ${isClient && sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `} data-testid="sidebar-container">
            {isClient ? <Sidebar /> : <div className="p-6">Loading sidebar...</div>}
          </div>

          {/* Main content */}
          <main className={`flex-1 ${fullWidth ? '' : 'container mx-auto px-4 py-6'}`}>
            {children}
          </main>
        </div>

        {/* Only render footer on client-side or with a fallback during SSR */}
        {withFooter && (isClient ? <Footer /> : <div className="py-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"></div>)}
      </div>
    </>
  );
};

MainLayout.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  description: PropTypes.string,
  keywords: PropTypes.string,
  withHeader: PropTypes.bool,
  withFooter: PropTypes.bool,
  fullWidth: PropTypes.bool,
};

export default MainLayout;
