import pino from 'pino';
import { Env } from '@/shared/config/env';

const toServerLogLevel = () => {
  if (Env.LOG_LEVEL) {
    return Env.LOG_LEVEL;
  }

  if (Env.NEXT_PUBLIC_LOGGING_LEVEL === 'warning') {
    return 'warn';
  }

  return Env.NEXT_PUBLIC_LOGGING_LEVEL;
};

export const logger = pino({
  level: toServerLogLevel(),
  base: undefined,
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      'password',
      '*.password',
      'req.headers.authorization',
      'req.headers.cookie',
      'headers.authorization',
      'headers.cookie',
    ],
    remove: true,
  },
});

export const createRequestLogger = (options: {
  requestId: string;
  method: string;
  pathname: string;
}) => {
  return logger.child({
    requestId: options.requestId,
    requestMethod: options.method,
    requestPath: options.pathname,
  });
};
