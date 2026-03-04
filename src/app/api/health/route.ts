import { NextResponse } from 'next/server';
import { withRouteHandler } from '@/server/errors/error-handler';

export const GET = withRouteHandler((options) => {
  options.logger.debug('Health check requested');

  return NextResponse.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
  });
}, {
  csrf: 'disabled',
});
