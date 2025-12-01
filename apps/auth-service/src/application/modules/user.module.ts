import { Module } from '@nestjs/common';
import {
  NEW_VERIFICATION_CODE_USECASE,
  REFRESH_TOKEN_USECASE,
  RESET_PASSWORD_USECASE,
  VERIFY_PASSWORD_USECASE,
} from '../../common/utils/tokens.contants';
import { RefreshTokenUseCase } from '../usecases/user/refresh-token.usecase';
import { VerifyPasswordUseCase } from '../usecases/user/verify-password.usecase';
import { NewVerificationCodeUsecase } from '../usecases/user/new-verification-code.usecase';
import { ResetPasswordUsecase } from '../usecases/user/reset-password.usecase';

@Module({
  providers: [
    {
      provide: REFRESH_TOKEN_USECASE,
      useClass: RefreshTokenUseCase,
    },
    {
      provide: VERIFY_PASSWORD_USECASE,
      useClass: VerifyPasswordUseCase,
    },
    {
      provide: NEW_VERIFICATION_CODE_USECASE,
      useClass: NewVerificationCodeUsecase,
    },
    {
      provide: RESET_PASSWORD_USECASE,
      useClass: ResetPasswordUsecase,
    },
  ],
  exports: [REFRESH_TOKEN_USECASE, VERIFY_PASSWORD_USECASE, NEW_VERIFICATION_CODE_USECASE, RESET_PASSWORD_USECASE],
})
export class UserApplicationModule {}
