/**
 * Response from counter API endpoints.
 */
export type CounterResponse = {
  count: number;
};

/**
 * Request body for incrementing counter.
 */
export type IncrementCounterRequest = {
  increment: number;
};
