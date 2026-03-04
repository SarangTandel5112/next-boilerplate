'use client';

import { featureFlags } from '@/shared/lib/feature-flags';

/**
 * Returns whether a PostHog feature flag is enabled for the active user.
 * @param flag - Feature flag key from PostHog.
 * @returns Whether the feature is enabled.
 */
// eslint-disable-next-line react/no-unnecessary-use-prefix -- matches React hook naming convention
export const useFeatureFlag = (flag: string): boolean => {
  return featureFlags.isEnabled(flag);
};
