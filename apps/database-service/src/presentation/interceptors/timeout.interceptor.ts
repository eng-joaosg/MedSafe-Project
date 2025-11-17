import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  RequestTimeoutException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  private readonly timeoutMs: number;

  constructor(private readonly configService: ConfigService) {
    const configTimeout = this.configService.get<number>('REQUEST_TIMEOUT_MS');
    this.timeoutMs = configTimeout || 7000;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      timeout(this.timeoutMs),
      catchError((err) => {
        if (err.name === 'TimeoutError') {
          throw new RequestTimeoutException(
            `A requisição excedeu o tempo limite de ${this.timeoutMs}ms.`,
          );
        }
        throw err;
      }),
    );
  }
}
