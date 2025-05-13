import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import Typography from '../../atoms/Typography';

/**
 * Footer component for the application
 */
const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  
  // Footer links
  const footerLinks = [
    { label: t('footer.terms'), href: '/terms' },
    { label: t('footer.privacy'), href: '/privacy' },
    { label: t('footer.contact'), href: '/contact' },
  ];
  
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Copyright */}
          <div className="mb-4 md:mb-0">
            <Typography variant="body2" color="light">
              {t('footer.copyright', { year: currentYear })}
            </Typography>
          </div>
          
          {/* Links */}
          <div className="flex flex-wrap justify-center space-x-4">
            {footerLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className="text-sm text-gray-500 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        
        {/* Additional footer content */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company info */}
            <div>
              <Typography variant="subtitle2" className="mb-3">
                PT. Sarana Mudah Raya
              </Typography>
              <address className="not-italic text-sm text-gray-500 dark:text-gray-400">
                <p>Jl. Raya Pasar Minggu No. 123</p>
                <p>Jakarta Selatan, 12345</p>
                <p>Indonesia</p>
                <p className="mt-2">
                  <a href="tel:+6221123456" className="hover:text-primary-500 dark:hover:text-primary-400">
                    +62 21 123 456
                  </a>
                </p>
                <p>
                  <a href="mailto:info@samudraepaket.com" className="hover:text-primary-500 dark:hover:text-primary-400">
                    info@samudraepaket.com
                  </a>
                </p>
              </address>
            </div>
            
            {/* Services */}
            <div>
              <Typography variant="subtitle2" className="mb-3">
                Services
              </Typography>
              <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <li>
                  <Link href="/services/logistics" className="hover:text-primary-500 dark:hover:text-primary-400">
                    Logistics
                  </Link>
                </li>
                <li>
                  <Link href="/services/shipping" className="hover:text-primary-500 dark:hover:text-primary-400">
                    Shipping
                  </Link>
                </li>
                <li>
                  <Link href="/services/warehousing" className="hover:text-primary-500 dark:hover:text-primary-400">
                    Warehousing
                  </Link>
                </li>
                <li>
                  <Link href="/services/tracking" className="hover:text-primary-500 dark:hover:text-primary-400">
                    Tracking
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Resources */}
            <div>
              <Typography variant="subtitle2" className="mb-3">
                Resources
              </Typography>
              <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <li>
                  <Link href="/resources/help" className="hover:text-primary-500 dark:hover:text-primary-400">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/resources/api" className="hover:text-primary-500 dark:hover:text-primary-400">
                    API Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/resources/blog" className="hover:text-primary-500 dark:hover:text-primary-400">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/resources/careers" className="hover:text-primary-500 dark:hover:text-primary-400">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Social Media */}
            <div>
              <Typography variant="subtitle2" className="mb-3">
                Connect With Us
              </Typography>
              <div className="flex space-x-4">
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400"
                  aria-label="Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                </a>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400"
                  aria-label="Twitter"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400"
                  aria-label="LinkedIn"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.7 3H4.3A1.3 1.3 0 003 4.3v15.4A1.3 1.3 0 004.3 21h15.4a1.3 1.3 0 001.3-1.3V4.3A1.3 1.3 0 0019.7 3zM8.339 18.338H5.667v-8.59h2.672v8.59zM7.004 8.574a1.548 1.548 0 11-.002-3.096 1.548 1.548 0 01.002 3.096zm11.335 9.764H15.67v-4.177c0-.996-.017-2.278-1.387-2.278-1.389 0-1.601 1.086-1.601 2.206v4.249h-2.667v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.779 3.203 4.092v4.711z" />
                  </svg>
                </a>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400"
                  aria-label="Instagram"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 011.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 01-1.153 1.772 4.915 4.915 0 01-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 01-1.772-1.153 4.904 4.904 0 01-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 011.153-1.772A4.897 4.897 0 015.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 1.802c-2.67 0-2.986.01-4.04.059-.976.045-1.505.207-1.858.344-.466.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.048 1.055-.058 1.37-.058 4.041 0 2.67.01 2.986.058 4.04.045.977.207 1.505.344 1.858.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058 2.67 0 2.987-.01 4.04-.058.977-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041 0-2.67-.01-2.986-.058-4.04-.045-.977-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.055-.048-1.37-.058-4.041-.058zm0 3.063a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 8.468a3.333 3.333 0 100-6.666 3.333 3.333 0 000 6.666zm6.538-8.469a1.2 1.2 0 11-2.4 0 1.2 1.2 0 012.4 0z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
