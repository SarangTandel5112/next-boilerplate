import { AxiosError } from 'axios';
import { ApiError } from './api-error';

const DEFAULT_MESSAGE = 'Unable to process the request';

export const normalizeApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof AxiosError) {
    return new ApiError({
      message: error.response?.data?.message ?? error.message ?? DEFAULT_MESSAGE,
      statusCode: error.response?.status ?? 500,
      details: error.response?.data,
    });
  }

  if (error instanceof Error) {
    return new ApiError({
      message: error.message,
      statusCode: 500,
    });
  }

  return new ApiError({
    message: DEFAULT_MESSAGE,
    statusCode: 500,
  });
};
