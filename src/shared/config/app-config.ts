export const APP_CONFIG = {
  pagination: {
    defaultPageSize: 12,
    maxPageSize: 50,
  },
  query: {
    staleTimeMs: 5 * 60 * 1000,
    gcTimeMs: 15 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  },
} as const;
