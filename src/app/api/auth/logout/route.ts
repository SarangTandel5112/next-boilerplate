import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/server/auth/session';
import { withRouteHandler } from '@/server/errors/error-handler';

export const POST = withRouteHandler((options) => {
  options.logger.info('Admin logout completed');

  const response = NextResponse.json({
    success: true,
  });

  clearSessionCookie(response);

  return response;
});
