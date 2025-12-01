export interface IVerifyPasswordUseCase {
  execute(id: string, password: string): Promise<boolean>;
}
