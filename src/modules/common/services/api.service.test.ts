import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiClient, ApiError } from './api.service';

describe('ApiClient', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('get', () => {
    it('makes GET request and returns JSON', async () => {
      const mockData = { id: 1, name: 'Test' };
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const client = new ApiClient('https://api.example.com');
      const result = await client.get<typeof mockData>('/test');

      expect(result).toEqual(mockData);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({ method: 'GET' }),
      );
    });

    it('throws ApiError when request fails', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      const client = new ApiClient('https://api.example.com');

      await expect(client.get('/test')).rejects.toThrow(ApiError);
      await expect(client.get('/test')).rejects.toThrow('GET /test failed');
    });
  });

  describe('post', () => {
    it('makes POST request with body', async () => {
      const requestBody = { name: 'Test' };
      const responseData = { id: 1, ...requestBody };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => responseData,
      });

      const client = new ApiClient('https://api.example.com');
      const result = await client.post<typeof responseData>('/test', requestBody);

      expect(result).toEqual(responseData);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(requestBody),
        }),
      );
    });
  });
});
