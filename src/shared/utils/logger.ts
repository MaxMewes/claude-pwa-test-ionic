/**
 * Logger utility that respects environment settings.
 * Logs are only output in development mode to prevent information leakage in production.
 */

const isDev = import.meta.env.DEV;

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerOptions {
  /** Prefix for log messages */
  prefix?: string;
}

/**
 * Creates a logger instance with optional prefix.
 * All logs are suppressed in production builds.
 */
export function createLogger(options: LoggerOptions = {}) {
  const prefix = options.prefix ? `[${options.prefix}]` : '';

  const log = (level: LogLevel, ...args: unknown[]) => {
    if (!isDev) return;

    const message = prefix ? [prefix, ...args] : args;

    switch (level) {
      case 'debug':
        console.debug(...message);
        break;
      case 'info':
        console.info(...message);
        break;
      case 'warn':
        console.warn(...message);
        break;
      case 'error':
        console.error(...message);
        break;
    }
  };

  return {
    debug: (...args: unknown[]) => log('debug', ...args),
    info: (...args: unknown[]) => log('info', ...args),
    warn: (...args: unknown[]) => log('warn', ...args),
    error: (...args: unknown[]) => log('error', ...args),
    /** Alias for info */
    log: (...args: unknown[]) => log('info', ...args),
  };
}

/** Default logger instance */
export const logger = createLogger();

/** API logger */
export const apiLogger = createLogger({ prefix: 'API' });

/** Auth logger */
export const authLogger = createLogger({ prefix: 'AUTH' });

/** Scanner logger */
export const scannerLogger = createLogger({ prefix: 'SCANNER' });
