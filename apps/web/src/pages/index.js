import React from 'react';
import Link from 'next/link';
import MainLayout from '../components/templates/MainLayout';
import Typography from '../components/atoms/Typography';
import Button from '../components/atoms/Button';

/**
 * Home page component
 */
const HomePage = () => {
  return (
    <div className="py-12 md:py-20">
      {/* Hero section */}
      <section className="mb-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <Typography variant="h1" className="mb-6">
                Streamline Your Logistics Operations
              </Typography>
              <Typography variant="body1" color="light" className="mb-8 text-lg">
                Samudra Paket ERP provides end-to-end solutions for logistics and shipping companies, 
                helping you manage pickups, shipments, deliveries, and more with ease.
              </Typography>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/login">
                  <Button variant="primary" size="lg">
                    Get Started
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" size="lg">
                    Contact Sales
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-lg aspect-video flex items-center justify-center">
                {/* Placeholder for hero image */}
                <span className="text-gray-500 dark:text-gray-400">Hero Image</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="mb-20 bg-white dark:bg-gray-800 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Typography variant="h2" className="mb-4">
              Key Features
            </Typography>
            <Typography variant="body1" color="light" className="max-w-2xl mx-auto">
              Our comprehensive ERP system is designed to meet all your logistics needs
            </Typography>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <Typography variant="h5" className="mb-2">
                Pickup Management
              </Typography>
              <Typography variant="body2" color="light">
                Schedule and track pickups efficiently with real-time updates and notifications
              </Typography>
            </div>

            {/* Feature 2 */}
            <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <Typography variant="h5" className="mb-2">
                Shipment Processing
              </Typography>
              <Typography variant="body2" color="light">
                Manage shipments from creation to delivery with comprehensive tracking
              </Typography>
            </div>

            {/* Feature 3 */}
            <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <Typography variant="h5" className="mb-2">
                Customer Communication
              </Typography>
              <Typography variant="body2" color="light">
                Keep customers informed with automated notifications and updates
              </Typography>
            </div>

            {/* Feature 4 */}
            <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <Typography variant="h5" className="mb-2">
                Analytics & Reporting
              </Typography>
              <Typography variant="body2" color="light">
                Gain insights with comprehensive analytics and customizable reports
              </Typography>
            </div>

            {/* Feature 5 */}
            <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <Typography variant="h5" className="mb-2">
                Financial Management
              </Typography>
              <Typography variant="body2" color="light">
                Handle invoicing, payments, and financial reporting in one place
              </Typography>
            </div>

            {/* Feature 6 */}
            <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <Typography variant="h5" className="mb-2">
                Mobile Access
              </Typography>
              <Typography variant="body2" color="light">
                Access your ERP system on the go with our mobile applications
              </Typography>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="bg-primary-500 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <Typography variant="h2" color="white" className="mb-4">
            Ready to Transform Your Logistics Operations?
          </Typography>
          <Typography variant="body1" color="white" className="mb-8 opacity-90 max-w-2xl mx-auto">
            Join hundreds of logistics companies that have streamlined their operations with Samudra Paket ERP
          </Typography>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button variant="primary" size="lg" className="bg-white text-primary-500 hover:bg-gray-100">
                Sign Up Now
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-primary-600">
                Request Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

// Define layout for this page
HomePage.getLayout = (page) => (
  <MainLayout title="Samudra Paket ERP - Logistics Management System">
    {page}
  </MainLayout>
);

export default HomePage;
