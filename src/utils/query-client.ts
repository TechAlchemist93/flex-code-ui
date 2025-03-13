import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";

export const client = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});
