import Document, { Html, Head, Main, NextScript } from 'next/document';

/**
 * Custom Document component for Next.js
 */
class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* Character encoding */}
          <meta charSet="utf-8" />
          
          {/* Favicon */}
          <link rel="icon" href="/favicon.ico" />
          
          {/* Web app manifest */}
          <link rel="manifest" href="/manifest.json" />
          
          {/* Apple touch icon */}
          <link rel="apple-touch-icon" href="/icon-192x192.png" />
          
          {/* Theme color */}
          <meta name="theme-color" content="#2563EB" />
          
          {/* Fonts */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link 
            href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@500;600;700&display=swap" 
            rel="stylesheet"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
