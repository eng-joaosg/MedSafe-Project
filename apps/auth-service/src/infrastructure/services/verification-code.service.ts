import { Injectable } from '@nestjs/common';
import { IVerificationCodeService } from '../../domain/services/i-verification-code.service';

@Injectable()
export class VerificationCodeService implements IVerificationCodeService {
  private readonly EXPIRATION_SECONDS = 1800; //melhorar!!

  public generateCode(): string {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    return code;
  }

  public getShortExpirationTime(): number {
    return this.EXPIRATION_SECONDS;
  }
  public getLongExpirationTime(): number {
    return this.EXPIRATION_SECONDS * 4; //melhorar!!
  }
}
