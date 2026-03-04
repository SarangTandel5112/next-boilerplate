import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { AppError } from '@/server/errors/app-error';
import { createRouteLogger } from '@/server/logging/logger';
import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from '@/shared/config/security';

type RouteParams = Record<string, string>;

export type RouteHandlerOptions<TParams extends RouteParams = RouteParams> = {
  logger: ReturnType<typeof createRouteLogger>;
  request: NextRequest;
  params?: TParams;
};

type RouteHandler<TParams extends RouteParams = RouteParams> = (
  options: RouteHandlerOptions<TParams>,
) => Promise<NextResponse> | NextResponse;

const shouldValidateCsrf = (request: NextRequest, csrf: 'enabled' | 'disabled') => {
  if (csrf === 'disabled') {
    return false;
  }

  const readMethods = ['GET', 'HEAD', 'OPTIONS'];
  return !readMethods.includes(request.method);
};

const validateCsrf = (request: NextRequest) => {
  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  const decodedCookie = cookieToken ? decodeURIComponent(cookieToken) : undefined;

  if (!decodedCookie || !headerToken || decodedCookie !== headerToken) {
    throw new AppError({
      code: 'CSRF_VALIDATION_FAILED',
      message: 'Invalid CSRF token',
      statusCode: 403,
    });
  }
};

const toAppError = (error: unknown) => {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError({
      code: 'INTERNAL_SERVER_ERROR',
      message: error.message || 'Internal server error',
      statusCode: 500,
    });
  }

  return new AppError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Internal server error',
    statusCode: 500,
  });
};

export const withRouteHandler = <TParams extends RouteParams = RouteParams>(
  handler: RouteHandler<TParams>,
  options?: {
    csrf?: 'enabled' | 'disabled';
  },
) => {
  return async (request: NextRequest, context?: { params?: Promise<TParams> }) => {
    const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID();
    const pathname = new URL(request.url).pathname;
    const logger = createRouteLogger({
      requestId,
      method: request.method,
      path: pathname,
    });

    try {
      if (shouldValidateCsrf(request, options?.csrf ?? 'enabled')) {
        validateCsrf(request);
      }

      const params = context?.params ? await context.params : undefined;
      const response = await handler({
        logger,
        request,
        params,
      });

      response.headers.set('x-request-id', requestId);

      return response;
    } catch (error) {
      const appError = toAppError(error);

      logger.error({
        code: appError.code,
        details: appError.details,
        statusCode: appError.statusCode,
      }, appError.message);

      return NextResponse.json({
        success: false,
        error: {
          code: appError.code,
          message: appError.message,
          ...(appError.details === undefined ? {} : { details: appError.details }),
        },
        requestId,
      }, {
        status: appError.statusCode,
        headers: {
          'x-request-id': requestId,
        },
      });
    }
  };
};
