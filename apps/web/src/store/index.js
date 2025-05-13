import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { 
  persistStore, 
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER
} from 'redux-persist';
import { combineReducers } from 'redux';

// Import slices
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';

// This creates a unique store instance for each request
const isServer = typeof window === 'undefined';

// Define the root reducer
const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  // Add other reducers here
});

// Store instances cache
let storeInstance = null;

/**
 * Initialize the Redux store with appropriate configuration for client or server
 */
const initializeStore = () => {
  // For client-side, we need to handle persistence
  if (!isServer) {
    // Import storage dynamically to avoid SSR issues
    const storage = require('redux-persist/lib/storage').default;
    
    // Configure persist options
    const persistConfig = {
      key: 'root',
      version: 1,
      storage,
      whitelist: ['auth'], // Only persist auth state
    };
    
    // Create persisted reducer
    const persistedReducer = persistReducer(persistConfig, rootReducer);
    
    // Configure the store
    const store = configureStore({
      reducer: persistedReducer,
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: {
            ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
          },
        }),
      devTools: process.env.NODE_ENV !== 'production',
    });
    
    // Setup listeners for RTK Query (if used)
    setupListeners(store.dispatch);
    
    // Create the persistor
    const persistor = persistStore(store);
    
    return { store, persistor };
  } 
  
  // For server-side, create a simple store without persistence
  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }),
    devTools: false, // Disable devTools on server
  });
  
  return { store, persistor: null };
};

/**
 * Create or reuse a store instance
 */
export const getStore = () => {
  // For server-side rendering, always create a new store
  if (isServer) {
    return initializeStore();
  }
  
  // For client-side, reuse the store if it exists
  if (!storeInstance) {
    storeInstance = initializeStore();
  }
  
  return storeInstance;
};

// Get the store and persistor
const { store, persistor } = getStore();

// Export store and persistor
export { store, persistor };

// For TypeScript users, these would be types
// For JavaScript, we'll export the actual functions
export const RootState = store.getState;
export const AppDispatch = store.dispatch;
