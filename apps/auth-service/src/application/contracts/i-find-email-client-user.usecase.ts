export interface IFindEmailClientUserUsecase {
  execute(email: string): Promise<boolean>;
}
