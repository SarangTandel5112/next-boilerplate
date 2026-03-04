import { createEnv } from '@t3-oss/env-nextjs';
import * as z from 'zod';

const BCRYPT_HASH_PATTERN = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

export const Env = createEnv({
  server: {
    AUTH_SESSION_SECRET: z.string().min(32).optional(),
    AUTH_ADMIN_EMAIL: z.string().email().optional(),
    AUTH_ADMIN_PASSWORD: z.string().min(8).optional(),
    AUTH_SESSION_PREVIOUS_SECRETS: z.string().optional(),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).optional(),
    AUTH_LOGIN_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
    AUTH_LOGIN_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
    REDIS_URL: z.string().url().optional(),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().optional(),
    NEXT_PUBLIC_API_BASE_URL: z.string().optional(),
    NEXT_PUBLIC_DATA_SOURCE: z.enum(['auto', 'api', 'local']).default('auto'),
    NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN: z.string().optional(),
    NEXT_PUBLIC_BETTER_STACK_INGESTING_HOST: z.string().optional(),
    NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
    NEXT_PUBLIC_POSTHOG_HOST: z.string().optional(),
    NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
    NEXT_PUBLIC_SENTRY_DISABLED: z.string().optional(),
    NEXT_PUBLIC_LOGGING_LEVEL: z.enum(['error', 'info', 'debug', 'warning', 'trace', 'fatal']).default('info'),
  },
  shared: {
    NODE_ENV: z.enum(['test', 'development', 'production']).optional(),
  },
  // You need to destructure all the keys manually
  runtimeEnv: {
    AUTH_SESSION_SECRET: process.env.AUTH_SESSION_SECRET,
    AUTH_ADMIN_EMAIL: process.env.AUTH_ADMIN_EMAIL,
    AUTH_ADMIN_PASSWORD: process.env.AUTH_ADMIN_PASSWORD,
    AUTH_SESSION_PREVIOUS_SECRETS: process.env.AUTH_SESSION_PREVIOUS_SECRETS,
    LOG_LEVEL: process.env.LOG_LEVEL,
    AUTH_LOGIN_RATE_LIMIT_MAX: process.env.AUTH_LOGIN_RATE_LIMIT_MAX,
    AUTH_LOGIN_RATE_LIMIT_WINDOW_MS: process.env.AUTH_LOGIN_RATE_LIMIT_WINDOW_MS,
    REDIS_URL: process.env.REDIS_URL,
    NEXT_PUBLIC_LOGGING_LEVEL: process.env.NEXT_PUBLIC_LOGGING_LEVEL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_DATA_SOURCE: process.env.NEXT_PUBLIC_DATA_SOURCE,
    NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN: process.env.NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN,
    NEXT_PUBLIC_BETTER_STACK_INGESTING_HOST: process.env.NEXT_PUBLIC_BETTER_STACK_INGESTING_HOST,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_SENTRY_DISABLED: process.env.NEXT_PUBLIC_SENTRY_DISABLED,
    NODE_ENV: process.env.NODE_ENV,
  },
});

const requireServerEnvValue = (value: string | undefined, key: string) => {
  const normalized = value?.trim();

  if (!normalized) {
    throw new Error(`[Env] Missing required environment variable: ${key}`);
  }

  return normalized;
};

const enforceProductionEnv = () => {
  if (Env.NODE_ENV !== 'production') {
    return;
  }

  const missingKeys: string[] = [];

  if (!Env.AUTH_SESSION_SECRET?.trim()) {
    missingKeys.push('AUTH_SESSION_SECRET');
  }

  if (!Env.AUTH_ADMIN_EMAIL?.trim()) {
    missingKeys.push('AUTH_ADMIN_EMAIL');
  }

  if (!Env.AUTH_ADMIN_PASSWORD?.trim()) {
    missingKeys.push('AUTH_ADMIN_PASSWORD');
  }

  if (!Env.REDIS_URL?.trim()) {
    missingKeys.push('REDIS_URL');
  }

  if (missingKeys.length > 0) {
    throw new Error(`[Env] Missing required production environment variables: ${missingKeys.join(', ')}`);
  }

  const authAdminPassword = Env.AUTH_ADMIN_PASSWORD!;

  if (!BCRYPT_HASH_PATTERN.test(authAdminPassword)) {
    throw new Error('[Env] AUTH_ADMIN_PASSWORD must be a bcrypt hash in production');
  }
};

enforceProductionEnv();

export const getAuthSessionSecret = () => {
  return requireServerEnvValue(Env.AUTH_SESSION_SECRET, 'AUTH_SESSION_SECRET');
};

export const getAuthAdminEmail = () => {
  return requireServerEnvValue(Env.AUTH_ADMIN_EMAIL, 'AUTH_ADMIN_EMAIL');
};

export const getAuthAdminPasswordHash = () => {
  const value = requireServerEnvValue(Env.AUTH_ADMIN_PASSWORD, 'AUTH_ADMIN_PASSWORD');

  if (!BCRYPT_HASH_PATTERN.test(value)) {
    throw new Error('[Env] AUTH_ADMIN_PASSWORD must be a bcrypt hash');
  }

  return value;
};

export const getSessionSigningSecrets = () => {
  const primarySecret = getAuthSessionSecret();
  const previousSecrets = Env.AUTH_SESSION_PREVIOUS_SECRETS
    ?.split(',')
    .map(secret => secret.trim())
    .filter(Boolean)
    ?? [];

  const secrets = [primarySecret, ...previousSecrets];

  const hasInvalidSecret = secrets.some(secret => secret.length < 32);

  if (hasInvalidSecret) {
    throw new Error('[Env] Session signing secrets must be at least 32 characters');
  }

  return secrets;
};
