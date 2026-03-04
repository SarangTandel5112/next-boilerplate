import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { hasRequiredRole, RBAC_ROLES } from '@/server/auth/rbac';
import { getSessionTokenFromRequest, verifySessionToken } from '@/server/auth/session';
import { ensureCsrfCookie } from '@/server/security/csrf';

const isDevelopment = process.env.NODE_ENV === 'development';
const REQUEST_ID_HEADER = 'x-request-id';

const buildCsp = (nonce: string) => {
  const connectSources = [
    '\'self\'',
    '*.posthog.com',
    '*.sentry.io',
    '*.vercel-insights.com',
    'vitals.vercel-insights.com',
    ...(isDevelopment
      ? [
          'http://localhost:8969',
          'ws://localhost:8969',
          'http://127.0.0.1:8969',
          'ws://127.0.0.1:8969',
        ]
      : []),
  ];

  return [
    'default-src \'self\'',
    `script-src 'self' 'nonce-${nonce}' *.posthog.com *.vercel-insights.com va.vercel-scripts.com`,
    `style-src 'self' 'nonce-${nonce}' 'unsafe-inline'`,
    `style-src-elem 'self' 'nonce-${nonce}'`,
    'img-src \'self\' blob: data: https:',
    'font-src \'self\' data:',
    `connect-src ${connectSources.join(' ')}`,
    'frame-ancestors \'self\'',
    'base-uri \'self\'',
    'form-action \'self\'',
  ].join('; ');
};

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const nonce = btoa(crypto.randomUUID()).replace(/=/g, '');
  const requestId = crypto.randomUUID();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set(REQUEST_ID_HEADER, requestId);
  const csp = buildCsp(nonce);

  const token = getSessionTokenFromRequest(request);
  const session = await verifySessionToken(token);
  let response: NextResponse;

  if (pathname.startsWith('/admin')) {
    if (!session || !hasRequiredRole(session.role, RBAC_ROLES.admin)) {
      const loginUrl = new URL('/login', request.url);
      const nextPath = `${pathname}${request.nextUrl.search}`;
      loginUrl.searchParams.set('next', nextPath);

      response = NextResponse.redirect(loginUrl);
      response.headers.set('Content-Security-Policy', csp);
      response.headers.set('x-nonce', nonce);
      response.headers.set(REQUEST_ID_HEADER, requestId);
      ensureCsrfCookie(request, response);
      return response;
    }
  }

  if (pathname === '/login' && session && hasRequiredRole(session.role, RBAC_ROLES.admin)) {
    response = NextResponse.redirect(new URL('/admin', request.url));
    response.headers.set('Content-Security-Policy', csp);
    response.headers.set('x-nonce', nonce);
    response.headers.set(REQUEST_ID_HEADER, requestId);
    ensureCsrfCookie(request, response);
    return response;
  }

  response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('x-nonce', nonce);
  response.headers.set(REQUEST_ID_HEADER, requestId);
  ensureCsrfCookie(request, response);

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
