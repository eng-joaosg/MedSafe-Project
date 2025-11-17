export interface IVerificationCodeService {
  generateCode(): string;
  getShortExpirationTime(): number;
  getLongExpirationTime(): number;
}
