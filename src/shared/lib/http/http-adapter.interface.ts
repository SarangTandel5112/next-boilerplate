export type HttpAdapterMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type HttpAdapterRequestConfig = {
  url: string;
  method?: HttpAdapterMethod;
  params?: Record<string, unknown>;
  data?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  cache?: RequestCache;
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
};

export type HttpAdapter = {
  request: <T>(config: HttpAdapterRequestConfig) => Promise<T>;
};
