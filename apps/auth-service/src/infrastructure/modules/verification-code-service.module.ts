import { Module } from '@nestjs/common';
import { VerificationCodeService } from '../services/verification-code.service';
import { VERIFICATION_CODE_SERVICE } from '../../common/utils/tokens.contants';

@Module({
  providers: [
    {
      provide: VERIFICATION_CODE_SERVICE,
      useClass: VerificationCodeService,
    },
  ],
  exports: [VERIFICATION_CODE_SERVICE],
})
export class VerificationCodeServiceModule {}
