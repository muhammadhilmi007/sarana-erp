import React from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import Link from 'next/link';
import Typography from '../../atoms/Typography';

/**
 * Authentication layout template for login, register, and other auth pages
 */
const AuthLayout = ({
  children,
  title = 'Authentication - Samudra Paket ERP',
  description = 'Sign in or register to access the Samudra Paket ERP system',
  keywords = 'login, register, authentication, samudra paket',
}) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen flex flex-col md:flex-row">
        {/* Left side - Brand and information */}
        <div className="hidden md:flex md:w-1/2 bg-primary-500 text-white p-8 flex-col justify-between">
          <div>
            <Link href="/" className="flex items-center">
              <span className="text-white font-bold text-2xl">Samudra Paket</span>
            </Link>
            <div className="mt-16">
              <Typography variant="h2" color="white" className="mb-4">
                Welcome to Samudra Paket ERP
              </Typography>
              <Typography variant="body1" color="white" className="opacity-80">
                Streamline your logistics operations with our comprehensive enterprise resource planning system.
              </Typography>
            </div>
          </div>
          
          <div className="mt-auto">
            <Typography variant="caption" color="white" className="opacity-70">
              &copy; {new Date().getFullYear()} PT. Sarana Mudah Raya. All rights reserved.
            </Typography>
          </div>
        </div>
        
        {/* Right side - Auth form */}
        <div className="flex-1 flex items-center justify-center p-4 md:p-8 bg-white dark:bg-gray-900">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="md:hidden mb-8 text-center">
              <Link href="/" className="inline-block">
                <span className="text-primary-500 font-bold text-2xl">Samudra Paket</span>
              </Link>
            </div>
            
            {/* Auth content */}
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

AuthLayout.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  description: PropTypes.string,
  keywords: PropTypes.string,
};

export default AuthLayout;
