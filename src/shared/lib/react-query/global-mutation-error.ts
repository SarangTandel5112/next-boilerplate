import { ApiError } from '@/shared/lib/api';

export type GlobalMutationError = {
  message: string;
  statusCode?: number;
  details?: unknown;
};

type MutationErrorListener = (error: GlobalMutationError) => void;

const mutationErrorListeners = new Set<MutationErrorListener>();

const getFallbackMessage = (statusCode?: number) => {
  if (statusCode === 401) {
    return 'Session expired. Please sign in again.';
  }

  if (statusCode === 403) {
    return 'You are not allowed to perform this action.';
  }

  if (statusCode === 409) {
    return 'Conflicting data detected. Refresh and try again.';
  }

  if (statusCode === 429) {
    return 'Too many requests. Please wait and try again.';
  }

  if (statusCode && statusCode >= 500) {
    return 'Something went wrong on the server. Please try later.';
  }

  return 'Unable to complete the request.';
};

export const mapGlobalMutationError = (error: unknown): GlobalMutationError => {
  if (error instanceof ApiError) {
    return {
      message: error.message || getFallbackMessage(error.statusCode),
      statusCode: error.statusCode,
      details: error.details,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message || getFallbackMessage(),
    };
  }

  return {
    message: getFallbackMessage(),
  };
};

export const notifyGlobalMutationError = (error: unknown) => {
  const mappedError = mapGlobalMutationError(error);

  for (const listener of mutationErrorListeners) {
    listener(mappedError);
  }

  return mappedError;
};

export const subscribeGlobalMutationError = (listener: MutationErrorListener) => {
  mutationErrorListeners.add(listener);

  return () => {
    mutationErrorListeners.delete(listener);
  };
};
