import { MutationCache, QueryClient } from '@tanstack/react-query';
import { APP_CONFIG } from '@/shared/config/app-config';
import { logger } from '@/shared/lib/monitoring';
import { notifyGlobalMutationError } from './global-mutation-error';

export const createQueryClient = () => {
  return new QueryClient({
    mutationCache: new MutationCache({
      onError: (error) => {
        const mappedError = notifyGlobalMutationError(error);

        logger.error('Mutation failed', error as Error, {
          mutationErrorMessage: mappedError.message,
          mutationErrorStatusCode: mappedError.statusCode,
        });
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: APP_CONFIG.query.staleTimeMs,
        gcTime: APP_CONFIG.query.gcTimeMs,
        retry: APP_CONFIG.query.retry,
        refetchOnWindowFocus: APP_CONFIG.query.refetchOnWindowFocus,
      },
      mutations: {
        retry: 0,
      },
    },
  });
};
