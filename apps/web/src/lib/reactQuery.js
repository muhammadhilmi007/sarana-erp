import { QueryClient } from '@tanstack/react-query';
import { store } from '../store';
import { setGlobalLoading } from '../store/slices/uiSlice';

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      onError: (error) => {
        console.error('Query error:', error);
      },
    },
    mutations: {
      onError: (error) => {
        console.error('Mutation error:', error);
      },
    },
  },
});

// Global loading state management
queryClient.setDefaultOptions({
  queries: {
    onSettled: () => {
      const activeQueries = queryClient.getQueryCache().findAll({ active: true });
      if (activeQueries.length === 0) {
        store.dispatch(setGlobalLoading(false));
      }
    },
    onMutate: () => {
      store.dispatch(setGlobalLoading(true));
    },
  },
  mutations: {
    onSettled: () => {
      const activeMutations = queryClient.getMutationCache().getAll().filter(mutation => mutation.state.status === 'loading');
      if (activeMutations.length === 0) {
        store.dispatch(setGlobalLoading(false));
      }
    },
    onMutate: () => {
      store.dispatch(setGlobalLoading(true));
    },
  },
});
