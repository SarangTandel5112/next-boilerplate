export class ApiError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(options: { message: string; statusCode?: number; details?: unknown }) {
    super(options.message);
    this.name = 'ApiError';
    this.statusCode = options.statusCode ?? 500;
    this.details = options.details;
  }
}
