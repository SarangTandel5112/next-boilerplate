import { AppError } from '@/server/errors/app-error';

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitBucket>();

export const getClientIp = (request: Request) => {
  const forwarded = request.headers.get('x-forwarded-for');

  if (forwarded) {
    return forwarded.split(',')[0]?.trim() ?? 'unknown';
  }

  const realIp = request.headers.get('x-real-ip');

  if (realIp) {
    return realIp.trim();
  }

  const cfIp = request.headers.get('cf-connecting-ip');

  if (cfIp) {
    return cfIp.trim();
  }

  return 'unknown';
};

export const assertRateLimit = (options: {
  key: string;
  limit: number;
  windowMs: number;
}) => {
  const now = Date.now();
  const existingBucket = rateLimitStore.get(options.key);

  if (!existingBucket || existingBucket.resetAt <= now) {
    rateLimitStore.set(options.key, {
      count: 1,
      resetAt: now + options.windowMs,
    });
    return;
  }

  if (existingBucket.count >= options.limit) {
    throw new AppError({
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests',
      statusCode: 429,
      details: {
        retryAfterMs: existingBucket.resetAt - now,
      },
    });
  }

  existingBucket.count += 1;
  rateLimitStore.set(options.key, existingBucket);
};
