import { createSlice } from '@reduxjs/toolkit';

// Define initial state
const initialState = {
  theme: 'light',
  sidebarOpen: false,
  notifications: [],
  loading: {
    global: false,
    requests: {},
  },
  modal: {
    isOpen: false,
    type: null,
    data: null,
  },
};

// Create slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Theme management
    setTheme: (state, action) => {
      state.theme = action.payload;
      // Persist theme preference to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', action.payload);
        
        // Apply theme to document
        if (action.payload === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      // Persist theme preference to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', state.theme);
        
        // Apply theme to document
        if (state.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    },
    
    // Sidebar management
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    
    // Notification management
    addNotification: (state, action) => {
      const notification = {
        id: Date.now(),
        duration: 5000, // Default duration
        ...action.payload,
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    
    // Loading state management
    setGlobalLoading: (state, action) => {
      state.loading.global = action.payload;
    },
    setRequestLoading: (state, action) => {
      state.loading.requests[action.payload.requestId] = action.payload.isLoading;
    },
    clearRequestLoading: (state, action) => {
      delete state.loading.requests[action.payload];
    },
    
    // Modal management
    openModal: (state, action) => {
      state.modal = {
        isOpen: true,
        type: action.payload.type,
        data: action.payload.data || null,
      };
    },
    closeModal: (state) => {
      state.modal = {
        isOpen: false,
        type: null,
        data: null,
      };
    },
  },
});

// Export actions
export const {
  setTheme,
  toggleTheme,
  toggleSidebar,
  setSidebarOpen,
  addNotification,
  removeNotification,
  clearNotifications,
  setGlobalLoading,
  setRequestLoading,
  clearRequestLoading,
  openModal,
  closeModal,
} = uiSlice.actions;

// Export selectors
export const selectTheme = (state) => state.ui.theme;
export const selectSidebarOpen = (state) => state.ui.sidebarOpen;
export const selectNotifications = (state) => state.ui.notifications;
export const selectGlobalLoading = (state) => state.ui.loading.global;
export const selectRequestLoading = (requestId) => (state) => 
  state.ui.loading.requests[requestId] || false;
export const selectModal = (state) => state.ui.modal;

// Export reducer
export default uiSlice.reducer;
