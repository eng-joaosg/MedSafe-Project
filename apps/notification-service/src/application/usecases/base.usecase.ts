import { Logger } from '@nestjs/common';

export abstract class BaseUseCase {
  protected readonly logger: Logger;

  constructor(context: string) {
    this.logger = new Logger(context);
  }
}
