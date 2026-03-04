import { AppError } from '@/server/errors/app-error';

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

type AttemptState = {
  failedCount: number;
  lockedUntil?: number;
};

const attemptStore = new Map<string, AttemptState>();

const getKey = (email: string) => {
  return email.trim().toLowerCase();
};

export const assertAccountNotLocked = (email: string) => {
  const key = getKey(email);
  const state = attemptStore.get(key);
  const now = Date.now();

  if (!state?.lockedUntil || state.lockedUntil <= now) {
    if (state?.lockedUntil && state.lockedUntil <= now) {
      attemptStore.delete(key);
    }

    return;
  }

  throw new AppError({
    code: 'AUTH_ACCOUNT_LOCKED',
    message: 'Account temporarily locked',
    statusCode: 423,
    details: {
      retryAfterMs: state.lockedUntil - now,
    },
  });
};

export const registerFailedLoginAttempt = (email: string) => {
  const key = getKey(email);
  const now = Date.now();
  const state = attemptStore.get(key);

  if (state?.lockedUntil && state.lockedUntil > now) {
    return {
      isLocked: true,
      retryAfterMs: state.lockedUntil - now,
    };
  }

  const failedCount = (state?.failedCount ?? 0) + 1;

  if (failedCount >= MAX_FAILED_ATTEMPTS) {
    const lockedUntil = now + LOCK_DURATION_MS;
    attemptStore.set(key, {
      failedCount,
      lockedUntil,
    });

    return {
      isLocked: true,
      retryAfterMs: LOCK_DURATION_MS,
    };
  }

  attemptStore.set(key, {
    failedCount,
  });

  return {
    isLocked: false,
    retryAfterMs: 0,
  };
};

export const clearLoginAttempts = (email: string) => {
  attemptStore.delete(getKey(email));
};
