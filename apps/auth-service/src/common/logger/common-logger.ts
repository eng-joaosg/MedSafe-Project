/* eslint-disable @typescript-eslint/no-base-to-string */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { createLogger, format, transports, Logger } from 'winston';

const { combine, timestamp, printf, colorize } = format;

const loggerInstance: Logger = createLogger({
  level: 'info',
  format: combine(
    colorize(),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    printf(
      ({ level, message, timestamp }) => `[${timestamp}] ${level}: ${message}`,
    ),
  ),
  transports: [new transports.Console()],
});

export abstract class CommonLogger {
  static info(serviceName: string, action: string, message: string): void {
    loggerInstance.info(`[${serviceName}] [${action}] ${message}`);
  }

  static warn(serviceName: string, action: string, message: string): void {
    loggerInstance.warn(`[${serviceName}] [${action}] ${message}`);
  }

  static error(
    serviceName: string,
    action: string,
    message: string,
    error?: unknown,
  ): void {
    const errMessage =
      error instanceof Error ? error.message : error ? String(error) : '';
    const stack = error instanceof Error ? error.stack : undefined;

    loggerInstance.error(
      `[${serviceName}] [${action}] ${message} ${errMessage}`,
    );
    if (stack) {
      loggerInstance.error(stack);
    }
  }
}
