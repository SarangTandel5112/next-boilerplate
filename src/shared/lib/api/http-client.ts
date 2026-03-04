import type { HttpAdapter, HttpAdapterRequestConfig } from '@/shared/lib/http/http-adapter.interface';
import axios, { AxiosHeaders } from 'axios';
import { Env } from '@/shared/config/env';
import { normalizeApiError } from './error-normalizer';

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

export const httpClient = axios.create({
  baseURL: Env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

httpClient.interceptors.request.use((config) => {
  if (typeof window === 'undefined') {
    return config;
  }

  const requestId = getBrowserSessionRequestId();

  if (!requestId) {
    return config;
  }

  const headers = AxiosHeaders.from(config.headers ?? {});
  headers.set('x-request-id', requestId);
  config.headers = headers;

  return config;
});

httpClient.interceptors.response.use(
  response => response,
  (error: unknown) => {
    const normalized = normalizeApiError(error);

    if (typeof window !== 'undefined' && normalized.statusCode === 401 && window.location.pathname !== '/login') {
      window.location.assign('/login');
    }

    return Promise.reject(normalized);
  },
);

export const httpAdapter: HttpAdapter = {
  request: async <T>(config: HttpAdapterRequestConfig) => {
    const response = await httpClient.request<T>({
      url: config.url,
      method: config.method,
      params: config.params,
      data: config.data,
      headers: config.headers,
      signal: config.signal,
    });

    return response.data;
  },
};
