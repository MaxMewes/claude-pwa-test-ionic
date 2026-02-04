/**
 * Global logger singleton.
 * Automatically disabled in production builds.
 */

const isDev = import.meta.env.DEV;

export const logger = {
  debug: (...args: unknown[]) => isDev && console.debug(...args),
  info: (...args: unknown[]) => isDev && console.info(...args),
  warn: (...args: unknown[]) => isDev && console.warn(...args),
  error: (...args: unknown[]) => isDev && console.error(...args),
  log: (...args: unknown[]) => isDev && console.log(...args),
};
