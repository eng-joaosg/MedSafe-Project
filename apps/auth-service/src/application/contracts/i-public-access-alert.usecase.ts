export interface IPublicAccessAlertUseCase {
  execute(id: string): Promise<void>;
}
