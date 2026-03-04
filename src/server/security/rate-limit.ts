import type { RateLimitStore } from './rate-limit.interface';
import { AppError } from '@/server/errors/app-error';
import { Env } from '@/shared/config/env';
import { MemoryRateLimitStore } from './memory-rate-limit';
import { RedisRateLimitStore } from './redis-rate-limit';

let rateLimitStore: RateLimitStore | undefined;

const resolveRateLimitStore = (): RateLimitStore => {
  if (rateLimitStore) {
    return rateLimitStore;
  }

  const isProduction = Env.NODE_ENV === 'production';
  const redisUrl = Env.REDIS_URL?.trim();

  if (isProduction && !redisUrl) {
    throw new Error('[RateLimit] REDIS_URL is required in production');
  }

  if (redisUrl) {
    rateLimitStore = new RedisRateLimitStore({
      redisUrl,
    });

    return rateLimitStore;
  }

  rateLimitStore = new MemoryRateLimitStore();

  return rateLimitStore;
};

export const getClientIp = (request: Request) => {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() ?? 'unknown';
  }

  return realIp ?? 'unknown';
};

export const assertRateLimit = async (options: {
  key: string;
  limit: number;
  windowMs: number;
}) => {
  try {
    const result = await resolveRateLimitStore().increment({
      key: options.key,
      windowMs: options.windowMs,
    });

    if (result.count > options.limit) {
      throw new AppError({
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests',
        statusCode: 429,
        details: {
          retryAfterMs: Math.max(0, result.resetAt - Date.now()),
        },
      });
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError({
      code: 'RATE_LIMIT_UNAVAILABLE',
      message: 'Rate limiting service unavailable',
      statusCode: 503,
    });
  }
};
