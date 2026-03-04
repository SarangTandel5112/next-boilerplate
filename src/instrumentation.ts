import * as Sentry from '@sentry/nextjs';
import { Env } from '@/shared/config/env';

export async function register() {
  if (Env.NEXT_PUBLIC_SENTRY_DISABLED) {
    return;
  }

  Sentry.init({
    dsn: Env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1,
    sendDefaultPii: false,
    beforeSend(event) {
      if (event.request?.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
      }

      return event;
    },
  });
}

export const onRequestError = Sentry.captureRequestError;
