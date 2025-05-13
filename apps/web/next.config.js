/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n: {
    // These are all the locales you want to support in
    // your application
    locales: ['en', 'id'],
    // This is the default locale you want to be used when visiting
    // a non-locale prefixed path e.g. `/hello`
    defaultLocale: 'en',
    // This is a list of locale domains and the default locale they
    // should handle (these are only required when setting up domain routing)
    // domains: [
    //   {
    //     domain: 'example.com',
    //     defaultLocale: 'en',
    //   },
    //   {
    //     domain: 'example.id',
    //     defaultLocale: 'id',
    //   },
    // ],
  },
  // Configure image domains if needed
  images: {
    domains: ['localhost'],
  },
};

module.exports = nextConfig;
