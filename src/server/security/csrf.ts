import type { NextRequest, NextResponse } from 'next/server';
import { Env } from '@/shared/config/env';
import { CSRF_COOKIE_NAME } from '@/shared/config/security';

const CSRF_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 8;

const createCsrfToken = () => {
  return `${crypto.randomUUID()}${crypto.randomUUID()}`.replace(/-/g, '');
};

export const ensureCsrfCookie = (request: NextRequest, response: NextResponse) => {
  const existingCookie = request.cookies.get(CSRF_COOKIE_NAME)?.value;

  if (existingCookie) {
    return;
  }

  response.cookies.set({
    name: CSRF_COOKIE_NAME,
    value: encodeURIComponent(createCsrfToken()),
    httpOnly: false,
    secure: Env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: CSRF_COOKIE_MAX_AGE_SECONDS,
  });
};
