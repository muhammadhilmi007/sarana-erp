import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { appWithTranslation } from 'next-i18next';
import { getStore } from '../store';
import { queryClient } from '../lib/reactQuery';
import { setTheme } from '../store/slices/uiSlice';
import GlobalErrorBoundary from '../components/molecules/GlobalErrorBoundary';
import { initErrorReporting } from '../lib/errorReporting';
import '../lib/i18n';
import '../styles/globals.css';

/**
 * Custom App component for Next.js
 */
function MyApp({ Component, pageProps }) {
  // Get layout from the page component or fallback to default layout
  const getLayout = Component.getLayout || ((page) => page);
  
  // Get store and persistor for this request
  const { store, persistor } = getStore();

  // Initialize app on client-side
  useEffect(() => {
    // Initialize error reporting system
    initErrorReporting();
    
    // Only run this code on the client side
    if (typeof window !== 'undefined') {
      // Restore theme from localStorage or use system preference
      const savedTheme = localStorage.getItem('theme');
      const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
      
      // Dispatch theme to Redux store
      store.dispatch(setTheme(initialTheme));
      
      // Apply theme to document
      if (initialTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [store]);

  // Create a client-side only PersistGate
  const PersistGateComponent = typeof window !== 'undefined' ? PersistGate : ({ children }) => children;

  return (
    <GlobalErrorBoundary>
      <Provider store={store}>
        <PersistGateComponent loading={null} persistor={persistor}>
          <QueryClientProvider client={queryClient}>
            {getLayout(<Component {...pageProps} />)}
            {process.env.NODE_ENV !== 'production' && <ReactQueryDevtools initialIsOpen={false} />}
          </QueryClientProvider>
        </PersistGateComponent>
      </Provider>
    </GlobalErrorBoundary>
  );
}

export default appWithTranslation(MyApp);
