export type RateLimitIncrementOptions = {
  key: string;
  windowMs: number;
};

export type RateLimitIncrementResult = {
  count: number;
  resetAt: number;
};

export type RateLimitStore = {
  increment: (options: RateLimitIncrementOptions) => Promise<RateLimitIncrementResult>;
};
