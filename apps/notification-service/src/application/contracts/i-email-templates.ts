export interface IEmailTemplates {
  verificationEmail(name: string, email: string, code: string): string;
  passwordRecovery(name: string, token: string): string;
  accountCreated(name: string): string;
  publicDataAccess(name: string, accessedAt: Date): string;
}
