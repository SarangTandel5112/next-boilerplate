import type { NextRequest, NextResponse } from 'next/server';
import { AppError } from '@/server/errors/app-error';
import { Env } from '@/shared/config/env';
import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from '@/shared/config/security';

const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const CSRF_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 12;

const createCsrfToken = () => {
  return crypto.randomUUID().replace(/-/g, '');
};

const getCookieFromHeader = (cookieHeader: string | null, name: string) => {
  if (!cookieHeader) {
    return undefined;
  }

  const cookiePair = cookieHeader
    .split(';')
    .map(value => value.trim())
    .find(value => value.startsWith(`${name}=`));

  if (!cookiePair) {
    return undefined;
  }

  const rawValue = cookiePair.slice(name.length + 1);

  try {
    return decodeURIComponent(rawValue);
  } catch {
    return rawValue;
  }
};

export const ensureCsrfCookie = (request: NextRequest, response: NextResponse) => {
  const existingToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;

  if (existingToken) {
    return;
  }

  response.cookies.set({
    name: CSRF_COOKIE_NAME,
    value: createCsrfToken(),
    httpOnly: false,
    secure: Env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: CSRF_COOKIE_MAX_AGE_SECONDS,
  });
};

export const assertCsrfToken = (request: Request) => {
  if (!MUTATION_METHODS.has(request.method.toUpperCase())) {
    return;
  }

  const cookieToken = getCookieFromHeader(request.headers.get('cookie'), CSRF_COOKIE_NAME);
  const headerToken = request.headers.get(CSRF_HEADER_NAME);

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    throw new AppError({
      code: 'CSRF_TOKEN_INVALID',
      message: 'Invalid security token',
      statusCode: 403,
    });
  }
};
