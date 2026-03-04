import type { HttpAdapter, HttpAdapterRequestConfig } from './http-adapter.interface';
import { ApiError } from '@/shared/lib/api/api-error';

type FetchAdapterOptions = {
  baseUrl?: string;
  defaultCache?: RequestCache;
  getDefaultHeaders?: () => Promise<Record<string, string> | undefined> | Record<string, string> | undefined;
};

const toUrl = (config: HttpAdapterRequestConfig, baseUrl?: string) => {
  const url = config.url.startsWith('http')
    ? new URL(config.url)
    : new URL(config.url, baseUrl);

  const entries = Object.entries(config.params ?? {});

  for (const [key, value] of entries) {
    if (value === undefined || value === null || value === '') {
      continue;
    }

    url.searchParams.set(key, String(value));
  }

  return url.toString();
};

const parseResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
};

export const createFetchAdapter = (options?: FetchAdapterOptions): HttpAdapter => {
  return {
    request: async <T>(config: HttpAdapterRequestConfig) => {
      const defaultHeaders = await options?.getDefaultHeaders?.();

      const response = await fetch(toUrl(config, options?.baseUrl), {
        method: config.method ?? 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...defaultHeaders,
          ...config.headers,
        },
        body: config.data === undefined ? undefined : JSON.stringify(config.data),
        signal: config.signal,
        cache: config.cache ?? options?.defaultCache,
        next: config.next,
      });

      const payload = await parseResponse(response);

      if (!response.ok) {
        const errorPayload = typeof payload === 'object' && payload !== null
          ? payload as { error?: { message?: string; details?: unknown }; requestId?: string }
          : undefined;

        throw new ApiError({
          statusCode: response.status,
          message: errorPayload?.error?.message ?? 'Unable to process the request',
          details: errorPayload?.error?.details ?? payload,
        });
      }

      if (
        typeof payload === 'object'
        && payload !== null
        && 'success' in payload
        && 'data' in payload
      ) {
        return (payload as { data: T }).data;
      }

      return payload as T;
    },
  };
};
