export interface INewVerificationCodeUsecase {
  execute(email: string, type: string): Promise<void>;
}
