import { Module } from '@nestjs/common';
import { RefreshTokenHandler } from '../handlers/user/refresh-token.handler';
import { UserApplicationModule } from '../../application/modules/user.module';
import { VerifyPasswordHandler } from '../handlers/user/verify-password.handler';
import { NewVerificationCodeHandler } from '../handlers/user/new-verification-code.handler';
import { ResetPasswordHandler } from '../handlers/user/resete-password.handler';

@Module({
  imports: [UserApplicationModule],
  providers: [RefreshTokenHandler, VerifyPasswordHandler, NewVerificationCodeHandler, ResetPasswordHandler],
  exports: [RefreshTokenHandler, VerifyPasswordHandler, NewVerificationCodeHandler, ResetPasswordHandler],
})
export class UserModule {}
