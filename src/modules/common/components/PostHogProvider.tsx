'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect, useState } from 'react';
import { Env } from '@/libs/Env';
import { SuspendedPostHogPageView } from './PostHogPageView';

/**
 * PostHog analytics provider with optimized lazy initialization.
 * Initializes PostHog after page becomes interactive to avoid blocking render.
 * @param props - Component props.
 * @param props.children - Child elements to wrap with the provider.
 */
export const PostHogProvider = (props: { children: React.ReactNode }) => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect((): (() => void) | undefined => {
    // Only initialize if key is configured
    if (!Env.NEXT_PUBLIC_POSTHOG_KEY) {
      return undefined;
    }

    // Lazy initialize after page is interactive
    if (typeof window !== 'undefined' && !isInitialized) {
      // Delay initialization to not block main thread
      const timeoutId = setTimeout(() => {
        posthog.init(Env.NEXT_PUBLIC_POSTHOG_KEY!, {
          api_host: Env.NEXT_PUBLIC_POSTHOG_HOST,
          capture_pageview: false, // Disable automatic pageview capture, as we capture manually
          capture_pageleave: true, // Enable pageleave capture
          loaded: () => {
            setIsInitialized(true);
          },
        });
      }, 100); // Small delay to let critical render complete

      return () => clearTimeout(timeoutId);
    }

    return undefined;
  }, [isInitialized]);

  if (!Env.NEXT_PUBLIC_POSTHOG_KEY) {
    return props.children;
  }

  return (
    <PHProvider client={posthog}>
      {isInitialized && <SuspendedPostHogPageView />}
      {props.children}
    </PHProvider>
  );
};
