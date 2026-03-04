'use client';

import { createFetchAdapter } from './fetcher';

const CLIENT_REQUEST_ID_STORAGE_KEY = 'client_request_id';
let browserSessionRequestId: string | undefined;

const getBrowserSessionRequestId = () => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  if (browserSessionRequestId) {
    return browserSessionRequestId;
  }

  const storedRequestId = window.sessionStorage.getItem(CLIENT_REQUEST_ID_STORAGE_KEY);

  if (storedRequestId) {
    browserSessionRequestId = storedRequestId;
    return browserSessionRequestId;
  }

  const nextRequestId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  window.sessionStorage.setItem(CLIENT_REQUEST_ID_STORAGE_KEY, nextRequestId);
  browserSessionRequestId = nextRequestId;

  return browserSessionRequestId;
};

export const clientFetcher = createFetchAdapter({
  defaultCache: 'no-store',
  getDefaultHeaders: () => {
    const requestId = getBrowserSessionRequestId();

    if (!requestId) {
      return undefined;
    }

    return {
      'x-request-id': requestId,
    };
  },
});
