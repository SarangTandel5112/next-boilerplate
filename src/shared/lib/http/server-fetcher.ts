import { headers } from 'next/headers';
import { Env } from '@/shared/config/env';
import { createFetchAdapter } from './fetcher';
import 'server-only';

export const serverFetcher = createFetchAdapter({
  baseUrl: Env.NEXT_PUBLIC_APP_URL ?? Env.NEXT_PUBLIC_API_BASE_URL,
  defaultCache: 'no-store',
  getDefaultHeaders: async () => {
    const requestHeaders = await headers();
    const requestId = requestHeaders.get('x-request-id');

    if (!requestId) {
      return undefined;
    }

    return {
      'x-request-id': requestId,
    };
  },
});
