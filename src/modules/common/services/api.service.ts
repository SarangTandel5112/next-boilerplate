import { Env } from '@/libs/Env';

/**
 * Base API client for making HTTP requests to external APIs.
 * Provides standardized error handling and request configuration.
 */
export class ApiClient {
  private getBaseUrl: () => string;

  constructor(getBaseUrl: string | (() => string)) {
    this.getBaseUrl
      = typeof getBaseUrl === 'function' ? getBaseUrl : () => getBaseUrl;
  }

  private get baseUrl(): string {
    return this.getBaseUrl();
  }

  /**
   * Performs a GET request.
   * @param path - API endpoint path
   * @param options - Fetch options including cache configuration
   * @returns Typed response data
   */
  async get<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new ApiError(
        `GET ${path} failed: ${response.statusText}`,
        response.status,
      );
    }

    return response.json();
  }

  /**
   * Performs a POST request.
   * @param path - API endpoint path
   * @param body - Request body
   * @param options - Fetch options
   * @returns Typed response data
   */
  async post<T>(path: string, body: unknown, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new ApiError(
        `POST ${path} failed: ${response.statusText}`,
        response.status,
      );
    }

    return response.json();
  }

  /**
   * Performs a PUT request.
   * @param path - API endpoint path
   * @param body - Request body
   * @param options - Fetch options
   * @returns Typed response data
   */
  async put<T>(path: string, body: unknown, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new ApiError(
        `PUT ${path} failed: ${response.statusText}`,
        response.status,
      );
    }

    return response.json();
  }

  /**
   * Performs a DELETE request.
   * @param path - API endpoint path
   * @param options - Fetch options
   * @returns Typed response data
   */
  async delete<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new ApiError(
        `DELETE ${path} failed: ${response.statusText}`,
        response.status,
      );
    }

    return response.json();
  }
}

/**
 * Custom error class for API errors.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const apiClient = new ApiClient(
  (): string => Env.NEXT_PUBLIC_API_BASE_URL ?? '',
);
