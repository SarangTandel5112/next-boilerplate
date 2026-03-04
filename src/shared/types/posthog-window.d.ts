export {};

declare global {
  // eslint-disable-next-line ts/consistent-type-definitions -- declaration merging
  interface Window {
    posthog?: {
      capture: (event: string, properties?: Record<string, unknown>) => void;
      identify: (distinctId: string, properties?: Record<string, unknown>) => void;
      reset: () => void;
      isFeatureEnabled: (flag: string) => boolean;
      getFeatureFlagPayload: (flag: string) => unknown;
    };
  }
}
