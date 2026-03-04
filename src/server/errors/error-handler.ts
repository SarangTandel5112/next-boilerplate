import type { Logger } from 'pino';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { createRequestLogger } from '@/server/logging/logger';
import { assertCsrfToken } from '@/server/security/csrf';
import { AppError } from './app-error';

const isMutationMethod = (method: string) => {
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase());
};

const toAppError = (error: unknown) => {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof ZodError) {
    return new AppError({
      code: 'VALIDATION_ERROR',
      message: 'Invalid request payload',
      statusCode: 400,
      details: error.flatten(),
    });
  }

  if (error instanceof SyntaxError) {
    return new AppError({
      code: 'INVALID_JSON',
      message: 'Invalid JSON payload',
      statusCode: 400,
    });
  }

  if (error instanceof Error) {
    return new AppError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Unexpected server error',
      statusCode: 500,
      details: {
        originalMessage: error.message,
      },
    });
  }

  return new AppError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Unexpected server error',
    statusCode: 500,
  });
};

export const handleRouteError = (options: {
  error: unknown;
  requestId: string;
  logger: Logger;
}) => {
  const normalizedError = toAppError(options.error);

  options.logger.error({
    err: options.error,
    statusCode: normalizedError.statusCode,
    errorCode: normalizedError.code,
    errorDetails: normalizedError.details,
  }, normalizedError.message);

  return NextResponse.json({
    success: false,
    error: {
      code: normalizedError.code,
      message: normalizedError.message,
    },
    requestId: options.requestId,
  }, {
    status: normalizedError.statusCode,
  });
};

export const withRouteHandler = (
  handler: (options: { request: Request; requestId: string; logger: Logger }) => Promise<Response>,
  options?: { csrf?: 'required' | 'disabled' },
) => {
  return async (request: Request) => {
    const url = new URL(request.url);
    const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID();
    const requestLogger = createRequestLogger({
      requestId,
      method: request.method,
      pathname: url.pathname,
    });

    try {
      if ((options?.csrf ?? 'required') === 'required' && isMutationMethod(request.method)) {
        assertCsrfToken(request);
      }

      const response = await handler({
        request,
        requestId,
        logger: requestLogger,
      });

      response.headers.set('x-request-id', requestId);

      return response;
    } catch (error) {
      return handleRouteError({
        error,
        requestId,
        logger: requestLogger,
      });
    }
  };
};
