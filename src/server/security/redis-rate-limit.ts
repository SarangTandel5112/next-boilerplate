import type { RateLimitIncrementOptions, RateLimitIncrementResult, RateLimitStore } from './rate-limit.interface';
import { createClient } from 'redis';
import { AppError } from '@/server/errors/app-error';

type RedisRateLimitStoreOptions = {
  redisUrl: string;
};

export class RedisRateLimitStore implements RateLimitStore {
  private redisClientPromise?: Promise<ReturnType<typeof createClient>>;

  private redisUrl: string;

  constructor(options: RedisRateLimitStoreOptions) {
    this.redisUrl = options.redisUrl;
  }

  private async getClient() {
    if (!this.redisClientPromise) {
      this.redisClientPromise = (async () => {
        const client = createClient({
          url: this.redisUrl,
        });

        client.on('error', () => {
          // Redis client errors are handled during command execution.
        });

        await client.connect();

        return client;
      })();
    }

    const redisClientPromise = this.redisClientPromise;

    if (!redisClientPromise) {
      throw new Error('[RateLimit] Redis client initialization failed');
    }

    return redisClientPromise;
  }

  async increment(options: RateLimitIncrementOptions): Promise<RateLimitIncrementResult> {
    try {
      const client = await this.getClient();
      const namespacedKey = `rate-limit:${options.key}`;
      const count = await client.incr(namespacedKey);

      if (count === 1) {
        await client.pExpire(namespacedKey, options.windowMs);
      }

      const ttlMs = await client.pTTL(namespacedKey);

      return {
        count,
        resetAt: Date.now() + Math.max(0, ttlMs),
      };
    } catch {
      throw new AppError({
        code: 'RATE_LIMIT_UNAVAILABLE',
        message: 'Rate limiting service unavailable',
        statusCode: 503,
      });
    }
  }
}
