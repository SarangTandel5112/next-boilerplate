import { Env } from '@/libs/Env';
import { ApiError } from '../services/api.service';

/**
 * Converts an unknown error to a user-friendly message.
 * @param error - Error object
 * @returns User-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.statusCode === 404) {
      return 'Resource not found';
    }
    if (error.statusCode === 500) {
      return 'Server error. Please try again later';
    }
    if (error.statusCode >= 400 && error.statusCode < 500) {
      return 'Invalid request. Please check your input';
    }
    return 'Something went wrong';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}

/**
 * Checks if error is a network error.
 * @param error - Error to check
 * @returns True if network error
 */
export function isNetworkError(error: unknown): boolean {
  return (
    error instanceof TypeError && error.message === 'Failed to fetch'
  );
}

/**
 * Gets a safe error message for displaying to users.
 * Filters out sensitive information and provides user-friendly messages in production.
 * @param error - Error object
 * @returns Safe user-facing message
 */
export function getSafeErrorMessage(error: unknown): string {
  // In development or when logging is verbose, show detailed errors
  if (Env.NODE_ENV === 'development' || Env.NEXT_PUBLIC_LOGGING_LEVEL === 'debug') {
    return getErrorMessage(error);
  }

  if (error instanceof ApiError) {
    if (error.statusCode >= 500) {
      return 'Service temporarily unavailable. Please try again later.';
    }
    if (error.statusCode === 404) {
      return 'Resource not found';
    }
    if (error.statusCode === 403) {
      return 'Access denied';
    }
    return 'Request failed. Please try again.';
  }

  return 'An error occurred. Please try again.';
}
