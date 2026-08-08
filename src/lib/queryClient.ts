import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes cache
      refetchOnWindowFocus: false, // Don't refetch automatically on window focus for UI stability
      retry: 2, // Retry failed requests twice
    },
  },
});
