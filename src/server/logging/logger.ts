export type RouteLogger = {
  debug: (...args: [string] | [Record<string, unknown>, string]) => void;
  info: (...args: [string] | [Record<string, unknown>, string]) => void;
  warn: (...args: [string] | [Record<string, unknown>, string]) => void;
  error: (...args: [string] | [Record<string, unknown>, string]) => void;
};

const toLogPayload = (args: [string] | [Record<string, unknown>, string]) => {
  if (typeof args[0] === 'string') {
    return {
      message: args[0],
      meta: undefined,
    };
  }

  return {
    message: args[1],
    meta: args[0],
  };
};

export const createRouteLogger = (context: {
  requestId: string;
  method: string;
  path: string;
}): RouteLogger => {
  const write = (
    level: 'debug' | 'info' | 'warn' | 'error',
    args: [string] | [Record<string, unknown>, string],
  ) => {
    const payload = toLogPayload(args);
    const entry = {
      level,
      requestId: context.requestId,
      method: context.method,
      path: context.path,
      message: payload.message,
      ...(payload.meta ? { meta: payload.meta } : {}),
    };

    if (level === 'error') {
      console.error(entry);
      return;
    }

    if (level === 'warn') {
      console.warn(entry);
      return;
    }

    if (level === 'debug') {
      console.warn(entry);
      return;
    }

    console.warn(entry);
  };

  return {
    debug: (...args) => write('debug', args),
    info: (...args) => write('info', args),
    warn: (...args) => write('warn', args),
    error: (...args) => write('error', args),
  };
};
