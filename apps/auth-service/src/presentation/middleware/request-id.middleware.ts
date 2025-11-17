import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ulid } from 'ulid';
import { RequestContextService } from 'src/common/request-context/request-context.service';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  constructor(private readonly requestContext: RequestContextService) {}

  use = (req: Request, res: Response, next: NextFunction) => {
    const requestId = req.headers['x-request-id']?.toString() || ulid();
    req.headers['x-request-id'] = requestId;

    this.requestContext.run(() => {
      this.requestContext.set('requestId', requestId);
      next();
    });
  };
}
