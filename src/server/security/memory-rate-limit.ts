import type { RateLimitIncrementOptions, RateLimitIncrementResult, RateLimitStore } from './rate-limit.interface';

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

export class MemoryRateLimitStore implements RateLimitStore {
  private store = new Map<string, RateLimitEntry>();

  async increment(options: RateLimitIncrementOptions): Promise<RateLimitIncrementResult> {
    const now = Date.now();
    const existingEntry = this.store.get(options.key);

    if (!existingEntry || now >= existingEntry.resetAt) {
      const nextEntry: RateLimitEntry = {
        count: 1,
        resetAt: now + options.windowMs,
      };

      this.store.set(options.key, nextEntry);

      return nextEntry;
    }

    const nextEntry: RateLimitEntry = {
      count: existingEntry.count + 1,
      resetAt: existingEntry.resetAt,
    };

    this.store.set(options.key, nextEntry);

    return nextEntry;
  }
}
