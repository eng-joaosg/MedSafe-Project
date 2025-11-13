/* eslint-disable @typescript-eslint/no-base-to-string */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { createLogger, format, transports, Logger } from 'winston';

const { combine, timestamp, printf, colorize } = format;

const loggerInstance: Logger = createLogger({
  level: 'info',
  format: combine(
    colorize(),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    printf(({ level, message, timestamp }) => `[${timestamp}] ${level}: ${message}`),
  ),
  transports: [new transports.Console()],
});

export interface LogErrorOptions {
  serviceName: string;
  action: string;
  identifier: string;
  start: number;
  error: unknown;
  status?: number;
}

export abstract class CommonLogger {
  static logStart(serviceName: string, action: string, identifier: string): number {
    loggerInstance.info(`[${serviceName}] [${action}] Iniciando: ${identifier}`);
    return Date.now();
  }
  static logSuccess(serviceName: string, action: string, identifier: string, start: number): void {
    const duration = Date.now() - start;
    loggerInstance.info(`[${serviceName}] [${action} SUCCESS] ${identifier} (${duration}ms)`);
  }

  static logError400({
    serviceName,
    action,
    identifier,
    start,
    error,
    status,
  }: LogErrorOptions): void {
    this.logErrorInternal('warn', {
      serviceName,
      action,
      identifier,
      start,
      error,
      status: status ?? 400,
    });
  }

  static logError500({
    serviceName,
    action,
    identifier,
    start,
    error,
    status,
  }: LogErrorOptions): void {
    this.logErrorInternal('error', {
      serviceName,
      action,
      identifier,
      start,
      error,
      status: status ?? 500,
    });
  }

  static info(serviceName: string, action: string, message: string): void {
    loggerInstance.info(`[${serviceName}] [${action}] ${message}`);
  }

  static warn(serviceName: string, action: string, message: string): void {
    loggerInstance.warn(`[${serviceName}] [${action}] ${message}`);
  }

  static error(serviceName: string, action: string, message: string, error?: unknown): void {
    const errMessage = error instanceof Error ? error.message : error ? String(error) : '';
    const stack = error instanceof Error ? error.stack : undefined;

    loggerInstance.error(`[${serviceName}] [${action}] ${message} ${errMessage}`);
    if (stack) {
      loggerInstance.error(stack);
    }
  }

  private static logErrorInternal(
    level: 'warn' | 'error',
    { serviceName, action, identifier, start, error, status }: Required<LogErrorOptions>,
  ): void {
    const duration = Date.now() - start;
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;

    loggerInstance[level](
      `[${serviceName}] [${action} FAIL ${status}] ${identifier} (${duration}ms) - ${message}`,
    );

    if (stack && level === 'error') {
      loggerInstance.error(stack);
    }
  }
}
