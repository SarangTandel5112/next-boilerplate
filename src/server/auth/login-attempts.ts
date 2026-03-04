import { AppError } from '@/server/errors/app-error';

const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

type LoginAttemptState = {
  failedCount: number;
  lockedUntil: number | null;
};

const loginAttempts = new Map<string, LoginAttemptState>();

const normalizeIdentifier = (identifier: string) => {
  return identifier.trim().toLowerCase();
};

const getRemainingLockMs = (state: LoginAttemptState, now: number) => {
  if (!state.lockedUntil) {
    return 0;
  }

  return Math.max(0, state.lockedUntil - now);
};

export const assertAccountNotLocked = (identifier: string) => {
  const normalizedIdentifier = normalizeIdentifier(identifier);
  const state = loginAttempts.get(normalizedIdentifier);

  if (!state?.lockedUntil) {
    return;
  }

  const now = Date.now();
  const remainingLockMs = getRemainingLockMs(state, now);

  if (remainingLockMs <= 0) {
    loginAttempts.delete(normalizedIdentifier);
    return;
  }

  throw new AppError({
    code: 'AUTH_ACCOUNT_LOCKED',
    message: 'Account temporarily locked',
    statusCode: 423,
    details: {
      retryAfterMs: remainingLockMs,
    },
  });
};

export const registerFailedLoginAttempt = (identifier: string) => {
  const normalizedIdentifier = normalizeIdentifier(identifier);
  const currentState = loginAttempts.get(normalizedIdentifier) ?? {
    failedCount: 0,
    lockedUntil: null,
  };
  const now = Date.now();

  if (currentState.lockedUntil && currentState.lockedUntil > now) {
    return {
      isLocked: true,
      retryAfterMs: currentState.lockedUntil - now,
      failedCount: currentState.failedCount,
    };
  }

  const failedCount = currentState.failedCount + 1;
  const nextState: LoginAttemptState = {
    failedCount,
    lockedUntil: failedCount >= MAX_FAILED_LOGIN_ATTEMPTS
      ? now + LOCK_DURATION_MS
      : null,
  };

  loginAttempts.set(normalizedIdentifier, nextState);

  return {
    isLocked: Boolean(nextState.lockedUntil),
    retryAfterMs: nextState.lockedUntil ? nextState.lockedUntil - now : 0,
    failedCount,
  };
};

export const clearLoginAttempts = (identifier: string) => {
  loginAttempts.delete(normalizeIdentifier(identifier));
};
