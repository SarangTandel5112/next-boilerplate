import type { CounterResponse } from '../types/counter.types';
import { Env } from '@/libs/Env';
import { apiClient } from '@/modules/common/services/api.service';

let mockCount = 0;

/**
 * Determines if mock data should be used.
 * Returns true when API URL is not configured.
 */
const shouldUseMock = () => {
  return !Env.NEXT_PUBLIC_API_BASE_URL;
};

/**
 * Service for counter operations.
 * Handles communication with counter API or mock data.
 */
export const CounterService = {
  /**
   * Fetches current counter value.
   * @param options - Fetch options including cache configuration
   * @returns Counter response with current count
   */
  async getCounter(options?: RequestInit): Promise<CounterResponse> {
    if (shouldUseMock()) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { count: mockCount };
    }

    return apiClient.get<CounterResponse>('/counter', options);
  },

  /**
   * Increments counter by specified value.
   * @param increment - Value to increment by (1-3)
   * @returns Updated counter value
   */
  async incrementCounter(increment: number): Promise<CounterResponse> {
    if (shouldUseMock()) {
      await new Promise(resolve => setTimeout(resolve, 300));
      mockCount += increment;
      return { count: mockCount };
    }

    return apiClient.put<CounterResponse>('/counter', { increment });
  },

  /**
   * Resets counter to zero.
   * @returns Counter response with count of 0
   */
  async resetCounter(): Promise<CounterResponse> {
    if (shouldUseMock()) {
      await new Promise(resolve => setTimeout(resolve, 300));
      mockCount = 0;
      return { count: mockCount };
    }

    return apiClient.post<CounterResponse>('/counter/reset', {});
  },
};
