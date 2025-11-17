import { Module } from '@nestjs/common';
import { VerificationCodeService } from '../services/verification-code.service';

@Module({
  providers: [
    {
      provide: 'IVerificationCodeService',
      useClass: VerificationCodeService,
    },
  ],
  exports: ['IVerificationCodeService'],
})
export class VerificationCodeServiceModule {}
