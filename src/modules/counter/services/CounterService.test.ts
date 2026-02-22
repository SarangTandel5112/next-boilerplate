import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CounterService } from './CounterService';

describe('CounterService', () => {
  const mockFetch = vi.fn();
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalEnv = process.env.NEXT_PUBLIC_API_BASE_URL;
    globalThis.fetch = mockFetch;
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_API_BASE_URL = originalEnv;
    vi.clearAllMocks();
  });

  describe('getCounter', () => {
    it('returns counter data from API when URL configured', async () => {
      process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api.example.com';
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ count: 5 }),
      });

      const result = await CounterService.getCounter();

      expect(result.count).toBe(5);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/counter'),
        expect.objectContaining({ method: 'GET' }),
      );
    });

    it('uses mock data when API URL not configured', async () => {
      process.env.NEXT_PUBLIC_API_BASE_URL = '';

      const result = await CounterService.getCounter();

      expect(result).toHaveProperty('count');
      expect(typeof result.count).toBe('number');
    });

    it('throws when API request fails', async () => {
      process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api.example.com';
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(CounterService.getCounter()).rejects.toThrow();
    });
  });

  describe('incrementCounter', () => {
    it('increments counter by specified value via API', async () => {
      process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api.example.com';
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ count: 8 }),
      });

      const result = await CounterService.incrementCounter(3);

      expect(result.count).toBe(8);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/counter'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ increment: 3 }),
        }),
      );
    });
  });
});
