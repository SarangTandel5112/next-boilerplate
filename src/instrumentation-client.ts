import * as Sentry from '@sentry/nextjs';
import posthog from 'posthog-js';
import { Env } from '@/shared/config/env';

if (!Env.NEXT_PUBLIC_SENTRY_DISABLED) {
  Sentry.init({
    dsn: Env.NEXT_PUBLIC_SENTRY_DSN,
    integrations: [
      Sentry.replayIntegration({
        maskAllText: false,
        maskAllInputs: false,
        blockAllMedia: false,
      }),
      Sentry.consoleLoggingIntegration(),
      Sentry.browserTracingIntegration(),
      ...(Env.NODE_ENV === 'development' ? [Sentry.spotlightBrowserIntegration()] : []),
    ],
    sendDefaultPii: false,
    tracesSampleRate: 1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1,
    enableLogs: true,
    debug: false,
  });
}

if (Env.NEXT_PUBLIC_POSTHOG_KEY && Env.NEXT_PUBLIC_POSTHOG_HOST) {
  posthog.init(Env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: Env.NEXT_PUBLIC_POSTHOG_HOST,
    capture_pageview: false,
    autocapture: true,
    loaded(instance) {
      if (Env.NODE_ENV === 'development') {
        instance.debug();
      }
    },
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
