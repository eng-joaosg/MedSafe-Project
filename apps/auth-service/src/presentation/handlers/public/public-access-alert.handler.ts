import { Inject } from '@nestjs/common';
import { PUBLIC_ACCESS_ALERT_USECASE } from '../../../common/utils/tokens.contants';
import type { IPublicAccessAlertUseCase } from 'src/application/contracts/i-public-access-alert.usecase';

export class PublicAccessAlertHandler {
  constructor(
    @Inject(PUBLIC_ACCESS_ALERT_USECASE)
    private readonly usecase: IPublicAccessAlertUseCase,
  ) {}

  async execute(id: string): Promise<void> {
    await this.usecase.execute(id);
  }
}
