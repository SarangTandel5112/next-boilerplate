import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../services/api.service';
import {
  getErrorMessage,
  getSafeErrorMessage,
  isNetworkError,
} from './error.helper';

describe('error.helper', () => {
  describe('getErrorMessage', () => {
    it('returns message for ApiError with 404', () => {
      const error = new ApiError('Not found', 404);

      expect(getErrorMessage(error)).toBe('Resource not found');
    });

    it('returns message for ApiError with 500', () => {
      const error = new ApiError('Server error', 500);

      expect(getErrorMessage(error)).toBe(
        'Server error. Please try again later',
      );
    });

    it('returns message for Error instance', () => {
      const error = new Error('Custom error');

      expect(getErrorMessage(error)).toBe('Custom error');
    });

    it('returns default message for unknown error', () => {
      expect(getErrorMessage('string error')).toBe(
        'An unexpected error occurred',
      );
    });
  });

  describe('getSafeErrorMessage', () => {
    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it('returns generic message in production for 500', () => {
      vi.stubEnv('NODE_ENV', 'production');

      const error = new ApiError('Internal details', 500);
      const message = getSafeErrorMessage(error);

      expect(message).not.toContain('Internal details');
      expect(message).toContain('Service temporarily unavailable');
    });
  });

  describe('isNetworkError', () => {
    it('returns true for Failed to fetch TypeError', () => {
      const error = new TypeError('Failed to fetch');

      expect(isNetworkError(error)).toBe(true);
    });

    it('returns false for other errors', () => {
      expect(isNetworkError(new Error('Other'))).toBe(false);
      expect(isNetworkError(new ApiError('Not found', 404))).toBe(false);
    });
  });
});
