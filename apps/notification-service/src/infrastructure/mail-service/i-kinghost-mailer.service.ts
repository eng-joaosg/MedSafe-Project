export interface IKinghostMailerService {
  sendEmail(to: string, subject: string, html: string): Promise<void>;
}
