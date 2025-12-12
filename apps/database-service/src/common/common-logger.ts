import { createLogger, format, transports, Logger } from 'winston';
import { TransformableInfo } from 'logform';
import { RequestContextService } from './request-context/context-context.service';

const { combine, timestamp, printf, colorize } = format;

const loggerInstance: Logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    colorize(),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    printf((info: TransformableInfo) => {
      const ts: string = (info.timestamp as string) ?? new Date().toISOString();
      const msg = typeof info.message === 'string' ? info.message : info.message != null ? JSON.stringify(info.message) : '';
      return `[${ts}] ${info.level}: ${msg}`;
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
  private static requestContext?: RequestContextService;

  static setRequestContext(context: RequestContextService) {
    this.requestContext = context;
  }

  private static getRequestId(): string | undefined {
    return this.requestContext?.get<string>('requestId');
  }

  private static formatMessage(serviceName: string, action: string, message: string | object): string {
    const requestId = this.getRequestId();
    const msg = typeof message === 'string' ? message : JSON.stringify(message);
    return `[${serviceName}] [${action}]${requestId ? ` [${requestId}]` : ''} ${msg}`;
  }

  static info(serviceName: string, action: string, message: string | object): void {
    loggerInstance.info(this.formatMessage(serviceName, action, message));
  }

  static warn(serviceName: string, action: string, message: string | object): void {
    loggerInstance.warn(this.formatMessage(serviceName, action, message));
  }

  static error(serviceName: string, action: string, message: string | object, error?: unknown): void {
    const baseMsg = this.formatMessage(serviceName, action, message);
    const errMessage = safeString(error);
    loggerInstance.error(`${baseMsg} ${errMessage}`);
    if (error instanceof Error && error.stack) {
      loggerInstance.error(error.stack);
    }
  }
}
