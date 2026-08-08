/**
 * Enterprise Observability & Logger Layer
 * Captures all application logs, AI failures, and performance metrics.
 * Prepared for future integration with Datadog, Sentry, or LogRocket.
 */

export const LogLevel = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  DEBUG: 'DEBUG',
} as const;

export type LogLevel = typeof LogLevel[keyof typeof LogLevel];

interface LogContext {
  domain: 'REVIEWS' | 'MODERATION' | 'ANALYTICS' | 'INVITATIONS' | 'ADMIN' | 'SYSTEM' | 'AUTH';
  action?: string;
  userId?: string;
  [key: string]: any;
}

class LoggerService {
  private formatMessage(level: LogLevel, message: string, context: LogContext) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] [${context.domain}] ${message} | Context: ${JSON.stringify(context)}`;
  }

  info(message: string, context: LogContext) {
    console.info(this.formatMessage(LogLevel.INFO, message, context));
    // TODO: Send to external monitoring service
  }

  warn(message: string, context: LogContext) {
    console.warn(this.formatMessage(LogLevel.WARN, message, context));
  }

  error(error: Error | string, context: LogContext) {
    const message = error instanceof Error ? error.message : error;
    console.error(this.formatMessage(LogLevel.ERROR, message, context));
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
    // TODO: Send to Sentry
  }

  debug(message: string, context: LogContext) {
    if (import.meta.env.DEV) {
      console.debug(this.formatMessage(LogLevel.DEBUG, message, context));
    }
  }

  /**
   * Tracks performance of an asynchronous operation
   */
  async trackPerformance<T>(name: string, context: LogContext, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.info(`Performance: ${name} took ${duration.toFixed(2)}ms`, context);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.error(`Performance Failed: ${name} after ${duration.toFixed(2)}ms`, { ...context, error });
      throw error;
    }
  }
}

export const logger = new LoggerService();
