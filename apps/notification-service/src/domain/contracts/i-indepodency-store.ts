export interface IIdempotencyStore {
  check(id: string): Promise<boolean>;
  markProcessed(id: string, type: string, version: number, payload: any): Promise<void>;
}
