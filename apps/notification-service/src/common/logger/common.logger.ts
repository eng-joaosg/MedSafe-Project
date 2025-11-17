import { createLogger, format, transports, Logger } from 'winston';
import { TransformableInfo } from 'logform';

const { combine, timestamp, printf, colorize } = format;

const loggerInstance: Logger = createLogger({
  level: 'info',
  format: combine(
    colorize(),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    printf((info: TransformableInfo) => {
      const level = info.level;
      const ts = info.timestamp?.toString() ?? new Date().toISOString();
      const msg = typeof info.message === 'string' ? info.message : info.message != null ? JSON.stringify(info.message) : '';
      return `[${ts}] ${level}: ${msg}`;
    }),
  ),
  transports: [new transports.Console()],
});

function safeString(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (typeof error === 'number' || typeof error === 'boolean') return error.toString();
  if (error != null) return JSON.stringify(error);
  return '';
}

export abstract class CommonLogger {
  static info(this: void, serviceName: string, action: string, message: string | object, messageId?: string): void {
    const msg = typeof message === 'string' ? message : JSON.stringify(message);
    loggerInstance.info(`[${serviceName}] [${action}]${messageId ? ` [${messageId}]` : ''} ${msg}`);
  }

  static warn(this: void, serviceName: string, action: string, message: string | object, messageId?: string): void {
    const msg = typeof message === 'string' ? message : JSON.stringify(message);
    loggerInstance.warn(`[${serviceName}] [${action}]${messageId ? ` [${messageId}]` : ''} ${msg}`);
  }

  static error(this: void, serviceName: string, action: string, message: string | object, error?: unknown, messageId?: string): void {
    const msg = typeof message === 'string' ? message : JSON.stringify(message);
    const errMessage = safeString(error);
    const stack = error instanceof Error ? error.stack : undefined;
    loggerInstance.error(`[${serviceName}] [${action}]${messageId ? ` [${messageId}]` : ''} ${msg} ${errMessage}`);
    if (stack) loggerInstance.error(stack);
  }
}
