import { QueryClient } from "@tanstack/react-query";

// One shared cache for the whole app.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Journal history doesn't change behind your back, so don't refetch on
      // every window focus — that would be wasted requests.
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
      // Don't retry 401s (the axios interceptor already handles refresh).
      retry: (count, err) => (err?.response?.status === 401 ? false : count < 1),
    },
  },
});
