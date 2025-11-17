import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { CommonLogger } from 'src/common/common-logger';

@Injectable()
export class TimingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const req = context.switchToHttp().getRequest();
    const { method, url } = req;

    const start = Date.now();

    const logMessage = (duration: number, isError = false) => {
      const message = `[${method}] ${url} - ${duration}ms${isError ? ' (erro)' : ''}`;

      if (isError) {
        CommonLogger.warn('TimingInterceptor', 'REQUEST_DURATION', message);
      } else {
        CommonLogger.info('TimingInterceptor', 'REQUEST_DURATION', message);
      }
    };

    return next.handle().pipe(
      tap({
        next: () => logMessage(Date.now() - start),
        error: () => logMessage(Date.now() - start, true),
      }),
    );
  }
}
