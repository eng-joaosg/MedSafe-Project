import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { CommonLoggerGateway } from './common.logger';

@Injectable()
export class TimingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') return next.handle();

    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const url = req.url;
    const requestId = req.headers['x-request-id'] || '';

    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - start;
          CommonLoggerGateway.info('TimingInterceptor', 'REQUEST_DURATION', `[${requestId}] [${method}] ${url} - ${duration}ms`);
        },
        error: () => {
          const duration = Date.now() - start;
          CommonLoggerGateway.warn('TimingInterceptor', 'REQUEST_DURATION', `[${requestId}] [${method}] ${url} - ${duration}ms (erro)`);
        },
      }),
    );
  }
}
