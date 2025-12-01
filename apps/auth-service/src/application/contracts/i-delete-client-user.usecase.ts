export interface IDeleteClientUserUseCase {
  execute(id: string, password: string): Promise<void>;
}
