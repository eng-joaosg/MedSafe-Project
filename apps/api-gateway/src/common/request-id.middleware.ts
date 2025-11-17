import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ulid } from 'ulid';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use = (req: Request, res: Response, next: NextFunction) => {
    const requestId = req.headers['x-request-id'] ?? ulid();
    req.headers['x-request-id'] = requestId;
    res.setHeader('x-request-id', requestId);
    next();
  };
}
