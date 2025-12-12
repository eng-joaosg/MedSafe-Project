import { createLogger, format, transports, Logger } from 'winston';
import { TransformableInfo } from 'logform';
import { RequestContextService } from './request-context/context-context.service';

const { combine, timestamp, printf, colorize } = format;
const logFilePath = '/var/log/medsafe-database-service.log';

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
  transports: [new transports.Console(), new transports.File({ filename: logFilePath, level: 'info' })],
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

  static info(serviceName: string, action: string, message: string | object): void {
    const requestId = this.getRequestId();
    const msg = typeof message === 'string' ? message : JSON.stringify(message);
    loggerInstance.info(`[${serviceName}] [${action}]${requestId ? ` [${requestId}]` : ''} ${msg}`);
  }

  static warn(serviceName: string, action: string, message: string | object): void {
    const requestId = this.getRequestId();
    const msg = typeof message === 'string' ? message : JSON.stringify(message);
    loggerInstance.warn(`[${serviceName}] [${action}]${requestId ? ` [${requestId}]` : ''} ${msg}`);
  }

  static error(serviceName: string, action: string, message: string | object, error?: unknown): void {
    const requestId = this.getRequestId();
    const msg = typeof message === 'string' ? message : JSON.stringify(message);
    const errMessage = safeString(error);
    const stack = error instanceof Error ? error.stack : undefined;

    loggerInstance.error(`[${serviceName}] [${action}]${requestId ? ` [${requestId}]` : ''} ${msg} ${errMessage}`);
    if (stack) {
      loggerInstance.error(stack);
    }
  }
}
