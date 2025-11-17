export interface IMailerService {
  sendEmail(to: string, subject: string, html: string): Promise<void>;
}
